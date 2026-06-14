import { useState, useEffect } from "react";
import { Bookmark, MapPin, Camera, UtensilsCrossed, Building2, ChevronUp, ChevronDown } from "lucide-react";
import styles from "./leftPanel.module.css";
import { saveItem, removeSavedItem } from "@/api/saved";

const TABS = [
    { key: "places", label: "Places", Icon: Camera },
    { key: "restaurants", label: "Restaurants", Icon: UtensilsCrossed },
    { key: "hotels", label: "Hotels", Icon: Building2 },
];


const ENTITY_TYPE = {
    places: "place",
    restaurants: "restaurant",
    hotels: "hotel",
};

const LeftPanel = ({ destination, data = {}, isExpanded, onToggle, loading }) => {
    const expanded = isExpanded ?? true;
    const [activeTab, setActiveTab] = useState("places");
    const [savingMap, setSavingMap] = useState({});

    
    const [savedMap, setSavedMap] = useState(() => {
        const map = {};
        Object.entries(data).forEach(([tab, items]) => {
            (items ?? []).forEach((item, i) => {
                if (item.savedId) map[`${tab}_${i}`] = { savedId: item.savedId };
            });
        });
        return map;
    });

    
    useEffect(() => {
        const map = {};
        Object.entries(data).forEach(([tab, items]) => {
            (items ?? []).forEach((item, i) => {
                if (item.savedId) map[`${tab}_${i}`] = { savedId: item.savedId };
            });
        });
        setSavedMap(map);
    }, [data]);

    const handleSave = async (e, item, key) => {
        e.stopPropagation();
        if (savingMap[key]) return;

        setSavingMap((prev) => ({ ...prev, [key]: true }));
        try {
            const current = savedMap[key];
            if (current?.savedId) {
                await removeSavedItem(current.savedId);
                setSavedMap((prev) => ({ ...prev, [key]: null }));
            } else {
                const res = await saveItem(ENTITY_TYPE[activeTab], item._id);
                setSavedMap((prev) => ({ ...prev, [key]: { savedId: res.data.data._id } }));
            }
        } catch (err) {
            console.error("Save/unsave failed:", err);
            if (err.response?.status === 401) {
                alert("Please log in to save this item.");
            }
        } finally {
            setSavingMap((prev) => ({ ...prev, [key]: false }));
        }
    };

    return (
        <div className={`${styles.panel} ${expanded ? styles.expanded : styles.collapsed}`}>

            {}
            <div
                className={styles.header}
                onClick={() => onToggle?.()}
                role="button"
                aria-expanded={expanded}
                aria-label="Toggle panel"
            >
                <div className={styles.headerLeft}>
                    <MapPin size={14} strokeWidth={2.2} />
                    <span className={styles.destination}>{destination}</span>
                </div>
                <button
                    className={styles.toggleBtn}
                    aria-label={expanded ? "Collapse panel" : "Expand panel"}
                    tabIndex={-1}
                >
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {}
            {expanded && (
                <div className={styles.body}>

                    {}
                    <div className={styles.tabsBar} role="tablist">
                        {TABS.map(({ key, label, Icon }) => (
                            <button
                                key={key}
                                className={`${styles.tabBtn} ${activeTab === key ? styles.tabActive : ""}`}
                                onClick={() => setActiveTab(key)}
                                role="tab"
                                aria-selected={activeTab === key}
                            >
                                <Icon size={13} strokeWidth={2} aria-hidden="true" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {}
                    <div className={styles.cardList}>
                        {loading ? (
                            <p className={styles.empty}>Loading...</p>
                        ) : (data[activeTab] ?? []).length === 0 ? (
                            <p className={styles.empty}>No {activeTab} found.</p>
                        ) : (<div>
                            {(data[activeTab] ?? []).map((item, i) => {
                                const key = `${activeTab}_${i}`;
                                const saved = !!savedMap[key]?.savedId;
                                const saving = !!savingMap[key];

                                return (
                                    <div key={key} className={styles.card}>

                                        {}
                                        <div className={styles.cardLeft}>
                                            <div className={styles.cardNum}>{i + 1}</div>
                                            <div className={styles.cardInfo}>
                                                <p className={styles.cardTitle}>{item.name}</p>
                                                <p className={styles.cardAddress}>
                                                    <MapPin size={10} strokeWidth={2} aria-hidden="true" />
                                                    {item.address}
                                                </p>
                                            </div>
                                        </div>

                                        {}
                                        <div className={styles.cardRight}>
                                            <button
                                                className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ""}`}
                                                onClick={(e) => handleSave(e, item, key)}
                                                disabled={saving}
                                                aria-label={saved ? `Unsave ${item.name}` : `Save ${item.name}`}
                                            >
                                                <Bookmark size={12} fill={saved ? "currentColor" : "none"} strokeWidth={2} />
                                                {saving ? "…" : saved ? "Saved" : "Save"}
                                            </button>
                                            <div className={styles.cardImgWrapper}>
                                                <img
                                                    src={item.coverImage || item.image}
                                                    alt={item.name}
                                                    className={styles.cardImg}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                );
                            })} </div>)}


                    </div>
                </div>
            )}
        </div>
    );
};

export default LeftPanel;