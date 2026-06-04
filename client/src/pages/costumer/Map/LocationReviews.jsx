import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import styles from "./Map.module.css";

const SERVER = "http://localhost:5000";

const LocationReviews = ({ location, onClose }) => {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [rating, setRating] = useState(5);

  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchPosts();
  }, [location._id]);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${SERVER}/api/locations/${location._id}/posts`);
      setPosts(res.data);
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localUser._id || "60d5ecb8b392d70015340123";
      await axios.post(`${SERVER}/api/locations/${location._id}/posts`, {
        user_id: userId,
        content: newPost,
        rating: rating,
      });
      setNewPost("");
      fetchPosts();
    } catch (error) {
      console.error("Error submitting post", error);
    }
  };

  const recentPosts = posts.filter((p) => p.visit_status === "Recent");
  const pastPosts = posts.filter(
    (p) => p.visit_status === "Past" || p.visit_status === "Unverified"
  );

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={`${styles.popup} ${styles.popupLarge}`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className={styles.title}>
          {i18n.language === "ar" ? "آراء الزوار عن" : "Reviews for"}{" "}
          {i18n.language === "ar" ? location.name : location.name_en}
        </h2>

        <form onSubmit={handleSubmit} className={styles.reviewForm}>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={i18n.language === "ar" ? "شارك تجربتك..." : "Share your experience..."}
            className={styles.textarea}
            required
          />
          <div className={styles.formControls}>
            <div>
              <label style={{ marginRight: "10px", fontSize: "1.3rem", fontWeight: "600" }}>
                {i18n.language === "ar" ? "التقييم:" : "Rating:"}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className={styles.numberInput}
              />{" "}
              ⭐
            </div>
            <button type="submit" className={styles.btn} style={{ padding: "8px 18px" }}>
              {i18n.language === "ar" ? "نشر" : "Post"}
            </button>
          </div>
        </form>

        <div className={styles.reviewsGrid}>
          <div>
            <h3 className={`${styles.reviewsSectionTitle} ${styles.recentTitle}`}>
              {i18n.language === "ar"
                ? "🚀 زاروا المكان حديثاً (آخر 30 يوم)"
                : "🚀 Recent Visitors (Last 30 Days)"}
            </h3>
            {recentPosts.length === 0 && (
              <p className={styles.emptyText}>
                {i18n.language === "ar" ? "لا يوجد آراء حديثة." : "No recent reviews."}
              </p>
            )}
            {recentPosts.map((post) => (
              <div key={post._id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <strong className={styles.postUser}>{post.user_id?.username || "Explorer"}</strong>
                  <span className={styles.postRating}>{post.rating} ⭐</span>
                </div>
                <p className={styles.postContent}>{post.content}</p>
                <span className={styles.postMeta}>
                  {new Date(post.created_at).toLocaleDateString()} - Verified Recent
                </span>
              </div>
            ))}
          </div>

          <div>
            <h3 className={`${styles.reviewsSectionTitle} ${styles.pastTitle}`}>
              {i18n.language === "ar" ? "🕰️ كانوا هنا سابقاً" : "🕰️ Past Visitors"}
            </h3>
            {pastPosts.length === 0 && (
              <p className={styles.emptyText}>
                {i18n.language === "ar" ? "لا يوجد آراء سابقة." : "No past reviews."}
              </p>
            )}
            {pastPosts.map((post) => (
              <div key={post._id} className={styles.postCard}>
                <div className={styles.postHeader}>
                  <strong className={styles.postUser}>{post.user_id?.username || "Explorer"}</strong>
                  <span className={styles.postRating}>{post.rating} ⭐</span>
                </div>
                <p className={styles.postContent}>{post.content}</p>
                <span className={styles.postMeta}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button type="button" className={styles.closeBtn} onClick={onClose}>
          &#x2715;
        </button>
      </motion.div>
    </div>
  );
};

export default LocationReviews;
