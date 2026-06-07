import "@/styles/reset.css";
import "@/styles/variables.css";
import "@/styles/global.css";

import { useState, useEffect } from "react";
import styles from "./Gallery.module.css";

import AdminSidebar from "@/pages/admin/AdminSidebar";

import {
    getPublicPhotos,
    togglePhotoPrivacy,
    reportPhoto,
    deletePhoto,
} from "@/api/photos";

// ── Icons ──────────────────────────────────────────────────────────────────

const MoreIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const LockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const UnlockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
);

const FlagIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
);

const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" /><path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const SpinnerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={styles.spinner}>
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Normalise a raw Photo document from the API into the shape the UI needs.
 *
 * API shape (from getPublicPhotos):
 *   { _id, photo_url, is_private, is_reported,
 *     location_id: { name, name_en },
 *     user_id:     { username, name, current_level } }
 */
const normalisePhoto = (raw) => ({
    id: raw._id,
    imageUrl: raw.photo_url,
    // Prefer Arabic name, fall back to English, then a generic label
    placeName: raw.location_id?.name || raw.location_id?.name_en || "Unknown location",
    username: raw.user_id?.username || raw.user_id?.name || "",
    isPrivate: raw.is_private ?? false,
    isReported: raw.is_reported ?? false,
});

// ── LightboxModal ──────────────────────────────────────────────────────────

function LightboxModal({ photo, onClose }) {
    return (
        <div className={styles.lightboxOverlay} onClick={onClose}>
            <button className={styles.lightboxCloseBtn} onClick={onClose} aria-label="Close">
                <CloseIcon />
            </button>
            <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                <img src={photo.imageUrl} alt={photo.placeName} className={styles.lightboxImage} />
                <div className={styles.lightboxLabel}>{photo.placeName}</div>
                {photo.username && (
                    <div className={styles.lightboxMeta}>@{photo.username}</div>
                )}
            </div>
        </div>
    );
}

// ── PhotoCard ──────────────────────────────────────────────────────────────

function PhotoCard({ photo, onTogglePrivacy, onReport, onDelete, onClick, actionLoading }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setMenuOpen((v) => !v);
    };

    const handleOption = (e, fn) => {
        e.stopPropagation();
        setMenuOpen(false);
        fn();
    };

    return (
        <div className={styles.card} onClick={onClick}>
            <img src={photo.imageUrl} alt={photo.placeName} className={styles.cardImage} />
            <div className={styles.cardOverlay} />

            {/* Badges */}
            {photo.isPrivate && (
                <span className={styles.badgePrivate} title="Private">
                    <LockIcon />
                </span>
            )}
            {photo.isReported && (
                <span className={styles.badgeReported} title="Reported">
                    <FlagIcon />
                </span>
            )}

            <div className={styles.cardLabel}>{photo.placeName}</div>

            {/* Options menu */}
            <div className={styles.menuWrapper} onClick={(e) => e.stopPropagation()}>
                <button
                    className={styles.optionsBtn}
                    onClick={handleMenuClick}
                    aria-label="Options"
                    disabled={actionLoading}
                >
                    {actionLoading ? <SpinnerIcon /> : <MoreIcon />}
                </button>

                {menuOpen && (
                    <>
                        <div className={styles.menuBackdrop} onClick={() => setMenuOpen(false)} />
                        <div className={styles.menu}>

                            {/* Toggle privacy — owner action */}
                            <button
                                className={styles.menuItem}
                                onClick={(e) => handleOption(e, onTogglePrivacy)}
                            >
                                {photo.isPrivate ? <UnlockIcon /> : <LockIcon />}
                                {photo.isPrivate ? "Make public" : "Make private"}
                            </button>

                            <div className={styles.menuDivider} />

                            {/* Report */}
                            <button
                                className={styles.menuItem}
                                onClick={(e) => handleOption(e, onReport)}
                                disabled={photo.isReported}
                            >
                                <FlagIcon />
                                {photo.isReported ? "Already reported" : "Report"}
                            </button>

                            <div className={styles.menuDivider} />

                            {/* Delete — admin action */}
                            <button
                                className={`${styles.menuItem} ${styles.menuItemDelete}`}
                                onClick={(e) => handleOption(e, onDelete)}
                            >
                                <TrashIcon /> Delete
                            </button>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Gallery ────────────────────────────────────────────────────────────────

export default function Gallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightbox, setLightbox] = useState(null);

    // Track which photo id is currently mid-action (shows spinner on that card)
    const [actionLoading, setActionLoading] = useState(null);

    // ── Fetch on mount ───────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                setLoading(true);
                setError(null);
                // getPublicPhotos returns a plain array: res.data = Photo[]
                const res = await getPublicPhotos();
                setPhotos((res.data || []).map(normalisePhoto));
            } catch (err) {
                setError(err?.response?.data?.message || "Failed to load photos.");
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    // ── Toggle privacy ───────────────────────────────────────────────────────
    const handleTogglePrivacy = async (photo) => {
        try {
            setActionLoading(photo.id);
            const res = await togglePhotoPrivacy(photo.id);
            // returns { success, data: Photo }
            const updated = normalisePhoto(res.data.data);
            setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        } catch (err) {
            alert(err?.response?.data?.message || "Could not update privacy.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── Report ───────────────────────────────────────────────────────────────
    const handleReport = async (photo) => {
        if (photo.isReported) return;
        try {
            setActionLoading(photo.id);
            await reportPhoto(photo.id);
            // Optimistically mark as reported in UI
            setPhotos((prev) =>
                prev.map((p) => (p.id === photo.id ? { ...p, isReported: true } : p))
            );
        } catch (err) {
            alert(err?.response?.data?.message || "Could not report photo.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── Delete (admin) ───────────────────────────────────────────────────────
    const handleDelete = async (photo) => {
        if (!window.confirm(`Delete this photo from "${photo.placeName}"?`)) return;
        try {
            setActionLoading(photo.id);
            await deletePhoto(photo.id);
            setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        } catch (err) {
            alert(err?.response?.data?.message || "Could not delete photo.");
        } finally {
            setActionLoading(null);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            <AdminSidebar type="user" />
            {/* ── Header ── */}
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <div className={styles.headerLeft}>
                        <h1 className={styles.headerTitle}>Gallery</h1>
                        {!loading && photos.length > 0 && (
                            <span className={styles.headerCount}>
                                {photos.length} {photos.length === 1 ? "photo" : "photos"}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Body ── */}
            <div className={styles.gridWrapper}>

                {/* Loading */}
                {loading && (
                    <div className={styles.stateCenter}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.stateText}>Loading photos…</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className={styles.stateCenter}>
                        <div className={styles.emptyIcon}>⚠️</div>
                        <p className={styles.emptyTitle}>Something went wrong</p>
                        <p className={styles.emptyDesc}>{error}</p>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && photos.length === 0 && (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>🏔️</div>
                        <p className={styles.emptyTitle}>No photos yet</p>
                        <p className={styles.emptyDesc}>
                            Community photos will appear here once members complete check-ins.
                        </p>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && photos.length > 0 && (
                    <div className={styles.grid}>
                        {photos.map((photo) => (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                onClick={() => setLightbox(photo)}
                                onTogglePrivacy={() => handleTogglePrivacy(photo)}
                                onReport={() => handleReport(photo)}
                                onDelete={() => handleDelete(photo)}
                                actionLoading={actionLoading === photo.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Lightbox ── */}
            {lightbox && (
                <LightboxModal photo={lightbox} onClose={() => setLightbox(null)} />
            )}
        </div>
    );
}