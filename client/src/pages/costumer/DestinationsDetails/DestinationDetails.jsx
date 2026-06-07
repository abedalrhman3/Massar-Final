import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Destination.module.css";
import MapView from "./MapView/MapView";
import LeftPanel from "./LeftPanel/LeftPanel";
import RightPanel from "./RightPanel/RightPanel";
import SharePopup from "./SharePopup/SharePopup";

import { getDestination, getDestinationDetails } from "@/api/destination";
import { placesApi, restaurantsApi, hotelsApi } from "@/api/listings";
import { getEvents } from "@/api/events";
import { getSavedItems } from "@/api/saved";
import { buildComposed } from "./DestinationDetails.utils";

// The controller returns populated items: { _id, entityType, entity: { _id, ... } }
// Build a lookup: entity._id → savedItem._id
function buildSavedMap(savedItems) {
    const map = {};
    for (const item of savedItems) {
        const entityId = item.entity?._id ?? item.entityId;
        if (entityId) map[String(entityId)] = String(item._id);
    }
    return map;
}

function attachSavedId(entities, savedMap) {
    return entities.map((e) => {
        const id = String(e._id);
        return savedMap[id] ? { ...e, savedId: savedMap[id] } : e;
    });
}

const DestinationDetails = () => {
    const { slug } = useParams();
    const [selectedCard, setSelectedCard] = useState(null);
    const [showShare, setShowShare] = useState(false);

    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) return;

        const fetchDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch destination metadata by slug
                const destRes = await getDestination(slug);
                const dest = destRes.data?.data;
                if (!dest) {
                    setError("Destination not found.");
                    setDestination(null);
                    return;
                }
                const destId = dest._id;

                // 2. Fetch everything in parallel
                const [detailsRes, placesRes, restaurantsRes, hotelsRes, eventsRes, savedRes] = await Promise.all([
                    getDestinationDetails(destId).catch((err) => {
                        console.warn("Details fetch failed, using fallback:", err);
                        return { data: { data: null } };
                    }),
                    placesApi.getAll({ destinationId: destId }).catch((err) => {
                        console.error("Places fetch failed:", err);
                        return { data: { data: [] } };
                    }),
                    restaurantsApi.getAll({ destinationId: destId }).catch((err) => {
                        console.error("Restaurants fetch failed:", err);
                        return { data: { data: [] } };
                    }),
                    hotelsApi.getAll({ destinationId: destId }).catch((err) => {
                        console.error("Hotels fetch failed:", err);
                        return { data: { data: [] } };
                    }),
                    getEvents({ destinationId: destId }).catch((err) => {
                        console.error("Events fetch failed:", err);
                        return { data: { data: [] } };
                    }),
                    getSavedItems().catch((err) => {
                        if (err.response?.status !== 401) {
                            console.warn("Saved items fetch failed:", err);
                        }
                        return { data: { data: [] } };
                    }),
                ]);

                const details = detailsRes.data?.data;
                const places = placesRes.data?.data || [];
                const restaurants = restaurantsRes.data?.data || [];
                const hotels = hotelsRes.data?.data || [];
                const events = eventsRes.data?.data || [];
                const savedItems = savedRes.data?.data || [];

                // 3. Build savedMap and enrich each entity
                const savedMap = buildSavedMap(savedItems);

                const enrichedPlaces = attachSavedId(places, savedMap);
                const enrichedRestaurants = attachSavedId(restaurants, savedMap);
                const enrichedHotels = attachSavedId(hotels, savedMap);
                const enrichedEvents = attachSavedId(events, savedMap);

                const destSavedId = savedMap[String(destId)] ?? null;
                const enrichedDest = destSavedId ? { ...dest, savedId: destSavedId } : dest;

                // 4. Compose
                const composed = buildComposed(
                    enrichedDest,
                    details,
                    enrichedPlaces,
                    enrichedRestaurants,
                    enrichedHotels,
                    enrichedEvents
                );

                setDestination(composed);
            } catch (err) {
                console.error("Error loading destination details:", err);
                setError("Failed to load destination details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [slug]);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!destination) return <div className={styles.notFound}>Data not found</div>;

    return (
        <main className={styles.main}>
            {showShare && (
                <SharePopup
                    onClose={() => setShowShare(false)}
                    shareUrl={window.location.href}
                    shareTitle={`Check out ${destination.name}!`}
                />
            )}
            <MapView
                lat={destination.lat}
                lng={destination.lng}
                name={destination.name}
                selectedCard={selectedCard}
            />
            <LeftPanel
                data={destination}
                onCardClick={setSelectedCard}
                onShareClick={() => setShowShare(true)}
            />
            {selectedCard && (
                <RightPanel
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                />
            )}
        </main>
    );
};

export default DestinationDetails;