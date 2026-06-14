import { useState, useEffect } from "react";
import AdminGlobalSearch from "@/components/AdminGlobalSearch/AdminGlobalSearch";
import NotificationDropdown from "@/components/NotificationDropdown/NotificationDropdown";
import styles from "./AdminTopBar.module.css";

const USER_PROFILE_KEY = "massar_user_profile";

function AdminTopBar({ placeholder, user }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationRead, setNotificationRead] = useState(() => {
    const stored = localStorage.getItem("massar_notifications_read");
    return stored === "true";
  });

  
  const [profileData, setProfileData] = useState(() => {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  
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

  
  useEffect(() => {
    const handleNotificationStateChange = () => {
      const stored = localStorage.getItem("massar_notifications_read");
      setNotificationRead(stored === "true");
    };
    window.addEventListener("massar-notifications-read", handleNotificationStateChange);
    return () => window.removeEventListener("massar-notifications-read", handleNotificationStateChange);
  }, []);


  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.searchWrapper}>
        <AdminGlobalSearch />
      </div>

      <div className={styles.actions}>



      </div>
    </header>
  );
}

export default AdminTopBar;
