import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar/SearchBar";
import NotificationDropdown from "@/components/NotificationDropdown/NotificationDropdown";
import ChatBox from "@/components/ChatBox/ChatBox";
import styles from "./AdminTopBar.module.css";

const USER_PROFILE_KEY = "massar_user_profile";

function AdminTopBar({ placeholder, user }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
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
    setShowChat(false);
  };

  return (
    <>
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

          <div className={styles.chatWrapper}>
            <button
              className={`${styles.iconBtn} ${showChat ? styles.iconBtnActive : ""}`}
              title="Messages"
              aria-label="Messages"
              onClick={() => { setShowChat(!showChat); setShowNotifications(false); }}
            >
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
          </div>

          <button
            className={styles.iconBtn}
            title="Support"
            aria-label="Support"
            onClick={() => navigate("/admin/support")}
          >
            <span className="material-symbols-outlined">help</span>
          </button>

          <div className={styles.userInfo} onClick={() => navigate("/admin/profile")} style={{ cursor: "pointer" }}>
            <div className={styles.userText}>
              <span className={styles.userName}>
                {profileData?.name || user?.name || "Admin User"}
              </span>
              <span className={styles.userRole}>
                {profileData?.role || user?.role || "Administrator"}
              </span>
            </div>
            <div className={styles.avatar}>
              {profileData?.avatar || user?.avatar ? (
                <img src={profileData?.avatar || user?.avatar} alt="avatar" />
              ) : (
                <span className="material-symbols-outlined">account_circle</span>
              )}
            </div>
          </div>
        </div>
      </header>
      <ChatBox isOpen={showChat} onClose={() => setShowChat(false)} />
    </>
  );
}

export default AdminTopBar;
