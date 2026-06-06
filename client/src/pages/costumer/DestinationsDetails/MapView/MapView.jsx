import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import styles from "./MapView.module.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Fallback centre (Amman, Jordan) when coordinates are missing
const FALLBACK = [31.9539, 35.9106];

const MapView = ({ lat, lng, name }) => {
    const hasCoords = typeof lat === "number" && typeof lng === "number"
        && !isNaN(lat) && !isNaN(lng);

    const position = hasCoords ? [lat, lng] : FALLBACK;

    return (
        <MapContainer
            key={`${position[0]}-${position[1]}`}
            center={position}
            zoom={11}
            className={styles["map-view"]}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            {hasCoords && (
                <Marker position={position}>
                    <Popup>{name}</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapView;