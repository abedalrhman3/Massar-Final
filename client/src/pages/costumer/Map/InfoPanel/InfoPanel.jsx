import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./InfoPanel.module.css";

/**
 * InfoPanel
 * Shows route summary (distance + estimated driving time) for the selected destination.
 *
 * Props:
 *   destination  – location object (has .name / .name_en)
 *   routeInfo    – { distanceKm: number, durationMin: number } | null
 *   loading      – boolean (route is being fetched)
 *   onClose      – called when the user dismisses the panel
 */
const InfoPanel = ({ destination, routeInfo, loading, onClose }) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    if (!destination) return null;

    const destName = isAr ? destination.name : destination.name_en;

    const formatDistance = (km) => {
        if (km == null) return "—";
        return km < 1
            ? `${Math.round(km * 1000)} ${isAr ? "م" : "m"}`
            : `${km.toFixed(1)} ${isAr ? "كم" : "km"}`;
    };

    const formatDuration = (min) => {
        if (min == null) return "—";
        if (min < 60) return `${Math.round(min)} ${isAr ? "دقيقة" : "min"}`;
        const h = Math.floor(min / 60);
        const m = Math.round(min % 60);
        return m === 0
            ? `${h} ${isAr ? "ساعة" : "hr"}`
            : `${h} ${isAr ? "ساعة" : "hr"} ${m} ${isAr ? "دقيقة" : "min"}`;
    };

    return (
        <div className={styles.panel} dir={isAr ? "rtl" : "ltr"}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.icon}>🗺️</span>
                    <span className={styles.title}>{destName}</span>
                </div>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                    ✕
                </button>
            </div>

            {/* Body */}
            <div className={styles.body}>
                {loading ? (
                    <div className={styles.loadingRow}>
                        <span className={styles.spinner} />
                        <span className={styles.loadingText}>
                            {isAr ? "جارٍ حساب المسار…" : "Calculating route…"}
                        </span>
                    </div>
                ) : routeInfo ? (
                    <>
                        <div className={styles.stat}>
                            <span className={styles.statIcon}>📏</span>
                            <div className={styles.statBody}>
                                <span className={styles.statLabel}>
                                    {isAr ? "المسافة" : "Distance"}
                                </span>
                                <span className={styles.statValue}>
                                    {formatDistance(routeInfo.distanceKm)}
                                </span>
                            </div>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.stat}>
                            <span className={styles.statIcon}>🚗</span>
                            <div className={styles.statBody}>
                                <span className={styles.statLabel}>
                                    {isAr ? "الوقت بالسيارة" : "Drive time"}
                                </span>
                                <span className={styles.statValue}>
                                    {formatDuration(routeInfo.durationMin)}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className={styles.noRoute}>
                        {isAr
                            ? "لم يتم العثور على مسار. تأكد من تحديد موقعك."
                            : "No route found. Make sure your location is set."}
                    </p>
                )}
            </div>
        </div>
    );
};

export default InfoPanel;