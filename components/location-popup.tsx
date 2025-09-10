import { LocationFeature } from "@/lib/mapbox/utils";
import Popup from "./map/map-popup";

type LocationPopupProps = {
  location: LocationFeature;
  onClose?: () => void;
};

export function LocationPopup({ location, onClose }: LocationPopupProps) {
  if (!location) return null;

  const { properties, geometry } = location;

  const lat = geometry?.coordinates?.[1] || properties?.coordinates?.latitude;
  const lng = geometry?.coordinates?.[0] || properties?.coordinates?.longitude;

  return (
    <Popup
      latitude={lat}
      longitude={lng}
      onClose={onClose}
      offset={15}
      closeButton={true}
      closeOnClick={false}
      className="location-popup"
      focusAfterOpen={false}
    >
      <div className="w-[120px]"><p>Hello World</p></div>
    </Popup>
  )
}