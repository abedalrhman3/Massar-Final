import { useState, useEffect, useMemo } from "react";
import styles from "./Destinations.module.css";
import DestinationCard from "@/components/DestinationCard/DestinationCard";
import SearchBar from "@/components/SearchBar/SearchBar";
import { getDestinations } from "@/api/destination";
import { useApi } from "@/hooks/useApi";



// ── Tooltip helper ────────────────────────────────────────────────
function Tooltip({ text }) {
    return (
        <span className={styles.tooltipWrapper}>
            <span className={styles.tooltipTrigger} aria-label="More information">?</span>
            <span className={styles.tooltipBox} role="tooltip">{text}</span>
        </span>
    );
}

// ── Destination grid section ──────────────────────────────────────
const PAGE_SIZE = 8;

function Section({ title, destinations, showTooltip, tooltipText, loading, isSearch, onLikeToggle }) {
    const [visible, setVisible] = useState(PAGE_SIZE);

    if (loading) {
        return (
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                <div className={styles.skeletonGrid}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard} />
                    ))}
                </div>
            </section>
        );
    }

    if (!destinations.length) return null;

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                {title}
                {showTooltip && tooltipText && <Tooltip text={tooltipText} />}
            </h2>
            <div className={`${styles.toursGrid} ${isSearch ? styles.searchGrid : ''}`}>
                {destinations.slice(0, visible).map((dest) => (
                    <div key={dest._id} className={styles.cardWrapper}>
                        <DestinationCard
                            id={dest._id}
                            image={dest.image}
                            name={dest.name}
                            description={dest.tagline || dest.description || ''}
                            rating={dest.rating}
                            likes={dest.likes}
                            slug={dest.slug}
                            isLiked={dest.isLiked ?? false}
                            onLikeToggle={onLikeToggle}
                        />
                    </div>
                ))}
            </div>
            {visible < destinations.length && (
                <button className={styles.toursMore} onClick={() => setVisible((p) => p + PAGE_SIZE)}>
                    Show more
                </button>
            )}
        </section>
    );
}

// ── Main page ─────────────────────────────────────────────────────
function Tours() {
    const { data, loading, error } = useApi(getDestinations);
    const [destinations, setDestinations] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        if (data?.data) {
            setDestinations(data.data);
        }
    }, [data]);

    const handleLikeToggle = (id, isLiked, likesCount) => {
        setDestinations((prev) =>
            prev.map((dest) =>
                dest._id === id
                    ? { ...dest, isLiked, likes: likesCount }
                    : dest
            )
        );
    };

    const all = destinations;

    // ── Client-side search ────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return all;
        return all.filter((d) =>
            d.name?.toLowerCase().includes(q) ||
            d.tagline?.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q)
        );
    }, [all, query]);

    // ── Pre-sorted section lists (unchanged when no search) ───────
    const byRating = useMemo(() => [...all].sort((a, b) => b.rating - a.rating), [all]);
    const byLikes = useMemo(() => [...all].sort((a, b) => b.likes - a.likes), [all]);
    const hidden = useMemo(() => [...all].sort((a, b) => a.likes - b.likes).slice(0, 10), [all]);

    const isSearching = query.trim().length > 0;

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
                Failed to load destinations. Please try again.
            </div>
        );
    }

    return (
        <>
            {/* ── Hero / Search Banner ── */}
            <div className={styles.heroWrapper}>
                <div className={styles.toursHero}>
                    <span className={styles.heroEyebrow}>Discover Jordan</span>
                    <h1 className={styles.heroTitle}>Explore travel guides &amp; itineraries</h1>

                    <SearchBar
                        placeholder="Search destinations, regions, seasons…"
                        onSearch={setQuery}
                    />
                </div>
            </div>

            <div className={styles.toursPage}>
                {isSearching ? (
                    /* Search results — single flat list */
                    <div className={styles.searchWrapper}>
                        <Section
                            title={`Search results for "${query}"`}
                            destinations={filtered}
                            loading={loading}
                            isSearch={true}
                            onLikeToggle={handleLikeToggle}
                        />
                        <div className={styles.resultsCounter}>
                            results  : {filtered.length}
                        </div>
                    </div>
                ) : (
                    /* Default categorised sections */
                    <>
                        <Section title="Top Destinations" destinations={byRating.slice(0, 10)} loading={loading} onLikeToggle={handleLikeToggle} />
                        <Section title="Trending" destinations={byLikes.slice(0, 10)} loading={loading} onLikeToggle={handleLikeToggle} />
                        <Section
                            title="Hidden Gems"
                            destinations={hidden}
                            loading={loading}
                            showTooltip
                            tooltipText="Lesser-known destinations with fewer visitors — explore before everyone else does."
                            onLikeToggle={handleLikeToggle}
                        />
                        <Section title="All Destinations" destinations={byLikes} loading={loading} onLikeToggle={handleLikeToggle} />
                    </>
                )}
            </div>
        </>
    );
}

export default Tours;