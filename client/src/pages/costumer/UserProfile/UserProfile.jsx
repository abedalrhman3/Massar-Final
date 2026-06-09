import React, { useState, useEffect } from "react";
import styles from "./UserProfile.module.css";
import axios from "axios";

const SERVER = "http://localhost:5000";

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const localUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchUserData = async () => {
    if (!localUser._id) {
      setError("User session not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${SERVER}/api/users/${localUser._id}`);
      setUser(res.data.user);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch profile data from server.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", localUser._id);

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${SERVER}/api/user/update-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setUser((prev) => ({ ...prev, avatar_url: res.data.avatarUrl }));
        
        const updatedLocal = { ...localUser, avatar_url: res.data.avatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedLocal));
        
        setSuccess("Avatar updated successfully!");
      } else {
        setError("Failed to update avatar.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error uploading avatar.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  // Guard: if avatar_url is already an absolute URL (Cloudinary), don't prepend SERVER.
  const avatarSrc = user?.avatar_url
    ? (user.avatar_url.startsWith("http") ? user.avatar_url : `${SERVER}${user.avatar_url}`)
    : defaultAvatar;

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <h1 className={styles.title}>Your Profile</h1>
        <p className={styles.subtitle}>Manage your profile details and explore achievements</p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <div className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <img
              src={avatarSrc}
              alt={user?.username || "Avatar"}
              className={styles.avatar}
            />
            {uploading && <div className={styles.avatarOverlay}><div className={styles.smallSpinner}></div></div>}
          </div>
          
          <label className={styles.uploadBtn}>
            {uploading ? "Uploading..." : "Change Avatar"}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Username</span>
            <span className={styles.value}>{user?.username || "N/A"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Email Address</span>
            <span className={styles.value}>{user?.email || "N/A"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Explorer Rank</span>
            <span className={`${styles.value} ${styles.rank}`}>{user?.current_level || "Explorer"}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Total Experience (XP)</span>
            <span className={styles.value}>{user?.total_xp || 0} XP</span>
          </div>
        </div>

        <div className={styles.badgesSection}>
          <h2 className={styles.sectionTitle}>Unlocked Badges</h2>
          {user?.unlocked_badges && user.unlocked_badges.length > 0 ? (
            <div className={styles.badgesGrid}>
              {user.unlocked_badges.map((badge) => (
                <div key={badge._id} className={styles.badgeCard}>
                  <img
                    src={badge.icon_url
                      ? (badge.icon_url.startsWith("http") ? badge.icon_url : `${SERVER}${badge.icon_url}`)
                      : defaultAvatar}
                    alt={badge.name_en || badge.name}
                    className={styles.badgeIcon}
                  />
                  <span className={styles.badgeName}>{badge.name_en || badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyBadges}>
              <p>No badges unlocked yet. Start exploring locations to unlock them!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
