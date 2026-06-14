import { useState } from "react";
import placeImage from "/images/detailPage/icons/marker.png";
import restaurantImage from "/images/detailPage/icons/coffee.png";
import eventImage from "/images/detailPage/icons/event.png";
import hotelImage from "/images/detailPage/icons/home.png";
import { Bookmark } from "lucide-react";
import styles from "./Card.module.css";
import { saveItem, removeSavedItem } from "@/api/saved"; 

const TYPE_TO_ENTITY = {
    place: "place",
    restaurant: "restaurant",
    hotel: "hotel",
    event: "event",
};

const TYPE_ICONS = {
    place: placeImage,
    restaurant: restaurantImage,
    hotel: hotelImage,
    event: eventImage,
};

const Card = ({ data, type, number, onClick }) => {
    const [savedId, setSavedId] = useState(data.savedId ?? null);
    const [saving, setSaving] = useState(false);

    const icon = TYPE_ICONS[type] ?? "";

    async function handleSave(e) {
        e.stopPropagation();
        if (saving) return;
        setSaving(true);
        try {
            if (savedId) {
                await removeSavedItem(savedId);
                setSavedId(null);
            } else {
                const entityType = TYPE_TO_ENTITY[type];
                if (!entityType) return;
                const res = await saveItem(entityType, data._id);
                setSavedId(res.data.data._id);
            }
        } catch (err) {
            console.error("Save/unsave failed:", err);
            if (err.response?.status === 401) {
                alert("Please log in to save this item.");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className={styles["card-container"]} onClick={onClick}>
            <div className={styles.title}>
                <div className={styles["icon-container"]}>
                    <img src={icon} alt="icon" className={styles.icon} width={30} />
                    <p
                        className={`${styles.order} ${type === "place" ? styles["order-place"] : ""}
                        ${type === "restaurant" ? styles["order-restaurant"] : ""}`}
                    >
                        {number}
                    </p>
                </div>
                <p className={styles.name}>{data.name}</p>
            </div>

            <div className={styles.right}>
                <button
                    className={`${styles["save-button"]} ${savedId ? styles["save-button--saved"] : ""}`}
                    onClick={handleSave}
                    disabled={saving}
                    aria-label={savedId ? "Unsave" : "Save"}
                >
                    <p>{saving ? "…" : savedId ? "Saved" : "Save"}</p>
                    <Bookmark size={15} fill={savedId ? "currentColor" : "none"} />
                </button>
                <div className={styles["image-container"]}>
                    <img src={data.image || data.coverImage} alt={data.name} className={styles["card-image"]} />
                </div>
            </div>
        </div>
    );
};

export default Card;