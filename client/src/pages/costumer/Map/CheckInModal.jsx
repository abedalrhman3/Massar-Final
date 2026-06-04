import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import styles from "./Map.module.css";

const SERVER = "http://localhost:5000";

const CheckInModal = ({ location, onClose, onCheckInSuccess, currentUser, manualPosition }) => {
  const { t, i18n } = useTranslation();
  const [result, setResult] = useState(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [file, setFile] = useState(null);

  const tasks = location.tasks || [];
  const currentTask = tasks[taskIndex];

  const handleClaim = async (e) => {
    e.preventDefault();

    const doCheckIn = async (lat, lng) => {
      try {
        const userId = currentUser?._id || "";
        const fd = new FormData();
        fd.append("userId", userId);
        fd.append("locationId", location._id);
        fd.append("taskIndex", taskIndex);
        fd.append("userLat", lat);
        fd.append("userLng", lng);
        if (file) fd.append("photo", file);

        const res = await axios.post(`${SERVER}/api/user/complete-task`, fd);
        if (taskIndex < tasks.length - 1) {
          alert(`Task Completed! You earned ${currentTask.xp} XP`);
          setTaskIndex(taskIndex + 1);
          setFile(null);
          if (onCheckInSuccess) onCheckInSuccess();
        } else {
          setResult(res.data);
          if (onCheckInSuccess) onCheckInSuccess();
        }
      } catch (error) {
        if (error.response?.status === 400) {
          alert(error.response.data.error);
        } else {
          alert(i18n.language === "ar" ? "حدث خطأ أثناء تسجيل الدخول" : "Error checking in.");
        }
      }
    };

    if (manualPosition) {
      await doCheckIn(manualPosition.lat, manualPosition.lng);
      return;
    }

    if (!navigator.geolocation) {
      alert(i18n.language === "ar" ? "تحديد الموقع غير مدعوم في متصفحك" : "Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => doCheckIn(pos.coords.latitude, pos.coords.longitude),
      (err) => alert((i18n.language === "ar" ? "خطأ في تحديد الموقع: " : "Location error: ") + err.message),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  return (
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.popup}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {!result ? (
          <form onSubmit={handleClaim}>
            <h2 className={styles.title}>{t("check_in")} 📍</h2>
            <p className={styles.subtitle}>
              {i18n.language === "ar" ? location.name : location.name_en}
            </p>

            {tasks.length > 0 ? (
              <div className={styles.taskCard}>
                <h3>
                  Task {taskIndex + 1} of {tasks.length}
                </h3>
                <p>
                  {i18n.language === "ar"
                    ? currentTask.description
                    : currentTask.description_en}
                </p>
                <p>
                  <strong>Reward:</strong> {currentTask.xp} XP
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  className={styles.fileInput}
                  required
                />
              </div>
            ) : (
              <p style={{ fontSize: "1.3rem", margin: "20px 0" }}>
                {i18n.language === "ar" ? "لا يوجد مهام محددة. فقط قم بتسجيل حضورك!" : "No specific tasks. Just check in!"}
              </p>
            )}

            <button type="submit" className={styles.btn}>
              {tasks.length > 0
                ? taskIndex === tasks.length - 1
                  ? "Complete Location!"
                  : "Submit Photo & Next"
                : t("claim_badge")}
            </button>
            <button type="button" className={styles.closeBtn} onClick={onClose}>
              &#x2715;
            </button>
          </form>
        ) : (
          <>
            <h2 className={styles.title}>🎉 {result.message}</h2>

            {result.badge && !result.questCompleted && (
              <motion.img
                src={`${SERVER}${result.badge.icon_url}`}
                className={styles.badgeIconLarge}
                animate={{ rotate: 360 }}
                transition={{ duration: 1 }}
              />
            )}

            {result.rareBadgeGranted && (
              <div className={styles.rareGlowText}>{t("rare_badge")}</div>
            )}

            {result.questCompleted && (
              <div className={styles.taskCard} style={{ border: "2px solid #D97706" }}>
                <h3 className={styles.rareGlowText}>QUEST COMPLETED!</h3>
                <h4 style={{ fontSize: "1.4rem", margin: "10px 0" }}>
                  {i18n.language === "ar"
                    ? result.questCompleted.title
                    : result.questCompleted.title_en}
                </h4>
                <p>+{result.questCompleted.bonus_xp} XP</p>
                <p>
                  New Title: <strong>{result.questCompleted.title_reward}</strong>
                </p>
                {result.badge && (
                  <motion.img
                    src={`${SERVER}${result.badge.icon_url}`}
                    className={styles.badgeIconLarge}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                  />
                )}
              </div>
            )}

            <button className={styles.btn} onClick={onClose} style={{ marginTop: "20px" }}>
              Close
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CheckInModal;
