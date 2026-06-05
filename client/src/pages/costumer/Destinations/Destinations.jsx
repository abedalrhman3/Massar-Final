import { useState } from "react";
import styles from "./Destinations.module.css";
import DestinationCard from "@/components/DestinationCard/DestinationCard";
import SearchBar from "@/components/SearchBar/SearchBar";
import { getDestinations } from "@/api/destination";
import { useApi } from "@/hooks/useApi";

function Tooltip({ text }) {
    return (
        <span className={styles.tooltipWrapper}>
            <span className={styles.tooltipTrigger} aria-label="More information">?</span>
            <span className={styles.tooltipBox} role="tooltip">{text}</span>
        </span>
    );
}

const PAGE_SIZE = 8;

function Section({ title, destinations, showTooltip, tooltipText, loading }) {
    const [visible, setVisible] = useState(PAGE_SIZE);

    if (loading) {
        return (
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{title}</h2>
                <p style={{ color: '#888', padding: '20px 0' }}>Loading...</p>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
                {title}
            </h2>
            <div className={styles.toursGrid}>
                {destinations.slice(0, visible).map((dest) => (
                    <div key={dest._id} className={styles.cardWrapper}>
                        <DestinationCard
                            image={dest.image}
                            name={dest.name}
                            description={dest.overview?.summary || ''}
                            rating={dest.rating}
                            likes={dest.likes}
                            slug={dest.slug}
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

function Tours() {
    const { data, loading, error } = useApi(getDestinations);

    // data = { success, data: Destination[] }
    const all = data?.data ?? [];

    // Sort variants — all derived from the same fetched list
    const byRating = [...all].sort((a, b) => b.rating - a.rating);
    const byLikes = [...all].sort((a, b) => b.likes - a.likes);
    const hidden = [...all].sort((a, b) => a.likes - b.likes).slice(0, 10);

    const topDestinations = byRating.slice(0, 10);
    const trending = byLikes.slice(0, 10);
    const hiddenDestinations = hidden;

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
                Failed to load destinations. Please try again.
            </div>
        );
    }

    return (
        <>
            <div style={{ backgroundColor: "#2D6BFF" }}>
                <div className={styles.toursHero}>
                    <h2>Explore travel guides and itineraries</h2>
                    <SearchBar />
                </div>
            </div>

            <div className={styles.toursPage}>
                <Section
                    title="Top Destinations"
                    destinations={topDestinations}
                    loading={loading}
                />
                <Section
                    title="Trending"
                    destinations={trending}
                    loading={loading}
                />
                <Section
                    title="Hidden Destinations"
                    destinations={hiddenDestinations}
                    loading={loading}
                    showTooltip

                />
                <Section
                    title="All Destinations"
                    destinations={byLikes}
                    loading={loading}
                />
            </div>
        </>
    );
}

export default Tours;