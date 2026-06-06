import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Destination.module.css";
import MapView from "./MapView/MapView";
import LeftPanel from "./LeftPanel/LeftPanel";
import RightPanel from "./RightPanel/RightPanel";
import SharePopup from "./SharePopup/SharePopup";

// API and composer utility imports
import { getDestination, getDestinationDetails } from "@/api/destination";
import { placesApi, restaurantsApi, hotelsApi } from "@/api/listings";
import { getEvents } from "@/api/events";
import { buildComposed } from "./DestinationDetails.utils";

const DestinationDetails = () => {
    const { slug } = useParams();
    const [selectedCard, setSelectedCard] = useState(null);
    const [showShare, setShowShare] = useState(false);

    // Composed destination state
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!slug) return;

        const fetchDetails = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Fetch the destination metadata by slug
                const destRes = await getDestination(slug);
                const dest = destRes.data?.data;
                if (!dest) {
                    setError("Destination not found.");
                    setDestination(null);
                    return;
                }
                const destId = dest._id;

                // 2. Fetch details and listings in parallel
                const [detailsRes, placesRes, restaurantsRes, hotelsRes, eventsRes] = await Promise.all([
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
                    })
                ]);

                const details = detailsRes.data?.data;
                const places = placesRes.data?.data || [];
                const restaurants = restaurantsRes.data?.data || [];
                const hotels = hotelsRes.data?.data || [];
                const events = eventsRes.data?.data || [];

                // 3. Compose using buildComposed
                const composed = buildComposed(dest, details, places, restaurants, hotels, events);
                console.log("Composed Destination Data:", composed);
                console.log("Extracted coordinates:", { lat: composed.lat, lng: composed.lng });
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
                data={destination} // Pass the live 'destination' object
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