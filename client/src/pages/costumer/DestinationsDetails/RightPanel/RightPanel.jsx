import { useState, useEffect } from "react";
import styles from "./RightPanel.module.css";
import { MapPin, Clock, Calendar, CircleDollarSign, Phone } from "lucide-react";
import whatsapp from "/icons/whatsapp.png";
import facebook from "/icons/facebook-panel.png";
import instagram from "/icons/instagram-panel.png";
import x from "/icons/x-panel.png";
import api from "@/api/client";

const DEFAULT_TABS = ["About", "Reviews", "Contact", "Photos"];


function getMockReviews(card) {
    const section = card.details?.section || "";
    const name = card.name || "this location";

    
    let seed = 0;
    const cardId = String(card._id || card.id || "123");
    for (let i = 0; i < cardId.length; i++) {
        seed += cardId.charCodeAt(i);
    }

    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    
    const rating = (4.2 + random() * 0.7).toFixed(1);
    const reviewsNumber = Math.floor(15 + random() * 50);

    
    const fiveStarReviews = Math.floor(reviewsNumber * (0.6 + random() * 0.25));
    const fourStarReviews = Math.floor(reviewsNumber * (0.15 + random() * 0.15));
    const threeStarReviews = Math.floor(reviewsNumber * (0.02 + random() * 0.05));
    const twoStarReviews = Math.floor(reviewsNumber * (0.01 + random() * 0.02));
    const oneStarReviews = Math.max(0, reviewsNumber - fiveStarReviews - fourStarReviews - threeStarReviews - twoStarReviews);

    const poolHotels = [
        { name: "John D.", rating: 5, body: `Unbelievable stay at ${name}! Stargazing from here is a memory I will cherish forever.` },
        { name: "Sarah M.", rating: 5, body: "Extremely clean tents, luxurious bathrooms, and the Bedouin buffet was delicious." },
        { name: "Ali H.", rating: 4, body: "Very hospitable staff and beautiful surroundings. Note that it gets very cold at night, so bring extra layers!" },
        { name: "Emma W.", rating: 5, body: `The Martian dome at ${name} was amazing. Waking up to the red sand landscape was out of this world.` },
        { name: "David K.", rating: 4, body: "Great experience overall. The guided jeep tour organized by the camp was the highlight of our trip." }
    ];

    const poolRestaurants = [
        { name: "Elena R.", rating: 5, body: `Hands down the best food in the area! The Zarb slow-cooked underground at ${name} was incredibly tender.` },
        { name: "Omar F.", rating: 5, body: "Very authentic atmosphere, delicious mint tea, and large portions. Highly recommend the Mansaf!" },
        { name: "Sophia L.", rating: 4, body: "Lovely café with beautiful desert views. The Arabic coffee and kunafa were excellent." },
        { name: "Michael T.", rating: 5, body: `Great place to stop by. The staff at ${name} are super friendly and welcoming.` },
        { name: "Layla A.", rating: 4, body: "Tasty local dishes, freshly baked bread, and very fast service even when busy." }
    ];

    const poolPlaces = [
        { name: "Thomas B.", rating: 5, body: `A magical place. The ancient inscriptions at ${name} are fascinating to see in person.` },
        { name: "Jessica H.", rating: 5, body: "Absolutely breathtaking views of the canyons. The red sandstone formations are stunning." },
        { name: "Kareem S.", rating: 4, body: "Great hiking spot! Make sure to hire a Bedouin guide to learn about the history and stay safe." },
        { name: "Chloe P.", rating: 5, body: `We watched the sunset from ${name} and it was the most beautiful thing I've ever seen.` },
        { name: "Daniel N.", rating: 4, body: "Spectacular landscape. Be prepared with plenty of water and proper walking shoes." }
    ];

    const poolEvents = [
        { name: "Robert G.", rating: 5, body: `An exceptionally well-organized event. Running through the desert landscape of Wadi Rum was unforgettable.` },
        { name: "Nadia Y.", rating: 5, body: "Such a beautiful cultural experience. The music, storytelling, and dinner under the stars were perfect." },
        { name: "Lucas M.", rating: 4, body: "Stargazing with high-powered telescopes was amazing. The guide was incredibly knowledgeable." },
        { name: "Aisha B.", rating: 5, body: `Highly recommend participating in ${name} if you visit Jordan. A true highlight!` },
        { name: "Simon P.", rating: 5, body: "Fascinating experience, great food, and wonderful company. 10/10!" }
    ];

    let selectedPool = poolPlaces;
    const s = section.toLowerCase();
    if (s.includes("hotel")) selectedPool = poolHotels;
    else if (s.includes("dining") || s.includes("rest") || s.includes("food")) selectedPool = poolRestaurants;
    else if (s.includes("event")) selectedPool = poolEvents;

    
    const numComments = 3 + Math.floor(random() * 2);
    const comments = [];
    const poolCopy = [...selectedPool];
    for (let i = 0; i < numComments && poolCopy.length > 0; i++) {
        const index = Math.floor(random() * poolCopy.length);
        comments.push({
            _id: `mock-review-${cardId}-${i}`,
            ...poolCopy.splice(index, 1)[0]
        });
    }

    return {
        rating,
        reviewsNumber,
        fiveStarReviews,
        fourStarReviews,
        threeStarReviews,
        twoStarReviews,
        oneStarReviews,
        comments
    };
}

const RightPanel = ({ card, onClose }) => {
    const [activeTab, setActiveTab] = useState("About");
    const [reviews, setReviews] = useState(null);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);

    const { details } = card;

    
    useEffect(() => {
        setActiveTab("About");
        setReviews(null);
        setReviewsError(null);
    }, [card]);

    
    useEffect(() => {
        if (activeTab !== "Reviews" || reviews !== null || card.subSection === "traditionalDining") return;

        setReviewsLoading(true);
        const timer = setTimeout(() => {
            try {
                const data = getMockReviews(card);
                setReviews(data);
                setReviewsError(false);
            } catch (err) {
                console.error("Failed to generate reviews:", err);
                setReviewsError(true);
            } finally {
                setReviewsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [activeTab, card._id, reviews, card.subSection, card]);

    
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

    
    const tabs = details.section === "hotels"
        ? [...DEFAULT_TABS, "Book"]
        : DEFAULT_TABS;

    
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
                        <p className={styles.info}><CircleDollarSign size={17} /> {about.fees}</p>
                        {console.log("duration", about.durationText)}
                        <p className={styles.info}><Calendar size={17} /> {about.startDate} — {about.endDate}</p>
                        <p className={styles.info}><Clock size={17} /> {about.startTime} — {about.endTime}</p>
                        <p className={styles.info}><Clock size={17} /> {about.durationText || "Not specified"}</p>
                    </div>
                </div>
            );
        }

        
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

    
    const renderContact = () => {
        const methods = contact?.methods || [];

        if (!methods.length) {
            return (
                <div className={styles["no-contact"]}>
                    No contact is available
                </div>
            );
        }

        const getHref = (type, value) => {
            switch (type) {
                case "whatsapp": return `https://wa.me/${value.replace(/\D/g, "")}`;
                case "facebook": return `https://facebook.com/${value}`;
                case "instagram": return `https://instagram.com/${value}`;
                case "x": return `https://x.com/${value}`;
                case "website": return value.startsWith("http") ? value : `https://${value}`;
                case "email": return `mailto:${value}`;
                default: return null;
            }
        };

        const getIcon = (type) => {
            switch (type) {
                case "phone": return <Phone size={17} />;
                case "whatsapp": return <img src={whatsapp} alt="whatsapp" width={17} />;
                case "facebook": return <img src={facebook} alt="facebook" width={17} />;
                case "instagram": return <img src={instagram} alt="instagram" width={17} />;
                case "x": return <img src={x} alt="x" width={17} />;
                default: return <Phone size={17} />;
            }
        };

        return (
            <div className={styles["tab-content"]}>
                {methods.map(({ type, value }, i) => {
                    const href = getHref(type, value);
                    const content = (
                        <>
                            {getIcon(type)}
                            <p>{value}</p>
                        </>
                    );
                    return href ? (
                        <a key={i} href={href} className={styles["contact-item"]} target="_blank" rel="noreferrer">
                            {content}
                        </a>
                    ) : (
                        <div key={i} className={styles["contact-item"]}>
                            {content}
                        </div>
                    );
                })}
            </div>
        );
    };

    
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

    
    const renderBook = () => {
        if (details.section !== "hotels") {
            
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