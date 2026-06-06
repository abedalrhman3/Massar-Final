import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
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

const FALLBACK = [31.9539, 35.9106];
const LEFT_PANEL_WIDTH = 700;

const MapController = ({ position }) => {
    const map = useMap();

    useEffect(() => {

        const point = L.latLng(position[0], position[1]);

        map.setView(point, 11);

        // Offset the center to account for left panel
        const targetPoint = map.project(point, 11);
        const offsetPoint = targetPoint.subtract([LEFT_PANEL_WIDTH / 2, 0]);
        const offsetLatLng = map.unproject(offsetPoint, 11);

        map.setView(offsetLatLng, 11, { animate: true, duration: 1 });
    }, [position[0], position[1]]);

    return null;
};

const MapView = ({ lat, lng, name }) => {
    const hasCoords =
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng);

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
            <MapController position={position} />
            {hasCoords && (
                <Marker position={position}>
                    <Popup>{name}</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapView;