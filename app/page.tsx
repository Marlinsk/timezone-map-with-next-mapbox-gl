"use client"

import React from "react";

import MapProvider from "@/lib/mapbox/provider";
import MapCotrols from "@/components/map/map-controls";
// import TimezonesLayer from "@/components/timezones-layer";
// import CitiesLayer from "@/components/cities-layer";

export default function Home() {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className="w-screen h-screen">
      <div
        id="map-container"
        ref={mapContainerRef}
        className="absolute inset-0 h-full w-full"
      />
      <MapProvider
        mapContainerRef={mapContainerRef}
        initialViewState={{
          longitude: -122.4194,
          latitude: 37.7749,
          zoom: 10,
        }}
      >
        {/* <TimezonesLayer /> */}
        {/* <CitiesLayer /> */}
        {/* <MapCotrols /> */}
      </MapProvider>
    </div>
  );
}
