import { useState, useEffect, useRef } from "react";
import styles from "./NotificationDropdown.module.css";

const mockNotifications = [
  {
    id: 1,
    type: "success",
    title: "Destination Published",
    message: "Petra has been successfully published and is now live.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Pending Review",
    message: "5 destinations are awaiting moderation review.",
    time: "15 min ago",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "New User Registered",
    message: "Sarah Ahmed joined as a new Editor.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 4,
    type: "success",
    title: "Backup Complete",
    message: "System backup completed successfully.",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "info",
    title: "Weekly Report Ready",
    message: "Your weekly analytics report is ready to view.",
    time: "Yesterday",
    read: true,
  },
];

function NotificationDropdown({ isOpen, onClose, onMarkAllRead }) {
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    localStorage.setItem("massar_notifications_read", "true");
    window.dispatchEvent(new Event("massar-notifications-read"));
    if (onMarkAllRead) onMarkAllRead();
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "check_circle";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "info";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={styles.dropdown}
      style={{ viewTransitionName: "notification-panel" }}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllAsRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${styles.item} ${!notification.read ? styles.unread : ""}`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className={`${styles.iconWrap} ${styles[notification.type]}`}>
              <span className="material-symbols-outlined">{getIcon(notification.type)}</span>
            </div>
            <div className={styles.content}>
              <p className={styles.itemTitle}>{notification.title}</p>
              <p className={styles.itemMessage}>{notification.message}</p>
              <span className={styles.time}>{notification.time}</span>
            </div>
            {!notification.read && <span className={styles.dot}></span>}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllBtn}>View all notifications</button>
      </div>
    </div>
  );
}

export default NotificationDropdown;