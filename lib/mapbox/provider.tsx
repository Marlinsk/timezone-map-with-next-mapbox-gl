"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/context/map-context";
import { getUtcOffsetHours } from "../time/offset";
import { colorForOffset } from "../colors/utc-bands";
import type { FeatureCollection, Point, Polygon } from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

type MapComponentProps = {
  mapContainerRef: React.RefObject<HTMLDivElement | null>;
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  children?: React.ReactNode;
};

// 👉 Gera GeoJSON de faixas verticais com label “UTC±X” e cor pronta
function buildUtcBands(
  bounds: [[number, number], [number, number]]
): FeatureCollection<
  Polygon,
  { offset: number; label: string; color: string }
> {
  const [[minLon, minLat], [maxLon, maxLat]] = bounds;
  const features: FeatureCollection<
    Polygon,
    { offset: number; label: string; color: string }
  >["features"] = [];

  for (let off = -12; off <= 14; off++) {
    const west = Math.max(minLon, off * 15);
    const east = Math.min(maxLon, (off + 1) * 15);
    const label = off === 0 ? "UTC±0" : `UTC${off > 0 ? `+${off}` : off}`;
    features.push({
      type: "Feature",
      properties: { offset: off, label, color: colorForOffset(off) },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [west, minLat],
            [east, minLat],
            [east, maxLat],
            [west, maxLat],
            [west, minLat],
          ],
        ],
      },
    });
  }

  return { type: "FeatureCollection", features };
}

// Labels top/bottom (mantidas como você tinha)
function buildUtcBandLabelPoints(
  bounds: [[number, number], [number, number]],
  marginLat = 2
): FeatureCollection<
  Point,
  { label: string; offset: number; anchor: "top" | "bottom"; color: string }
> {
  const [[minLon, minLat], [maxLon, maxLat]] = bounds;
  const features: FeatureCollection<
    Point,
    { label: string; offset: number; anchor: "top" | "bottom"; color: string }
  >["features"] = [];

  for (let off = -12; off <= 14; off++) {
    const west = Math.max(minLon, off * 15);
    const east = Math.min(maxLon, (off + 1) * 15);
    const midLon = (west + east) / 2;
    const label = off === 0 ? "UTC±0" : `UTC${off > 0 ? `+${off}` : off}`;

    features.push(
      {
        type: "Feature",
        properties: {
          label,
          offset: off,
          anchor: "top",
          color: colorForOffset(off),
        },
        geometry: { type: "Point", coordinates: [midLon, maxLat - marginLat] },
      },
      {
        type: "Feature",
        properties: {
          label,
          offset: off,
          anchor: "bottom",
          color: colorForOffset(off),
        },
        geometry: { type: "Point", coordinates: [midLon, minLat + marginLat] },
      }
    );
  }
  return { type: "FeatureCollection", features };
}

export default function MapProvider({
  mapContainerRef,
  initialViewState,
  children,
}: MapComponentProps) {
  const map = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || map.current) return;

    const m = new mapboxgl.Map({
      container: mapContainerRef.current,
      projection: "mercator",
      style: "mapbox://styles/mapbox/light-v11",
      center: [initialViewState.longitude, initialViewState.latitude],
      zoom: initialViewState.zoom,
      attributionControl: false,
      logoPosition: "bottom-right",
      renderWorldCopies: false,
      pitchWithRotate: false,
      dragRotate: false,
    });

    m.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-left"
    );
    m.setMaxBounds([
      [-180, -60],
      [180, 85],
    ]);

    map.current = m;

    const DATA_URL = "/data/timezones.geojson"; // em /public/data

    const onStyleLoad = async () => {
      try {
        // ===== 1) Faixas UTC (underlay) =====
        const BOUNDS: [[number, number], [number, number]] = [
          [-180, -60],
          [180, 85],
        ];
        if (!m.getSource("utc-bands")) {
          const bands = buildUtcBands(BOUNDS);
          m.addSource("utc-bands", { type: "geojson", data: bands });
        }

        if (!m.getLayer("utc-bands-fill")) {
          m.addLayer(
            {
              id: "utc-bands-fill",
              type: "fill",
              source: "utc-bands",
              paint: {
                "fill-color": ["get", "color"],
                "fill-opacity": 0.06,
                "fill-opacity-transition": { duration: 200 },
              },
              maxzoom: 6,
            },
            "land-structure-line"
          );
        }

        if (!m.getSource("utc-bands-labels")) {
          const labels = buildUtcBandLabelPoints(BOUNDS, 2);
          m.addSource("utc-bands-labels", { type: "geojson", data: labels });
        }

        if (!m.getLayer("utc-bands-label")) {
          m.addLayer(
            {
              id: "utc-bands-label",
              type: "symbol",
              source: "utc-bands-labels",
              layout: {
                "symbol-placement": "point",
                "text-field": ["get", "label"],
                "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
                "text-size": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  1.5,
                  10,
                  4,
                  12,
                  6,
                  14,
                ],
                "text-allow-overlap": false,
                "text-anchor": [
                  "match",
                  ["get", "anchor"],
                  "top",
                  "top",
                  "bottom",
                ],
                "text-offset": [
                  "match",
                  ["get", "anchor"],
                  "top",
                  ["literal", [0, -0.5]],
                  ["literal", [0, 0.5]],
                ],
              },
              paint: {
                "text-color": "#111",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.25,
                "text-opacity": 0.9,
              },
              minzoom: 1.5,
              maxzoom: 6,
            },
            "airport-label"
          );
        }

        // ===== 2) Polígonos de timezone (overlay) =====
        const res = await fetch(DATA_URL);
        if (!res.ok)
          throw new Error(`Falha ao baixar ${DATA_URL} (HTTP ${res.status})`);
        const raw = await res.json();
        const now = new Date();

        const geojson = {
          ...raw,
          features: raw.features.map((f: any) => {
            const tzid = f.properties?.tzid ?? "";
            const off = getUtcOffsetHours(tzid, now); // pode ser 5.5, 9.75...
            const utcHour = Math.round(off);

            // 🔹 heurística simples para oceano (funciona com evansiroky):
            //   - Zonas do mar geralmente são "Etc/GMT±N"
            //   - Mantemos só land como forte
            const isOcean =
              typeof tzid === "string" &&
              (tzid.startsWith("Etc/") || tzid.includes("Ocean"));

            const color = colorForOffset(utcHour);

            return {
              ...f,
              properties: {
                ...f.properties,
                utcOffset: off,
                utcHour,
                isOcean, // 👈 novo campo boolean
                color,
              },
            };
          }),
        };

        if (!m.getSource("timezones")) {
          m.addSource("timezones", { type: "geojson", data: geojson });
        }

        if (!m.getLayer("tz-fill")) {
          m.addLayer(
            {
              id: "tz-fill",
              type: "fill",
              source: "timezones",
              paint: {
                "fill-color": ["get", "color"],
                "fill-opacity": 0.24,
                "fill-antialias": true,
                // 🔹 suaviza transições de hover
                "fill-opacity-transition": { duration: 300 },
              },
            },
            "waterway-label"
          );
        }

        if (!m.getLayer("tz-line")) {
          m.addLayer(
            {
              id: "tz-line",
              type: "line",
              source: "timezones",
              paint: {
                "line-color": ["coalesce", ["get", "color"], "#9ca3af"],
                "line-opacity": 0.85,
                "line-width": 0.8,
                "line-blur": 0.2,
              },
            },
            "waterway-label"
          );
        }

        // ===== 3) Layers de highlight para foco na UTC sob o mouse =====
        if (!m.getLayer("tz-fill-highlight")) {
          m.addLayer(
            {
              id: "tz-fill-highlight",
              type: "fill",
              source: "timezones",
              filter: ["==", ["get", "utcHour"], 9999],
              paint: {
                "fill-color": ["get", "color"],
                "fill-opacity": 0.55,
                "fill-opacity-transition": { duration: 300 },
              },
            },
            "tz-line"
          );
        }

        if (!m.getLayer("tz-line-highlight")) {
          m.addLayer(
            {
              id: "tz-line-highlight",
              type: "line",
              source: "timezones",
              filter: ["==", ["get", "utcHour"], 9999],
              paint: {
                "line-color": ["get", "color"],
                "line-opacity": 1,
                "line-width": 1.6,
              },
            },
            "tz-fill-highlight"
          );
        }

        // ===== 4) Focus mode no hover das faixas (tipagem v3) =====
        function tzFillOpacityExpr(activeOffset: number | null): any {
          // sem hover → opacidade padrão em LAND; oceano sempre baixo
          if (activeOffset === null) {
            return [
              "case",
              ["==", ["get", "isOcean"], true],
              0.06, // oceano: sempre fraco
              0.24, // terra: base
            ];
          }

          // com hover → só TERRA da UTC ativa fica forte; resto fraco
          return [
            "case",
            [
              "all",
              ["==", ["get", "utcHour"], activeOffset],
              ["==", ["get", "isOcean"], false], // só land
            ],
            0.55, // terra da UTC ativa
            0.06, // tudo o resto (inclui ocean)
          ];
        }

        let currentHoverOffset: number | null = null;

        const applyFocus = (off: number | null) => {
          const noSel = ["==", ["get", "utcHour"], 9999] as any;
          const onlyLandThisUTC = [
            "all",
            ["==", ["get", "utcHour"], off],
            ["==", ["get", "isOcean"], false],
          ] as any;

          m.setFilter(
            "tz-fill-highlight",
            off === null ? noSel : onlyLandThisUTC
          );
          m.setFilter(
            "tz-line-highlight",
            off === null ? noSel : onlyLandThisUTC
          );

          m.setPaintProperty("tz-fill", "fill-opacity", tzFillOpacityExpr(off));
        };

        // 🔹 handler usando o tipo correto do v3
        const onMove = (e: mapboxgl.MapLayerMouseEvent) => {
          const off = Number(e.features?.[0]?.properties?.offset);
          if (!Number.isFinite(off)) return;

          if (off !== currentHoverOffset) {
            currentHoverOffset = off;
            applyFocus(off);
            m.getCanvas().style.cursor = "pointer";
          }
        };

        const onLeave = (_e: mapboxgl.MapLayerMouseEvent) => {
          currentHoverOffset = null;
          applyFocus(null);
          m.getCanvas().style.cursor = "";
        };

        // registre/desregistre nos eventos da LAYER (não no mapa inteiro)
        m.on("mousemove", "utc-bands-fill", onMove);
        m.on("mouseleave", "utc-bands-fill", onLeave);

        // tudo pronto
        m.once("idle", () => setReady(true));

        // cleanup dos handlers/layers extras quando o estilo recarregar
        m.once("styledata", () => {
          m.off("mousemove", onMove);
          m.off("mouseleave", "utc-bands-fill", onLeave);
        });
      } catch (e) {
        console.error("[MapProvider] Erro carregando timezones/UTC bands:", e);
        setReady(true);
      }
    };

    if (m.isStyleLoaded()) onStyleLoad();
    else m.once("load", onStyleLoad);

    return () => {
      if (map.current) {
        // remova listeners do hover
        // (se o estilo já foi trocado, eles podem ter sido desregistrados)
        try {
          map.current.off("mousemove", () => {});
          map.current.off("mouseleave", "utc-bands-fill", () => {});
        } catch {}

        if (m.getLayer("tz-line-highlight")) m.removeLayer("tz-line-highlight");
        if (m.getLayer("tz-fill-highlight")) m.removeLayer("tz-fill-highlight");
        if (m.getLayer("tz-line")) m.removeLayer("tz-line");
        if (m.getLayer("tz-fill")) m.removeLayer("tz-fill");
        if (m.getSource("timezones")) m.removeSource("timezones");

        if (m.getLayer("utc-bands-label")) m.removeLayer("utc-bands-label");
        if (m.getLayer("utc-bands-fill")) m.removeLayer("utc-bands-fill");
        if (m.getSource("utc-bands-labels")) m.removeSource("utc-bands-labels");
        if (m.getSource("utc-bands")) m.removeSource("utc-bands");

        map.current.remove();
        map.current = null;
      }
    };
  }, [initialViewState, mapContainerRef]);

  return (
    <div className="z-[1000]">
      <MapContext.Provider value={{ map: map.current! }}>
        {children}
      </MapContext.Provider>

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
          <div className="text-lg font-medium">Loading map…</div>
        </div>
      )}
    </div>
  );
}
