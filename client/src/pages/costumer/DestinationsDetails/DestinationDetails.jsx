import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import styles from "./Destination.module.css"
import MapView from "./MapView/MapView"
import LeftPanel from "./LeftPanel/LeftPanel"
import RightPanel from "./RightPanel/RightPanel"
import SharePopup from "./SharePopup/SharePopup"

// ============================================================
// MOCK DATA — replace with backend import or API call later
// ============================================================
import mockData from "@/assets/data/mockData.js"

const DestinationDetails = () => {
    console.log(mockData)
    const { id } = useParams()
    const [selectedCard, setSelectedCard] = useState(null)
    const [showShare, setShowShare] = useState(false)

    // ============================================================
    // BACKEND — fetch destination by id from your API
    // replace mockData with the response data
    // example:
    // const [destination, setDestination] = useState(null)
    // useEffect(() => {
    //     fetch(`/api/destinations/${id}`)
    //         .then(res => res.json())
    //         .then(data => setDestination(data))
    // }, [id])
    // ============================================================
    const destination = mockData

    return (
        <main className={styles.main}>
            {showShare && (
                <SharePopup
                    onClose={() => setShowShare(false)}
                    shareUrl={window.location.href}
                    shareTitle={`Check out ${mockData.name}!`}
                />
            )}
            {/* BACKEND — pass real coordinates from destination data to MapView */}
            <MapView lat={destination.lat} lng={destination.lng} name={destination.name} />
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
    )
}

export default DestinationDetails