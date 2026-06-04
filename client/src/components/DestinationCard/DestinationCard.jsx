import { useState } from "react";
import styles from "./DestinationCard.module.css";
import { Link } from "react-router-dom";

function DestinationCard({ id, image, name, description, rating, likes }) {
  const [liked, setLiked] = useState(false);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <Link
      to={`/destinations/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className={styles.destCard}>
        <img src={image} alt={name} className={styles.destCardImg} />
        <div className={styles.destCardBody}>
          <h3 className={styles.destCardName}>{name}</h3>
          <p className={styles.destCardDesc}>{description}</p>
          <div className={styles.destCardFooter}>
            <span className={styles.destCardRating}>
              <span className={styles.destCardRatingLabel}>Rating </span>
              {"★".repeat(Math.floor(rating))}
              {"☆".repeat(5 - Math.floor(rating))}
            </span>
            <span className={styles.destCardLikes}>
              <i
                className={liked ? "fas fa-heart" : "far fa-heart"}
                onClick={handleLike}
                style={{ color: liked ? "red" : "inherit", cursor: "pointer" }}
              ></i>{" "}
              {likes}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default DestinationCard;
