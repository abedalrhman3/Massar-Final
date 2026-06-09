import { useState, useEffect } from "react";
import styles from "./DestinationCard.module.css";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { toggleLikeDestination } from "@/api/destination";

function DestinationCard({ id, slug, image, name, description, rating, likes, isLiked = false, onLikeToggle }) {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes ?? 0);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  useEffect(() => {
    setLikeCount(likes ?? 0);
  }, [likes]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const newLiked = !liked;
    const newLikeCount = likeCount + (newLiked ? 1 : -1);
    setLiked(newLiked);
    setLikeCount(newLikeCount);
    onLikeToggle?.(id, newLiked, newLikeCount);

    try {
      const response = await toggleLikeDestination(id);
      // Reconcile with server truth if it returns the new state
      let finalLiked = newLiked;
      let finalLikeCount = newLikeCount;
      if (response.data && typeof response.data.isLiked === "boolean") {
        finalLiked = response.data.isLiked;
        setLiked(finalLiked);
      }
      if (response.data && typeof response.data.likes === "number") {
        finalLikeCount = response.data.likes;
        setLikeCount(finalLikeCount);
      }
      onLikeToggle?.(id, finalLiked, finalLikeCount);
    } catch (err) {
      // Rollback on failure
      setLiked(liked);
      setLikeCount(likeCount);
      onLikeToggle?.(id, liked, likeCount);
      if (err.response?.status === 401) {
        alert("Please log in to like this destination.");
      }
    }
  };

  return (
    <Link
      to={`/destinations/${slug}`}
      style={{ textDecoration: "none", color: "inherit", borderRadius: "12px" }}
    >
      <div className={styles.destCard}>
        <img src={image} alt={name} className={styles.destCardImg} />
        <div className={styles.destCardBody}>
          <h3 className={styles.destCardName}>{name}</h3>
          <p className={styles.destCardDesc}>{description}</p>
          <div className={styles.destCardFooter}>
            <span className={styles.destCardRating}>
              <span className={styles.destCardRatingLabel}>Rating </span>
              {"★".repeat(Math.floor(rating || 0))}
              {"☆".repeat(5 - Math.floor(rating || 0))}
            </span>
            <span
              className={`${styles.destCardLikes} ${liked ? styles.liked : ""}`}
              onClick={handleLike}
              role="button"
              aria-label={liked ? "Unlike destination" : "Like destination"}
              title={liked ? "Unlike" : "Like"}
            >
              <Heart
                size={15}
                fill={liked ? "#FF4D4D" : "none"}
                stroke={liked ? "#FF4D4D" : "currentColor"}
                style={{ transition: "all 0.2s ease" }}
              />
              {likeCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default DestinationCard;