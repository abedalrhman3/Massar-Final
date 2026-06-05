import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is imported
import styles from "./Destination.module.css";
import MapView from "./MapView/MapView";
import LeftPanel from "./LeftPanel/LeftPanel";
import RightPanel from "./RightPanel/RightPanel";
import SharePopup from "./SharePopup/SharePopup";

const DestinationDetails = () => {
    const { id } = useParams();
    const [selectedCard, setSelectedCard] = useState(null);
    const [showShare, setShowShare] = useState(false);

    // New states for real data
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                // Adjust this URL to match your backend exactly
                const res = await axios.get(`http://localhost:5000/api/destinations/details/${id}`);
                setDestination(res.data);
            } catch (err) {
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!destination) return <div>Data not found</div>;

    return (
        <main className={styles.main}>
            {showShare && (
                <SharePopup
                    onClose={() => setShowShare(false)}
                    shareUrl={window.location.href}
                    shareTitle={`Check out ${destination.name}!`}
                />
            )}
            <MapView lat={destination.lat} lng={destination.lng} name={destination.name} />
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