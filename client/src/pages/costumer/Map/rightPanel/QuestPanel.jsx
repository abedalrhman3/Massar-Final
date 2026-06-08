import { useState } from "react";
import { ChevronUp, ChevronDown, Swords, Star } from "lucide-react";
import styles from "./QuestPanel.module.css";

const QuestsPanel = ({ quests = [], isExpanded, onToggle, isLeftOpen }) => {
    const expanded = isExpanded ?? true;
    const [claimed, setClaimed] = useState({});

    const handleClaim = (e, id) => {
        e.stopPropagation();
        setClaimed((prev) => ({ ...prev, [id]: true }));
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
                    <span className={styles.headerTitle}>Quests</span>
                </div>
                <div className={styles.headerRight}>
                    {expanded && (
                        <span className={styles.questCount}>{quests.length} quests</span>
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
                        <p className={styles.empty}>No quests available for this destination.</p>
                    )}

                    <div className={styles.questList}>
                        {quests.map((quest, i) => {
                            const done = !!claimed[quest._id];
                            return (
                                <div
                                    key={quest._id}
                                    className={`${styles.questCard} ${done ? styles.questDone : ""}`}
                                >
                                    <div className={styles.questTop}>
                                        <div className={styles.questLeft}>
                                            <div className={styles.questIndex}>{i + 1}</div>
                                            <p className={styles.questTitle}>{quest.title}</p>
                                        </div>
                                        <div className={styles.xpBadge}>
                                            <Star size={11} strokeWidth={2.5} aria-hidden="true" />
                                            {quest.xp} XP
                                        </div>
                                    </div>

                                    <p className={styles.questDesc}>{quest.description}</p>

                                    <div className={styles.questFooter}>
                                        <div className={styles.xpBar}>
                                            <div
                                                className={styles.xpBarFill}
                                                style={{ width: done ? "100%" : "0%" }}
                                            />
                                        </div>
                                        <button
                                            className={`${styles.claimBtn} ${done ? styles.claimBtnDone : ""}`}
                                            onClick={(e) => handleClaim(e, quest._id)}
                                            disabled={done}
                                            aria-label={done ? "Quest claimed" : `Claim ${quest.xp} XP`}
                                        >
                                            {done ? "Claimed ✓" : "Claim XP"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestsPanel;