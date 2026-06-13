import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Swords, Star, X, Upload, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from "lucide-react";
import styles from "./QuestPanel.module.css";
import { joinQuest, getLocationQuests } from "@/api/quests";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

const QuestsPanel = ({ isExpanded, onToggle, isLeftOpen, destination }) => {
    const expanded = isExpanded ?? true;
    const { user, setUser } = useAuth();
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const [quests, setQuests] = useState([]);
    const [claimed, setClaimed] = useState({});
    const [pending, setPending] = useState({});
    const [joining, setJoining] = useState({});
    const [photoQuest, setPhotoQuest] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [step, setStep] = useState("upload");
    const [loadingStatus, setLoadingStatus] = useState("");
    const [resultData, setResultData] = useState(null);

    const displayName = destination?._id
        ? (isAr ? destination.name : destination.name_en)
        : "Explore";

    // Seed completed quests from user context on mount
    useEffect(() => {
        if (user?.completed_quests?.length) {
            const map = {};
            user.completed_quests.forEach((id) => {
                map[String(id)] = true;
            });
            setClaimed(map);
        }
    }, [user]);

    // Fetch quests and seed pending state from backend
    useEffect(() => {
        if (!destination?._id) return;
        const fetchQuests = async () => {
            try {
                const res = await getLocationQuests(destination._id);
                setQuests(res.data.data);

                if (res.data.pending_review_quest_ids?.length) {
                    const map = {};
                    res.data.pending_review_quest_ids.forEach((id) => {
                        map[String(id)] = true;
                    });
                    setPending(map);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchQuests();
    }, [destination?._id]);

    const handleClaimClick = (e, quest) => {
        e.stopPropagation();
        setPhoto(null);
        setPhotoPreview(null);
        setPhotoQuest(quest);
        setStep("upload");
        setResultData(null);
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
        setStep("loading");
        setLoadingStatus(isAr ? "جاري رفع وتحليل الصورة..." : "Uploading & analyzing photo...");

        try {
            const formData = new FormData();
            formData.append("photo", photo);

            const res = await joinQuest(photoQuest._id, formData);

            if (res.data.success) {
                setClaimed((prev) => ({ ...prev, [String(photoQuest._id)]: true }));
                if (setUser && res.data.user) {
                    setUser(res.data.user);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                }
                setResultData({
                    success: true,
                    scenario: "approved",
                    message: res.data.message || (isAr ? "تم إكمال المهمة بنجاح!" : "Quest completed!"),
                    xpGained: res.data.xpGained || photoQuest.bonus_xp || photoQuest.xp
                });
                setStep("result");
            } else {
                if (res.data.scenario === "inappropriate") {
                    setPending((prev) => ({ ...prev, [String(photoQuest._id)]: true }));
                }
                setResultData({
                    success: false,
                    scenario: res.data.scenario,
                    message: res.data.message,
                    reason: res.data.reason
                });
                setStep("result");
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.message || (isAr ? "فشل الانضمام للمسار." : "Failed to join quest.");
            setResultData({
                success: false,
                scenario: "error",
                message: errMsg
            });
            setStep("result");
        } finally {
            setJoining((prev) => ({ ...prev, [photoQuest._id]: false }));
        }
    };

    const handleClosePopup = (e) => {
        if (e) e.stopPropagation();
        setPhotoQuest(null);
        setPhoto(null);
        setPhotoPreview(null);
        setStep("upload");
        setResultData(null);
    };

    const handleTryAgain = (e) => {
        e.stopPropagation();
        setStep("upload");
        setPhoto(null);
        setPhotoPreview(null);
        setResultData(null);
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
                            const isPending = !!pending[String(quest._id)];
                            const isJoining = !!joining[quest._id];
                            const title = isAr ? quest.title : (quest.title_en || quest.title);
                            const description = isAr ? quest.description : (quest.description_en || quest.description);

                            return (
                                <div
                                    key={quest._id}
                                    className={`${styles.questCard} ${done ? styles.questDone : isPending ? styles.questPending : ""}`}
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
                                                style={{ width: done ? "100%" : isPending ? "50%" : "0%" }}
                                            />
                                        </div>
                                        <button
                                            className={`${styles.claimBtn} ${done ? styles.claimBtnDone : isPending ? styles.claimBtnPending : ""}`}
                                            onClick={(e) => !done && !isPending && handleClaimClick(e, quest)}
                                            disabled={done || isPending || isJoining}
                                            aria-label={
                                                done ? "Quest completed"
                                                    : isPending ? "Under review"
                                                        : `Join quest for ${quest.bonus_xp ?? quest.xp} XP`
                                            }
                                        >
                                            {isJoining
                                                ? (isAr ? "جاري..." : "Joining…")
                                                : done
                                                    ? (isAr ? "مشارك ✓" : "Completed ✓")
                                                    : isPending
                                                        ? (isAr ? "قيد المراجعة ⏳" : "Under Review ⏳")
                                                        : (isAr ? "انضمام" : "Join Quest")}
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
                <div className={styles.photoOverlay} onClick={handleClosePopup}>
                    <div className={styles.photoPopup} onClick={(e) => e.stopPropagation()}>

                        <button className={styles.photoClose} onClick={handleClosePopup} aria-label="Close">
                            <X size={16} />
                        </button>

                        {step === "upload" && (
                            <>
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
                            </>
                        )}

                        {step === "loading" && (
                            <div className={styles.loadingState}>
                                <Loader2 size={36} className={styles.spinner} />
                                <p className={styles.loadingText}>{loadingStatus}</p>
                            </div>
                        )}

                        {step === "result" && resultData && (
                            <div className={styles.resultContainer}>
                                {resultData.scenario === "approved" && (
                                    <div className={`${styles.resultState} ${styles.successState}`}>
                                        <div className={styles.iconCircleSuccess}>
                                            <CheckCircle2 size={40} className={styles.successIcon} />
                                        </div>
                                        <h4 className={styles.resultTitle}>{isAr ? "تم إكمال المهمة!" : "Quest Completed!"}</h4>
                                        <p className={styles.resultMessage}>{resultData.message}</p>
                                        <div className={styles.xpBonus}>
                                            <Star size={16} className={styles.starIcon} fill="#378add" stroke="#378add" />
                                            <span>+{resultData.xpGained} XP</span>
                                        </div>
                                        <button className={styles.photoSubmit} onClick={handleClosePopup}>
                                            {isAr ? "رائع!" : "Awesome!"}
                                        </button>
                                    </div>
                                )}

                                {resultData.scenario === "inappropriate" && (
                                    <div className={`${styles.resultState} ${styles.warningState}`}>
                                        <div className={styles.iconCircleWarning}>
                                            <AlertTriangle size={40} className={styles.warningIcon} />
                                        </div>
                                        <h4 className={styles.resultTitle}>{isAr ? "قيد المراجعة" : "Under Review"}</h4>
                                        <p className={styles.resultMessage}>{resultData.message}</p>
                                        <button className={styles.photoSubmit} onClick={handleClosePopup}>
                                            {isAr ? "حسناً" : "Got it"}
                                        </button>
                                    </div>
                                )}

                                {(resultData.scenario === "rejected" || resultData.scenario === "error") && (
                                    <div className={`${styles.resultState} ${styles.errorState}`}>
                                        <div className={styles.iconCircleError}>
                                            <AlertCircle size={40} className={styles.errorIcon} />
                                        </div>
                                        <h4 className={styles.resultTitle}>
                                            {resultData.scenario === "error"
                                                ? (isAr ? "فشل الاتصال" : "Connection Failed")
                                                : (isAr ? "لم يتم قبول الصورة" : "Photo Rejected")}
                                        </h4>
                                        <p className={styles.resultMessage}>{resultData.message}</p>
                                        {resultData.reason && (
                                            <div className={styles.reasonBox}>
                                                <strong>{isAr ? "السبب:" : "Reason:"}</strong>
                                                <p>{resultData.reason}</p>
                                            </div>
                                        )}
                                        <button className={styles.photoSubmit} onClick={handleTryAgain}>
                                            {isAr ? "حاول مجدداً" : "Try Again"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestsPanel;