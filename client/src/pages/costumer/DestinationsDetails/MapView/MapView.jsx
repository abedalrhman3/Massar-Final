import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import styles from "./MapView.module.css"

const MapView = ({ lat, lng, name }) => {
    const position = [lat, lng]

    return (
        <MapContainer
            center={position}
            zoom={11}
            className={styles["map-view"]}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
            />
            <Marker position={position}>
                <Popup>{name}</Popup>
            </Marker>
        </MapContainer>
    )
}

export default MapView