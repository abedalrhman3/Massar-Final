import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Swords, Star, X, Upload } from "lucide-react";
import styles from "./QuestPanel.module.css";
import { joinQuest } from "@/api/quests";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

const QuestsPanel = ({ quests = [], isExpanded, onToggle, isLeftOpen }) => {
    const expanded = isExpanded ?? true;
    const { user, setUser } = useAuth();
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const [claimed, setClaimed] = useState({});
    const [joining, setJoining] = useState({});
    const [photoQuest, setPhotoQuest] = useState(null); // quest object whose popup is open
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    // Seed already-joined quests from user context on mount
    useEffect(() => {
        if (user?.joined_quests?.length) {
            const map = {};
            user.joined_quests.forEach((id) => {
                map[String(id)] = true;
            });
            setClaimed(map);
        }
    }, [user]);

    // Open photo upload popup for this quest
    const handleClaimClick = (e, quest) => {
        e.stopPropagation();
        setPhoto(null);
        setPhotoPreview(null);
        setPhotoQuest(quest);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
    };


    const handleSubmit = async (e) => {
        e.stopPropagation();
        if (!photoQuest || !photo) return;

        setJoining((prev) => ({ ...prev, [photoQuest._id]: true }));
        try {
            const formData = new FormData();
            formData.append("photo", photo);

            const res = await joinQuest(photoQuest._id, formData);  // pass formData
            if (res.data.success) {
                setClaimed((prev) => ({ ...prev, [String(photoQuest._id)]: true }));
                if (setUser && res.data.user) {
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }
                alert(isAr ? "تم الانضمام للمسار بنجاح!..." : "Successfully joined the quest!...");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to join quest.");
        } finally {
            setJoining((prev) => ({ ...prev, [photoQuest._id]: false }));
            setPhotoQuest(null);
            setPhoto(null);
            setPhotoPreview(null);
        }
    };


    const handleCancelPopup = (e) => {
        e.stopPropagation();
        setPhotoQuest(null);
        setPhoto(null);
        setPhotoPreview(null);
    };

    return (
        <div className={`${styles.panel} ${expanded ? styles.expanded : styles.collapsed} ${isLeftOpen ? styles.pushedDown : ""}`}>

            {/* Header */}
            <div
                className={styles.header}
                onClick={() => onToggle?.()}
                role="button"
                aria-expanded={expanded}
                aria-label="Toggle quests panel"
            >
                <div className={styles.headerLeft}>
                    <Swords size={15} strokeWidth={2.2} className={styles.headerIcon} />
                    <span className={styles.headerTitle}>{isAr ? "المسارات" : "Quests"}</span>
                </div>
                <div className={styles.headerRight}>
                    {expanded && (
                        <span className={styles.questCount}>
                            {quests.length} {isAr ? "مسارات" : "quests"}
                        </span>
                    )}
                    <button
                        className={styles.toggleBtn}
                        aria-label={expanded ? "Collapse" : "Expand"}
                        tabIndex={-1}
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Body */}
            {expanded && (
                <div className={styles.body}>
                    {quests.length === 0 && (
                        <p className={styles.empty}>
                            {isAr ? "لا توجد مسارات متاحة لهذه الوجهة." : "No quests available for this destination."}
                        </p>
                    )}

                    <div className={styles.questList}>
                        {quests.map((quest, i) => {
                            const done = !!claimed[String(quest._id)];
                            const isJoining = !!joining[quest._id];
                            const title = isAr ? quest.title : (quest.title_en || quest.title);
                            const description = isAr ? quest.description : (quest.description_en || quest.description);

                            return (
                                <div
                                    key={quest._id}
                                    className={`${styles.questCard} ${done ? styles.questDone : ""}`}
                                >
                                    <div className={styles.questTop}>
                                        <div className={styles.questLeft}>
                                            <div className={styles.questIndex}>{i + 1}</div>
                                            <p className={styles.questTitle}>{title}</p>
                                        </div>
                                        <div className={styles.xpBadge}>
                                            <Star size={11} strokeWidth={2.5} aria-hidden="true" />
                                            {quest.bonus_xp ?? quest.xp} XP
                                        </div>
                                    </div>

                                    <p className={styles.questDesc}>{description}</p>

                                    <div className={styles.questFooter}>
                                        <div className={styles.xpBar}>
                                            <div
                                                className={styles.xpBarFill}
                                                style={{ width: done ? "100%" : "0%" }}
                                            />
                                        </div>
                                        <button
                                            className={`${styles.claimBtn} ${done ? styles.claimBtnDone : ""}`}
                                            onClick={(e) => !done && handleClaimClick(e, quest)}
                                            disabled={done || isJoining}
                                            aria-label={done ? "Quest joined" : `Join quest for ${quest.bonus_xp ?? quest.xp} XP`}
                                        >
                                            {isJoining ? (isAr ? "جاري..." : "Joining…") : done ? (isAr ? "مشارك ✓" : "Joined ✓") : (isAr ? "انضمام" : "Join Quest")}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Photo upload popup */}
            {photoQuest && (
                <div className={styles.photoOverlay} onClick={handleCancelPopup}>
                    <div className={styles.photoPopup} onClick={(e) => e.stopPropagation()}>

                        <button className={styles.photoClose} onClick={handleCancelPopup} aria-label="Close">
                            <X size={16} />
                        </button>

                        <h3 className={styles.photoTitle}>{isAr ? "الانضمام للمسار" : "Join Quest"}</h3>
                        <p className={styles.photoQuestName}>
                            {isAr ? photoQuest.title : (photoQuest.title_en || photoQuest.title)}
                        </p>
                        <p className={styles.photoHint}>
                            {isAr ? "قم برفع صورة لإثبات زيارتك" : "Upload a photo to prove your visit"}
                        </p>

                        <label className={styles.photoLabel}>
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
                            ) : (
                                <div className={styles.photoPlaceholder}>
                                    <Upload size={22} strokeWidth={1.8} />
                                    <span>{isAr ? "اختر صورة" : "Choose photo"}</span>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: "none" }}
                            />
                        </label>

                        <button
                            className={styles.photoSubmit}
                            onClick={handleSubmit}
                            disabled={!photo || !!joining[photoQuest._id]}
                        >
                            {joining[photoQuest._id]
                                ? (isAr ? "جاري الإرسال..." : "Submitting…")
                                : (isAr ? "إرسال وتأكيد الانضمام" : "Submit & Join Quest")}
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestsPanel;