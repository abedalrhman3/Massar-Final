import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import styles from "./Map.module.css";
import api, { BASE_URL } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

const LocationReviews = ({ location, onClose }) => {
  const { i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [rating, setRating] = useState(5);
  const [photo, setPhoto] = useState(null);
  const { user, setUser } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [location._id]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/locations/${location._id}/posts`);
      setPosts(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("content", newPost);
      formData.append("rating", rating);
      if (photo) {
        formData.append("photo", photo);
      }

      const res = await api.post(`/locations/${location._id}/posts`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setNewPost("");
        setPhoto(null);
        
        // Update user state if context exists
        if (res.data.xp && setUser) {
          const updatedUser = { ...user, total_xp: res.data.xp, current_level: res.data.level };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          alert(i18n.language === "ar" ? `أحسنت! ربحت +${res.data.xpGained} XP!` : `Great job! You earned +${res.data.xpGained} XP!`);
        }

        fetchPosts();
      }
    } catch (error) {
      console.error("Error submitting post", error);
      alert(i18n.language === "ar" ? "فشل إضافة التعليق والتقييم" : "Failed to submit review");
    }
  };

  const recentPosts = posts.filter((p) => {
    const postDate = new Date(p.createdAt || p.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return postDate >= thirtyDaysAgo;
  });

  const pastPosts = posts.filter((p) => {
    const postDate = new Date(p.createdAt || p.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return postDate < thirtyDaysAgo;
  });

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
          
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center", marginBottom: "15px" }}>
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
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label style={{ fontSize: "1.3rem", fontWeight: "600" }}>
                {i18n.language === "ar" ? "إضافة صورة:" : "Add Photo:"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                style={{ fontSize: "1.1rem" }}
              />
            </div>
          </div>

          <button type="submit" className={styles.btn} style={{ padding: "8px 18px", width: "100%" }}>
            {i18n.language === "ar" ? "نشر التقييم" : "Post Review"}
          </button>
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
                {post.image_url && (
                  <img
                    src={post.image_url.startsWith("http") ? post.image_url : `${BASE_URL}${post.image_url}`}
                    alt="Review attachment"
                    style={{ width: "100%", maxHeight: "150px", borderRadius: "10px", marginTop: "8px", marginBottom: "8px", objectFit: "cover" }}
                  />
                )}
                <span className={styles.postMeta}>
                  {new Date(post.createdAt || post.created_at).toLocaleDateString()}
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
                {post.image_url && (
                  <img
                    src={post.image_url.startsWith("http") ? post.image_url : `${BASE_URL}${post.image_url}`}
                    alt="Review attachment"
                    style={{ width: "100%", maxHeight: "150px", borderRadius: "10px", marginTop: "8px", marginBottom: "8px", objectFit: "cover" }}
                  />
                )}
                <span className={styles.postMeta}>
                  {new Date(post.createdAt || post.created_at).toLocaleDateString()}
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
