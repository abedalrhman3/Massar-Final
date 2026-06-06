import React from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./UserDashboard.module.css";
import { useAuth } from "@/context/AuthContext";

function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    await logout();
    navigate("/");
  };

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const avatarSrc = user.avatar_url
    ? `http://localhost:5000${user.avatar_url}`
    : defaultAvatar;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src={avatarSrc} alt={user.username || "User"} className={styles.avatar} />
          <h1 className={styles.welcome}>Welcome back, {user.username || "Explorer"}!</h1>
          <p className={styles.rank}>Level: {user.current_level || "Explorer"} • {user.total_xp || 0} XP</p>
        </div>

        <div className={styles.menu}>
          <Link to="/map" className={`${styles.menuBtn} ${styles.primaryBtn}`}>
            🗺️ Explore the Map
          </Link>
          <Link to="/profile" className={styles.menuBtn}>
            👤 Manage Profile & Avatar
          </Link>
          {user.is_admin && (
            <Link to="/admin" className={`${styles.menuBtn} ${styles.adminBtn}`}>
              🔑 Admin Panel
            </Link>
          )}
          <button onClick={handleLogout} className={`${styles.menuBtn} ${styles.logoutBtn}`}>
            🚪 Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
