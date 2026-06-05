import { useState, useRef, useEffect } from "react"
import styles from "./LeftPanel.module.css"
import Card from "./Card/Card"
import CommentSection from "./CommentSection/Comment"
import { toggleLikeDestination } from "@/api/destination";
import { useNavigate } from "react-router-dom";

//Icons
import { Share2, Heart, MessageSquareMore, MapPin, Clock, Calendar, CircleDollarSign, ArrowUp, ArrowLeft, Map } from "lucide-react";


// how many cards to show before "show more"
const INITIAL_SHOW = 3

const LeftPanel = ({ data, onCardClick, onShareClick }) => {
    const navigate = useNavigate()
    // show more state for each card section
    const [showAllPlaces, setShowAllPlaces] = useState(false)
    const [showAllRestaurants, setShowAllRestaurants] = useState(false)
    const [showAllDishes, setshowAllDishes] = useState(false)
    const [showAllHotels, setShowAllHotels] = useState(false)
    const [showAllEvents, setShowAllEvents] = useState(false)
    const [isLiked, setIsLiked] = useState(data.isLiked ?? false)

    useEffect(() => {
        setIsLiked(data.isLiked ?? false);
    }, [data.id, data.isLiked]);

    const handleLikeClick = async () => {
        try {
            const newLikedState = !isLiked;
            setIsLiked(newLikedState);

            const response = await toggleLikeDestination(data.id);
            if (response.data && typeof response.data.isLiked === 'boolean') {
                setIsLiked(response.data.isLiked);
            }
        } catch (err) {
            console.error("Failed to toggle like:", err);
            setIsLiked(isLiked); // Rollback
            if (err.response?.status === 401) {
                alert("Please log in to like this destination.");
            }
        }
    };

    const commentSectionRef = useRef(null)
    const leftPanelRef = useRef(null)

    function scrollToComments() {
        const panel = leftPanelRef.current
        const section = commentSectionRef.current

        console.log("panel:", panel)
        console.log("section:", section)

        if (!panel || !section) return

        const panelTop = panel.getBoundingClientRect().top
        const sectionTop = section.getBoundingClientRect().top

        console.log("scrolling to:", panel.scrollTop + (sectionTop - panelTop))

        panel.scrollTo({
            top: panel.scrollTop + (sectionTop - panelTop),
            behavior: "smooth"
        })
    }


    const { sections } = data

    return (
        <div className={styles["left-panel-wrapper"]}>
            <div
                className={styles["left-panel"]}
                ref={leftPanelRef}
            >

            {/* ── HERO ── */}
            <div className={styles.hero}>
                {/* BACKEND — replace src with data.heroImage from API */}
                <img src={data.imageURL} alt={data.name} className={styles["hero-img"]} />
                <div className={styles["hero-overlay"]} />
                <div className={styles["hero-bottom"]}>
                    <div>
                        <h1 className={styles["hero-title"]}>{data.name}</h1>
                        <p className={styles["hero-subtitle"]}>{data.title}</p>
                    </div>
                    <div className={styles["hero-actions"]}>
                        {/* BACKEND — wire save to POST /api/saved, share uses navigator.share */}
                        <button
                            className={`${styles["hero-action-btn"]} ${isLiked ? styles["heart-active"] : ""}`}
                            onClick={handleLikeClick}
                            title="Like"
                        >
                            <Heart size={20} />
                        </button>
                        <button
                            className={styles["hero-action-btn"]}
                            title="Comment"
                            onClick={scrollToComments}
                        >
                            <MessageSquareMore size={20} />
                        </button>
                        <button
                            className={`${styles["hero-action-btn"]}`}
                            title="Share"
                            onClick={onShareClick}
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── SECTIONS ── */}
            <div className={styles["sections-container"]}>

                {/* ── OVERVIEW ── */}
                <section className={styles.section}>
                    <h2
                        className={styles["section-title"]}
                    >
                        {sections.overview.title}
                    </h2>
                    <div>
                        <p className={styles["section-text"]}>{sections.overview.description}</p>
                        <ul className={styles["info-list"]}>
                            <li><span className={styles["info-name"]}><MapPin size={15} /> Location</span><span>{sections.overview.location}</span></li>
                            <li><span className={styles["info-name"]}><Clock size={15} /> Recommended Stay</span><span>{sections.overview.recommendedStay}</span></li>
                            <li><span className={styles["info-name"]}><Calendar size={15} /> Best Season</span><span>{sections.overview.bestSeason}</span></li>
                            <li><span className={styles["info-name"]}> <CircleDollarSign size={15} />Average Cost</span><span>{sections.overview.averageCost}</span></li>
                        </ul>
                    </div>
                </section>

                {/* ── ACTIVITIES ── */}
                <section className={styles.section}>
                    <h2
                        className={styles["section-title"]}
                    >
                        {sections.activities.title}
                    </h2>
                    <ul className={styles["activities-list"]}>
                        {sections.activities.list.map((activity, i) => (
                            <li key={i}>{activity}</li>
                        ))}
                    </ul>
                </section>

                {/* ── TRAVEL GUIDE ── */}
                <section className={styles.section}>
                    <h2
                        className={styles["section-title"]}
                    >
                        {sections.travelGuide.subTitle}
                    </h2>

                    <div className={styles["guide-list"]}>
                        {sections.travelGuide.list.map((item, i) => (
                            <div key={i} className={styles["guide-item"]}>
                                <h3>{item.subTitle}</h3>
                                {Array.isArray(item.body) ? (
                                    <ul>
                                        {item.body.map((entry, j) =>
                                            typeof entry === "string" ? (
                                                <li key={j}>{entry}</li>
                                            ) : (
                                                <li key={j} className={styles["budget-row"]}>
                                                    <span>{entry.subTitle}</span>
                                                    <span>{entry.cost}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                ) : (
                                    <p>{item.body}</p>
                                )}
                            </div>
                        ))}
                    </div>

                </section>

                {/* ── PLACES TO VISIT ── */}
                <section className={styles.section}>
                    <h2
                        className={styles["section-title"]}
                    >
                        {sections.placesToVisit.title}
                    </h2>

                    <>
                        <div className={styles["cards-list"]}>
                            {sections.placesToVisit.placesList
                                .slice(0, showAllPlaces ? undefined : INITIAL_SHOW)
                                .map((place, i) => (
                                    <Card
                                        key={place.id}
                                        data={place}
                                        type="place"
                                        number={i + 1}
                                        onClick={() => onCardClick(place)}
                                    />
                                ))}
                        </div>
                        {sections.placesToVisit.placesList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button
                                    className={styles["show-more"]}
                                    onClick={() => setShowAllPlaces(p => !p)}
                                >
                                    {showAllPlaces ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </>

                </section>

                {/* ── FOOD AND DINING ── */}
                <section className={styles.section}>
                    <h2
                        className={styles["section-title"]}
                    >
                        Food and Dining
                    </h2>

                    <>
                        {/* RESTAURANTS */}
                        {sections.foodAndDining.restaurants.isAvailable && (
                            <div className={styles.subsection}>
                                <h3>{sections.foodAndDining.restaurants.subTitle}</h3>
                                <div className={styles["cards-list"]}>
                                    {sections.foodAndDining.restaurants.cardList
                                        .slice(0, showAllRestaurants ? undefined : INITIAL_SHOW)
                                        .map((r, i) => (
                                            <Card
                                                key={r.id}
                                                data={r}
                                                type="restaurant"
                                                number={i + 1}
                                                onClick={() => onCardClick(r)}
                                            />
                                        ))}
                                </div>
                                {sections.foodAndDining.restaurants.cardList.length > INITIAL_SHOW && (
                                    <div className={styles["show-more-container"]}>
                                        <button
                                            className={styles["show-more"]}
                                            onClick={() => setShowAllRestaurants(p => !p)}
                                        >
                                            {showAllRestaurants ? "Show less" : "Show more"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TRADITIONAL DINING */}
                        {/* traditionalDining cards have no details so onClick is disabled */}
                        {sections.foodAndDining.traditionalDining.isAvailable && (
                            <div className={styles.subsection}>
                                <h3>{sections.foodAndDining.traditionalDining.subTitle}</h3>
                                <div className={styles["cards-list"]}>
                                    {sections.foodAndDining.traditionalDining.cardList
                                        .slice(0, showAllDishes ? undefined : INITIAL_SHOW)
                                        .map((dish, i) => (
                                            <Card
                                                key={dish.id}
                                                data={dish}
                                                type="restaurant"
                                                number={i + 1}
                                                onClick={() => onCardClick(dish)}
                                            />
                                        ))}
                                </div>
                                {sections.foodAndDining.traditionalDining.cardList.length > INITIAL_SHOW && (
                                    <div className={styles["show-more-container"]}>
                                        <button
                                            className={styles["show-more"]}
                                            onClick={() => setshowAllDishes(p => !p)}
                                        >
                                            {showAllDishes ? "Show less" : "Show more"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>

                </section>

                {/* ── HOTELS ── */}
                <section className={styles.section}>
                    <h2
                        className={styles["section-title"]}
                    >
                        {sections.hotels.title || "Hotels"}
                    </h2>

                    <>
                        <div className={styles["cards-list"]}>
                            {sections.hotels.cardList
                                .slice(0, showAllHotels ? undefined : INITIAL_SHOW)
                                .map((hotel, i) => (
                                    <Card
                                        key={hotel.id}
                                        data={hotel}
                                        type="hotel"
                                        number={i + 1}
                                        onClick={() => onCardClick(hotel)}
                                    />
                                ))}
                        </div>
                        {sections.hotels.cardList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button
                                    className={styles["show-more"]}
                                    onClick={() => setShowAllHotels(p => !p)}
                                >
                                    {showAllHotels ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </>

                </section>

                {/* ── EVENTS ── */}
                <section className={styles.section}>
                    <h2
                        className={styles["section-title"]}
                    >
                        {sections.events.title || "Events"}
                    </h2>

                    <>
                        <div className={styles["cards-list"]}>
                            {sections.events.cardList
                                .slice(0, showAllEvents ? undefined : INITIAL_SHOW)
                                .map((event, i) => (
                                    <Card
                                        key={event.id}
                                        data={event}
                                        type="event"
                                        number={i + 1}
                                        onClick={() => onCardClick(event)}
                                    />
                                ))}
                        </div>
                        {sections.events.cardList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button
                                    className={styles["show-more"]}
                                    onClick={() => setShowAllEvents(p => !p)}
                                >
                                    {showAllEvents ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </>
                </section>
                {/* ── COMMENTS ── */}
                <CommentSection
                    placeId={data.id}
                    ref={commentSectionRef}
                />
            </div> {/* closes sections-container */}
        </div> {/* closes left-panel */}

        <button className={styles.upBtn} onClick={() => {
            if (leftPanelRef.current) {
                leftPanelRef.current.scrollTo({ top: 0, behavior: "smooth" })
            }
        }} aria-label="Scroll to top">
            <ArrowUp size={24} />
        </button>
        <button className={styles.backBtn} onClick={() => {
            navigate("/destinations")
        }} aria-label="Back to destinations">
            <ArrowLeft size={24} />
        </button>
        <button className={styles.openMapBtn} onClick={() => {
            navigate("/map", { state: { lat: data.lat, lng: data.lng, name: data.name } })
        }} aria-label="Open Map">
            <Map size={18} /> Open Map
        </button>
    </div>
)
}

export default LeftPanel