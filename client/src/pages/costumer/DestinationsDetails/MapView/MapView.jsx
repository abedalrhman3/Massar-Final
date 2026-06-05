import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import styles from "./MapView.module.css";

// Fallback centre (Amman, Jordan) when coordinates are missing
const FALLBACK = [31.9539, 35.9106];

const MapView = ({ lat, lng, name }) => {
    const hasCoords = typeof lat === "number" && typeof lng === "number"
        && !isNaN(lat) && !isNaN(lng);

    const position = hasCoords ? [lat, lng] : FALLBACK;

    return (
        <MapContainer
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