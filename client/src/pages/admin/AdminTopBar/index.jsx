import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../components/SearchBar/SearchBar";
import NotificationDropdown from "../../components/NotificationDropdown/NotificationDropdown";
import styles from "./AdminTopBar.module.css";

const USER_PROFILE_KEY = "massar_user_profile";

function AdminTopBar({ placeholder, user }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationRead, setNotificationRead] = useState(() => {
    const stored = localStorage.getItem("massar_notifications_read");
    return stored === "true";
  });

  // Load user profile from localStorage
  const [profileData, setProfileData] = useState(() => {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  // Update profile data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      if (stored) {
        setProfileData(JSON.parse(stored));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Listen for custom profile update event
  useEffect(() => {
    const handleProfileUpdate = () => {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      if (stored) {
        setProfileData(JSON.parse(stored));
      }
    };
    window.addEventListener("massar-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("massar-profile-updated", handleProfileUpdate);
  }, []);

  // Update notification read state when marked as read
  useEffect(() => {
    const handleNotificationStateChange = () => {
      const stored = localStorage.getItem("massar_notifications_read");
      setNotificationRead(stored === "true");
    };
    window.addEventListener("massar-notifications-read", handleNotificationStateChange);
    return () => window.removeEventListener("massar-notifications-read", handleNotificationStateChange);
  }, []);

  const handleSearch = (query) => {
    if (query.length > 2) {
      navigate(`/admin/destinations?search=${encodeURIComponent(query)}`);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.searchWrapper}>
        <SearchBar
          placeholder={placeholder || "Search archives, destinations..."}
          onSearch={handleSearch}
        />
      </div>

      <div className={styles.actions}>
        <div className={styles.notificationWrapper}>
          <button
            className={`${styles.iconBtn} ${showNotifications ? styles.iconBtnActive : ""}`}
            title="Notifications"
            aria-label="Notifications"
            onClick={toggleNotifications}
          >
            <span className="material-symbols-outlined">notifications</span>
            {!notificationRead && <span className={styles.badge}></span>}
          </button>
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onMarkAllRead={() => setNotificationRead(true)}
          />
        </div>

        <button
          className={styles.mainPageBtn}
          title="Main Page"
          aria-label="Main Page"
          onClick={() => window.location.href = "http://localhost:5173/"}
        >
          <span className="material-symbols-outlined">home</span>
          <span>Main Page</span>
        </button>
      </div>
    </header>
  );
}

export default AdminTopBar;
