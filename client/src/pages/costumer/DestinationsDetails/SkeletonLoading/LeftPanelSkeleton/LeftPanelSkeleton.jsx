import styles from "@/pages/costumer/DestinationsDetails/Destination.module.css"; // Reusing main layout layout styles
import skeletonStyles from "@/pages/costumer/DestinationsDetails/SkeletonLoading/LeftPanelSkeleton/LeftPanelSkeleton.module.css";

const LeftPanelSkeleton = () => {
    // Helper to generate a repeated number of structural skeleton rows
    const renderSkeletonCards = (count) => {
        return Array(count).fill(0).map((_, i) => (
            <div key={i} className={skeletonStyles.cardSkeleton}>
                <div className={`${skeletonStyles.shimmer} ${skeletonStyles.cardImage}`}></div>
                <div className={skeletonStyles.cardContent}>
                    <div className={`${skeletonStyles.shimmer} ${skeletonStyles.titleLine}`}></div>
                    <div className={`${skeletonStyles.shimmer} ${skeletonStyles.textLineShort}`}></div>
                </div>
            </div>
        ));
    };

    return (
        <div className={styles["left-panel-wrapper"]}>
            <div className={styles["left-panel"]}>

                {/* Hero Banner Skeleton */}
                <div className={`${skeletonStyles.heroSkeleton}`}>
                    <div className={skeletonStyles.shimmer} style={{ width: '100%', height: '100%' }}></div>
                </div>

                <div className={styles["sections-container"]}>
                    {/* Overview Text Skeleton */}
                    <section className={styles.section}>
                        <div className={`${skeletonStyles.shimmer} ${skeletonStyles.headingSkeleton}`}></div>
                        <div className={`${skeletonStyles.shimmer} ${skeletonStyles.textLine}`}></div>
                        <div className={`${skeletonStyles.shimmer} ${skeletonStyles.textLine}`}></div>
                        <div className={`${skeletonStyles.shimmer} ${skeletonStyles.textLineShort}`}></div>
                    </section>

                    {/* Places Section Skeleton */}
                    <section className={styles.section}>
                        <div className={`${skeletonStyles.shimmer} ${skeletonStyles.headingSkeleton}`}></div>
                        <div className={styles["cards-list"]}>
                            {renderSkeletonCards(3)}
                        </div>
                    </section>

                    {/* Food & Dining Skeleton */}
                    <section className={styles.section}>
                        <div className={`${skeletonStyles.shimmer} ${skeletonStyles.headingSkeleton}`}></div>
                        <div className={styles["cards-list"]}>
                            {renderSkeletonCards(2)}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default LeftPanelSkeleton;