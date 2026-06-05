import { useState, useEffect } from "react";
import styles from "./RightPanel.module.css";
import { MapPin, Clock, Calendar, CircleDollarSign, Phone } from "lucide-react";
import whatsapp from "/icons/whatsapp.png";
import facebook from "/icons/facebook-panel.png";
import instagram from "/icons/instagram-panel.png";
import x from "/icons/x-panel.png";
import api from "@/api/client";

const DEFAULT_TABS = ["About", "Reviews", "Contact", "Photos"];

// Fetch reviews for a listing from GET /api/reviews?itemId=:id
async function fetchReviews(itemId) {
    const res = await api.get("/reviews", { params: { itemId } });
    return res.data.data; // { rating, reviewsNumber, fiveStarReviews, ..., comments[] }
}

const RightPanel = ({ card, onClose }) => {
    const [activeTab, setActiveTab] = useState("About");
    const [reviews, setReviews] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);

    const { details } = card;

    // Reset tab and reviews when card changes
    useEffect(() => {
        setActiveTab("About");
        setReviews(null);
        setReviewsError(null);
    }, [card]);

    // Fetch reviews lazily when the Reviews tab is opened
    useEffect(() => {
        if (activeTab !== "Reviews" || reviews !== null || card.subSection === "traditionalDining") return;

        setReviewsLoading(true);
        fetchReviews(card._id)
            .then(data => setReviews(data))
            .catch(err => {
                console.error("Failed to load reviews:", err);
                setReviewsError(true);
            })
            .finally(() => setReviewsLoading(false));
    }, [activeTab, card._id, reviews, card.subSection]);

    // ── Traditional dining: simple fallback ──────────────────────────────
    if (card.subSection === "traditionalDining") {
        return (
            <div className={styles["right-panel"]}>
                <button className={styles["close-btn"]} onClick={onClose}>✕</button>
                <div className={styles.header}>
                    <div className={`${styles["card-preview"]} ${styles["trd"]}`}>
                        <h3 className={styles["card-name"]}>{card.name}</h3>
                        <img src={card.image} alt={card.name} className={styles["preview-img"]} />
                    </div>
                </div>
                <div className={styles["tab-content"]}>
                    <p>{card.description}</p>
                </div>
            </div>
        );
    }

    const { about, contact, photos, book } = details;

    // Only hotels get a Book tab
    const tabs = details.section === "hotels"
        ? [...DEFAULT_TABS, "Book"]
        : DEFAULT_TABS;

    // ── About ─────────────────────────────────────────────────────────────
    const renderAbout = () => {
        if (details.section === "events") {
            return (
                <div className={styles["tab-content"]}>
                    <div className={styles.header}>
                        <div className={styles["card-preview"]}>
                            <div>
                                <h3 className={styles["card-name"]}>{card.name}</h3>
                            </div>
                            <img src={card.image} alt={card.name} className={styles["preview-img"]} />
                        </div>
                    </div>
                    <div className={styles["info-container"]}>
                        <p className={styles.info}><MapPin size={17} /> {about.address}</p>
                        <p className={styles.info}><CircleDollarSign size={17} /> {about.fees}</p>
                        <p className={styles.info}><Calendar size={17} /> {about.startDate} — {about.endDate}</p>
                        <p className={styles.info}><Clock size={17} /> {about.startTime} — {about.endTime}</p>
                    </div>
                </div>
            );
        }

        // place | restaurant | hotel
        return (
            <div className={styles["tab-content"]}>
                <div className={styles.header}>
                    <div className={styles["card-preview"]}>
                        <div>
                            <h3 className={styles["card-name"]}>{card.name}</h3>
                        </div>
                        <img src={card.image} alt={card.name} className={styles["preview-img"]} />
                    </div>
                </div>
                <div className={styles["info-container"]}>
                    <p className={styles.info}><MapPin size={17} /> {about.address}</p>
                    <p className={styles.info}><CircleDollarSign size={17} /> {about.cost}</p>
                    <p className={styles.info}><Clock size={17} /> {about.openTime} — {about.closeTime}</p>
                    <div className={`${styles["work-days"]} ${styles.info}`}>
                        <Calendar size={18} />
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <span
                                key={day}
                                className={`${styles.day} ${about.workDays?.includes(day) ? styles["day-active"] : styles["day-off"]}`}
                            >
                                {day}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ── Reviews ───────────────────────────────────────────────────────────
    const renderReviews = () => {
        if (reviewsLoading) {
            return <div className={styles["tab-content"]}><p>Loading reviews…</p></div>;
        }
        if (reviewsError || !reviews) {
            return <div className={styles["tab-content"]}><p className={styles.empty}>Could not load reviews.</p></div>;
        }

        const {
            rating = 0,
            reviewsNumber = 0,
            fiveStarReviews = 0,
            fourStarReviews = 0,
            threeStarReviews = 0,
            twoStarReviews = 0,
            oneStarReviews = 0,
            comments = [],
        } = reviews;

        return (
            <div className={styles["tab-content"]}>
                <p className={styles["reviews-title"]}>Reviews</p>
                <div className={styles["reviews-summary"]}>
                    <div className={styles["rating-info"]}>
                        <div className={styles["rating-big"]}>
                            <p>{rating}</p>
                            <p className={styles.outof}>out of 5</p>
                        </div>
                        <div className={styles.source}>
                            <p className={styles["rating-label"]}>
                                {rating >= 4.5 ? "Wonderful" : rating >= 4 ? "Great" : "Good"}
                            </p>
                            <p className={styles["reviews-count"]}>{reviewsNumber} reviews</p>
                            <p className={styles.from}>From Google</p>
                        </div>
                    </div>

                    <div className={styles["rating-bars"]}>
                        {[
                            { label: "5 stars", count: fiveStarReviews },
                            { label: "4 stars", count: fourStarReviews },
                            { label: "3 stars", count: threeStarReviews },
                            { label: "2 stars", count: twoStarReviews },
                            { label: "1 star", count: oneStarReviews },
                        ].map(({ label, count }) => (
                            <div key={label} className={styles["bar-row"]}>
                                <span>{label}</span>
                                <div className={styles["bar-track"]}>
                                    <div
                                        className={styles["bar-fill"]}
                                        style={{ width: reviewsNumber ? `${(count / reviewsNumber) * 100}%` : "0%" }}
                                    />
                                </div>
                                <span>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.comments}>
                    {comments.length === 0 && (
                        <p className={styles.empty}>No reviews yet.</p>
                    )}
                    {comments.map((comment, i) => (
                        <div key={comment._id ?? i} className={styles.comment}>
                            <div className={styles["comment-header"]}>
                                <span className={styles["comment-name"]}>{comment.name}</span>
                                <span className={styles["comment-rating"]}>{"★".repeat(comment.rating)}</span>
                            </div>
                            <p>{comment.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ── Contact ───────────────────────────────────────────────────────────
    const renderContact = () => {
        if (details.section === "events" && !contact?.isAvailable) {
            return (
                <div className={styles["tab-content"]}>
                    <p className={styles.empty}>No contact info available for this event.</p>
                </div>
            );
        }

        if (!contact?.phone && !contact?.whatsapp && !contact?.facebook && !contact?.instagram && !contact?.x) {
            return (
                <div className={styles["no-contact"]}>
                    No contact is available
                </div>
            );
        }

        return (
            <div className={styles["tab-content"]}>
                {contact?.phone && (
                    <div className={styles["contact-item"]}>
                        <Phone size={17} />
                        <p>{contact.phone}</p>
                    </div>
                )}
                {contact?.whatsapp && (
                    <a href={`https://wa.me/${contact.whatsapp}`} className={styles["contact-item"]}>
                        <img src={whatsapp} alt="whatsapp" width={17} />
                        <p>{contact.whatsapp}</p>
                    </a>
                )}
                {contact?.facebook && (
                    <a href={`https://facebook.com/${contact.facebook}`} className={styles["contact-item"]}>
                        <img src={facebook} alt="facebook" width={17} />
                        <p>{contact.facebook}</p>
                    </a>
                )}
                {contact?.instagram && (
                    <a href={`https://instagram.com/${contact.instagram}`} className={styles["contact-item"]}>
                        <img src={instagram} alt="instagram" width={17} />
                        <p>{contact.instagram}</p>
                    </a>
                )}
                {contact?.x && (
                    <a href={`https://x.com/${contact.x}`} className={styles["contact-item"]}>
                        <img src={x} alt="x" width={17} />
                        <p>{contact.x}</p>
                    </a>
                )}
            </div>
        );
    };

    // ── Photos ────────────────────────────────────────────────────────────
    const renderPhotos = () => (
        <div className={styles["tab-content"]}>
            <div className={styles["photos-grid"]}>
                {photos.length === 0 && <p className={styles.empty}>No photos available.</p>}
                {photos.map((url, i) => (
                    <img key={i} src={url} alt={`photo-${i}`} className={styles.photo} />
                ))}
            </div>
        </div>
    );

    // ── Book ──────────────────────────────────────────────────────────────
    const renderBook = () => {
        if (details.section !== "hotels") {
            // Shouldn't happen, but guard anyway
            return null;
        }
        return (
            <div className={styles["tab-content"]}>
                <p>Ready to book your stay at <strong>{card.name}</strong>?</p>
                <a
                    href={book?.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles["book-btn"]}
                >
                    Book on Booking.com
                </a>
            </div>
        );
    };

    const renderTab = () => {
        switch (activeTab) {
            case "About": return renderAbout();
            case "Reviews": return renderReviews();
            case "Contact": return renderContact();
            case "Photos": return renderPhotos();
            case "Book": return renderBook();
            default: return null;
        }
    };

    return (
        <div className={styles["right-panel"]}>
            <button className={styles["close-btn"]} onClick={onClose}>✕</button>
            <div className={styles.tabs}>
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles["tab-active"] : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            {renderTab()}
        </div>
    );
};

export default RightPanel;