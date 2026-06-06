import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import styles from "./MapView.module.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const FALLBACK = [31.9539, 35.9106];
const LEFT_PANEL_WIDTH = 420;

// ── Center offset controller ───────────────────────────────────────────────
const MapController = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        const point = L.latLng(position[0], position[1]);
        map.setView(point, 11);
        const targetPoint = map.project(point, 11);
        const offsetPoint = targetPoint.subtract([LEFT_PANEL_WIDTH / 2, 0]);
        const offsetLatLng = map.unproject(offsetPoint, 11);
        map.setView(offsetLatLng, 11, { animate: true, duration: 1 });
    }, [position[0], position[1]]);

    return null;
};

// ── Routing controller ─────────────────────────────────────────────────────
const RoutingController = ({ from, to }) => {
    const map = useMap();
    const routingRef = useRef(null);

    useEffect(() => {
        if (routingRef.current) {
            map.removeControl(routingRef.current);
            routingRef.current = null;
        }

        if (!from || !to) return;

        routingRef.current = L.Routing.control({
            waypoints: [
                L.latLng(from[0], from[1]),
                L.latLng(to[0], to[1]),
            ],
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1",
                profile: "driving",
            }),
            lineOptions: {
                styles: [{ color: "#4f86f7", weight: 5, opacity: 0.8 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: false,
        }).addTo(map);

        routingRef.current.on("routesfound", (e) => {
            const routes = e.routes;
            if (!routes || routes.length === 0) return;

            const bounds = L.latLngBounds(
                routes[0].coordinates.map((c) => [c.lat, c.lng])
            );

            // Distance in km
            const distanceKm = (routes[0].summary.totalDistance || 0) / 1000;

            // The longer the route, the less padding we need
            // Short (<5km): full padding to keep it zoomed in nicely
            // Long (>50km): minimal padding so the route fits on screen
            const leftPad = distanceKm < 5
                ? LEFT_PANEL_WIDTH + 800
                : distanceKm < 20
                    ? LEFT_PANEL_WIDTH + 400
                    : distanceKm < 50
                        ? LEFT_PANEL_WIDTH + 100
                        : LEFT_PANEL_WIDTH + 20;

            const bottomRightPad = distanceKm < 5
                ? 350
                : distanceKm < 20
                    ? 300
                    : distanceKm < 50
                        ? 200
                        : 100;

            map.fitBounds(bounds, {
                paddingTopLeft: [leftPad, 20],
                paddingBottomRight: [400, bottomRightPad],
                animate: true,
                duration: 1,
            });
        });

        return () => {
            if (routingRef.current) {
                map.removeControl(routingRef.current);
                routingRef.current = null;
            }
        };
    }, [from, to]);

    return null;
};

// ── Main component ─────────────────────────────────────────────────────────
const MapView = ({ lat, lng, name, selectedCard }) => {
    const hasCoords =
        typeof lat === "number" &&
        typeof lng === "number" &&
        !isNaN(lat) &&
        !isNaN(lng);

    const position = hasCoords ? [lat, lng] : FALLBACK;

    // Extract selected card coordinates from raw item
    const cardCoords = (() => {
        const c = selectedCard?._rawItem?.location?.coordinates;
        // DB stores [lng, lat] — reverse for Leaflet [lat, lng]
        return c && c.length === 2 ? [c[1], c[0]] : null;
    })();

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

            {/* Route — only when a card with coords is selected */}
            {hasCoords && cardCoords && (
                <RoutingController from={position} to={cardCoords} />
            )}

            {/* Destination marker */}
            {hasCoords && (
                <Marker position={position}>
                    <Popup>{name}</Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapView;