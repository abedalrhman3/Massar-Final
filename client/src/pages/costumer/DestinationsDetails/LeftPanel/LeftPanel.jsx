import { useState, useRef } from "react"
import styles from "./LeftPanel.module.css"
import Card from "./Card/Card"

// Icons
import { Share2, Heart, MapPin, Clock, Calendar, CircleDollarSign } from "lucide-react";

// How many cards to show before "show more" triggers
const INITIAL_SHOW = 3

const LeftPanel = ({ data, onCardClick, onShareClick, onSaveClick, isSaved }) => {
    // ─── SAFE LIVE DATA EXTRACTION ───────────────────────────────────────────
    const destinationInfo = data?.destination || {};
    const sections = data?.sections || {};

    const placesList = sections.placesToVisit?.placesList || [];
    const restaurantsList = sections.foodAndDining?.restaurants?.cardList || [];
    const dishesList = sections.foodAndDining?.traditionalDining?.cardList || [];
    const hotelsList = sections.hotels?.cardList || [];
    const eventsList = sections.events?.cardList || [];

    // show more states for each card section
    const [showAllPlaces, setShowAllPlaces] = useState(false)
    const [showAllRestaurants, setShowAllRestaurants] = useState(false)
    const [showAllDishes, setShowAllDishes] = useState(false)
    const [showAllHotels, setShowAllHotels] = useState(false)
    const [showAllEvents, setShowAllEvents] = useState(false)

    const leftPanelRef = useRef(null)

    // Helper to calculate runtime slice visibility arrays
    const getVisibleItems = (list, showAll) => {
        if (!list || !Array.isArray(list)) return [];
        if (showAll) return list;
        return list.slice(0, INITIAL_SHOW);
    }

    return (
        <div className={styles["left-panel"]} ref={leftPanelRef}>
            {/* ─── HERO HEADER ─── */}
            <header className={styles.header}>
                <div className={styles["image-wrapper"]}>
                    <img
                        src={destinationInfo.image || "/images/placeholder.png"}
                        alt={destinationInfo.name || "Destination"}
                        className={styles.image}
                    />
                </div>
                <div className={styles["header-overlay"]}>
                    <div className={styles["header-top"]}>
                        <h1 className={styles["destination-name"]}>{destinationInfo.name || "Loading..."}</h1>
                        <div className={styles.actions}>
                            <button className={styles["action-btn"]} onClick={onShareClick} aria-label="Share">
                                <Share2 size={20} />
                            </button>
                            <button
                                className={`${styles["action-btn"]} ${isSaved ? styles["liked"] : ""}`}
                                onClick={onSaveClick}
                                aria-label="Save Destination"
                            >
                                <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                            </button>
                        </div>
                    </div>
                    <div className={styles["location-wrapper"]}>
                        <MapPin size={16} />
                        <p className={styles.location}>{destinationInfo.location || ""}</p>
                    </div>
                </div>
            </header>

            {/* ─── BODY PANEL SECTIONS ─── */}
            <div className={styles["panel-body"]}>

                {/* ─── OVERVIEW ─── */}
                {sections.overview && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.overview.title}</h2>
                        <p className={styles.description}>{sections.overview.description}</p>
                        <div className={styles["overview-grid"]}>
                            <div className={styles["overview-item"]}>
                                <Clock size={18} />
                                <div>
                                    <p className={styles["item-label"]}>Best Time to Visit</p>
                                    <p className={styles["item-value"]}>{sections.overview.details?.bestSeason || "—"}</p>
                                </div>
                            </div>
                            <div className={styles["overview-item"]}>
                                <CircleDollarSign size={18} />
                                <div>
                                    <p className={styles["item-label"]}>Average Cost</p>
                                    <p className={styles["item-value"]}>{sections.overview.details?.averageCost || "—"}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* ─── ACTIVITIES ─── */}
                {sections.activities?.list?.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.activities.title}</h2>
                        <div className={styles["activities-tags"]}>
                            {sections.activities.list.map((act, i) => (
                                <span key={i} className={styles.tag}>{act}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* ─── TRAVEL GUIDE ─── */}
                {sections.travelGuide?.list?.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.travelGuide.subTitle}</h2>
                        <div className={styles["guide-container"]}>
                            {sections.travelGuide.list.map((step, i) => (
                                <div key={i} className={styles["guide-step"]}>
                                    <h3 className={styles["step-title"]}>{step.subTitle}</h3>
                                    <p className={styles["step-body"]}>{step.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ─── PLACES TO VISIT SECTION ─── */}
                {placesList.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.placesToVisit?.title || "Places to Visit"}</h2>
                        <div className={styles["card-list"]}>
                            {getVisibleItems(placesList, showAllPlaces).map((place, i) => (
                                <Card
                                    key={place.id || place._id}
                                    data={place}
                                    type="place"
                                    number={i + 1}
                                    onClick={() => onCardClick(place)}
                                />
                            ))}
                        </div>
                        {placesList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button className={styles["show-more"]} onClick={() => setShowAllPlaces(p => !p)}>
                                    {showAllPlaces ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── RESTAURANTS SECTION ─── */}
                {restaurantsList.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.foodAndDining?.restaurants?.subTitle || "Restaurants"}</h2>
                        <div className={styles["card-list"]}>
                            {getVisibleItems(restaurantsList, showAllRestaurants).map((restaurant, i) => (
                                <Card
                                    key={restaurant.id || restaurant._id}
                                    data={restaurant}
                                    type="restaurant"
                                    number={i + 1}
                                    onClick={() => onCardClick(restaurant)}
                                />
                            ))}
                        </div>
                        {restaurantsList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button className={styles["show-more"]} onClick={() => setShowAllRestaurants(p => !p)}>
                                    {showAllRestaurants ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── TRADITIONAL DISHES SECTION ─── */}
                {dishesList.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.foodAndDining?.traditionalDining?.subTitle || "Traditional Dining"}</h2>
                        <div className={styles["card-list"]}>
                            {getVisibleItems(dishesList, showAllDishes).map((dish, i) => (
                                <Card
                                    key={dish.id || dish._id}
                                    data={dish}
                                    type="restaurant"
                                    number={i + 1}
                                    onClick={() => onCardClick(dish)}
                                />
                            ))}
                        </div>
                        {dishesList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button className={styles["show-more"]} onClick={() => setShowAllDishes(p => !p)}>
                                    {showAllDishes ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── HOTELS SECTION ─── */}
                {hotelsList.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.hotels?.title || "Hotels"}</h2>
                        <div className={styles["card-list"]}>
                            {getVisibleItems(hotelsList, showAllHotels).map((hotel, i) => (
                                <Card
                                    key={hotel.id || hotel._id}
                                    data={hotel}
                                    type="hotel"
                                    number={i + 1}
                                    onClick={() => onCardClick(hotel)}
                                />
                            ))}
                        </div>
                        {hotelsList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button className={styles["show-more"]} onClick={() => setShowAllHotels(p => !p)}>
                                    {showAllHotels ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* ─── EVENTS SECTION ─── */}
                {eventsList.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles["section-title"]}>{sections.events?.title || "Events"}</h2>
                        <div className={styles["card-list"]}>
                            {getVisibleItems(eventsList, showAllEvents).map((event, i) => (
                                <Card
                                    key={event.id || event._id}
                                    data={event}
                                    type="event"
                                    number={i + 1}
                                    onClick={() => onCardClick(event)}
                                />
                            ))}
                        </div>
                        {eventsList.length > INITIAL_SHOW && (
                            <div className={styles["show-more-container"]}>
                                <button className={styles["show-more"]} onClick={() => setShowAllEvents(p => !p)}>
                                    {showAllEvents ? "Show less" : "Show more"}
                                </button>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}

export default LeftPanel;