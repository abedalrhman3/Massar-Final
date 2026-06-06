import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { destinations } from "@/data/destinations";
import styles from "./UserProfile.module.css";
import { useAuth } from "@/context/AuthContext";

// ─── SWAP AXIOS FOR YOUR CUSTOM INSTANCE ─────────────────────────────────────
import api from "@/api/client"; // This already targets '${BASE_URL}/api' automatically[cite: 7]

function PasswordStrengthInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  const rules = [
    { label: "8+ characters", test: (v) => v.length >= 8 },
    { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
    { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
    { label: "Number", test: (v) => /\d/.test(v) },
    { label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];

  const passed = rules.filter((r) => r.test(value)).length;
  const strength = value.length === 0 ? 0 : passed;
  const colors = ["", "#ff4d4d", "#ff9900", "#f0c800", "#7bc67e", "#18e605"];
  const barWidth =
    value.length === 0 ? "0%" : `${(strength / rules.length) * 100}%`;

  return (
    <div className={styles.pwFieldWrap}>
      <div className={styles.pwInputRow}>
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.popInput}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setShow(!show)}
          tabIndex={-1}
        >
          <span className="material-symbols-outlined">
            {show ? "visibility_off" : "visibility"}
          </span>
        </button>
      </div>
      {value.length > 0 && (
        <div className={styles.strengthMeter}>
          <div
            className={styles.strengthBar}
            style={{ width: barWidth, background: colors[strength] }}
          />
        </div>
      )}
      {value.length > 0 && (
        <ul className={styles.pwRules}>
          {rules.map((r, i) => (
            <li key={i} className={r.test(value) ? styles.pwOk : ""}>
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SlideModal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div
      className={`${styles.modalOverlay} ${open ? styles.modalOverlayVisible : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${styles.modalSheet} ${open ? styles.modalSheetVisible : ""}`}
      >
        <div className={styles.modalHandle} />
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
}

function UserProfile() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  const currentProfileData = {
    name: user?.name || "User",
    email: user?.email || "email@massar.com",
    role: user?.role === "admin" ? "Master Administrator" : "Explorer",
    location: user?.location || "Amman, Jordan",
    avatar: user?.avatar_url || null,
  };

  const handleLogout = async () => {
    try {
      await logout();
    }
    catch (err) {
      console.error("Logout failed:", err);
    }
    finally {
      navigate("/");
    }
  };

  const [activeModal, setActiveModal] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);

  const openModal = (modal) => {
    setActiveModal(modal);
    if (modal === "name") setDraftName(currentProfileData.name);
    if (modal === "password") {
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setPwError("");
      setPwSuccess("");
    }
  };

  const closeModal = () => setActiveModal(null);

  // ─── FIXED ENDPOINTS (REMOVED BASE_URL/API PREFIXES) ───────────────────────
  const handleSaveName = async () => {
    if (!draftName.trim()) return;
    try {
      const res = await api.put("/auth/update-profile", { name: draftName.trim() });
      setUser(res.data.user);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile name.");
    }
  };

  const handleSavePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!currentPw) {
      setPwError("Please enter your current password.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("New passwords do not match.");
      return;
    }

    try {
      await api.put("/auth/update-password", {
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setPwSuccess("Password updated successfully!");
      setTimeout(closeModal, 1500);
    } catch (err) {
      setPwError(err.response?.data?.message || "Error updating password.");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const res = await api.post("/auth/upload-avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setUser(res.data.user);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to upload avatar image.");
      }
    }
  };

  const handleCardClick = (cardId) => {
    const tabMapping = {
      security: "Security",
      notifications: "Notifications",
      personal: "General",
      billing: "Subscription",
    };
    const targetTab = tabMapping[cardId] || "General";
    navigate(`/admin/settings?tab=${encodeURIComponent(targetTab)}`);
  };

  const stats = {
    totalArticles: user?.stats?.totalArticles ?? 128,
    accuracyScore: user?.stats?.accuracyScore ?? 94,
    managedAuthors: user?.stats?.managedAuthors ?? 14
  };

  const settingsCards = [
    { id: "security", icon: "security", title: "Login & Security", description: "Update password, enable 2FA, and monitor active sessions.", disabled: false },
    { id: "notifications", icon: "notifications_active", title: "Notifications", description: "Customize alerts for new submissions, mentions, and system updates.", disabled: false },
    { id: "personal", icon: "person", title: "Personal Details", description: "Edit public profile info, bio, and editorial social links.", disabled: false },
    { id: "display", icon: "visibility", title: "Workspace Display", description: "Toggle dark mode, adjust typography scales, and UI density.", disabled: true },
    { id: "billing", icon: "payments", title: "Billing & Plan", description: "Manage your Pro Contributor subscription and invoice history.", disabled: false },
    { id: "apps", icon: "extension", title: "Connected Apps", description: "Integrate with Slack, Adobe Creative Cloud, and Notion.", disabled: true },
  ];

  const handleSave = () => {
    alert("Profile configurations updated!");
  };

  const pwRules = [
    { test: (v) => v.length >= 8 },
    { test: (v) => /[A-Z]/.test(v) },
    { test: (v) => /[a-z]/.test(v) },
    { test: (v) => /\d/.test(v) },
    { test: (v) => /[^A-Za-z0-9]/.test(v) },
  ];
  const isNewPwValid = pwRules.every((r) => r.test(newPw));

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroMain}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarLarge}>
              {currentProfileData.avatar ? (
                <img src={currentProfileData.avatar} alt="Avatar" />
              ) : (
                <span className="material-symbols-outlined">account_circle</span>
              )}
            </div>
            <label className={styles.editAvatarBtn}>
              <span className="material-symbols-outlined">edit</span>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
            </label>
          </div>
          <div className={styles.heroInfo}>
            <h1 className={styles.userName}>{currentProfileData.name}</h1>
            <p className={styles.userEmail}>{currentProfileData.email}</p>
            <div className={styles.badgeRow}>
              <span className={styles.roleBadge}>{currentProfileData.role}</span>
              <span className={styles.locationBadge}>{currentProfileData.location}</span>
            </div>
          </div>
        </div>
        <div className={styles.achievementsCard}>
          <h3 className={styles.achievementsTitle}>Verified Achievements</h3>
          <div className={styles.achievementsGrid}>
            <div className={styles.achievementItem}>
              <div className={`${styles.achievementIcon} ${styles.achievementStar}`}><span className="material-symbols-outlined">star</span></div>
              <span className={styles.achievementLabel}>Top Curator</span>
            </div>
            <div className={styles.achievementItem}>
              <div className={`${styles.achievementIcon} ${styles.achievementVerified}`}><span className="material-symbols-outlined">verified</span></div>
              <span className={styles.achievementLabel}>Verified</span>
            </div>
            <div className={styles.achievementItem}>
              <div className={`${styles.achievementIcon} ${styles.achievementVeteran}`}><span className="material-symbols-outlined">history_edu</span></div>
              <span className={styles.achievementLabel}>Veteran</span>
            </div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={() => handleLogout()}>Logout</button>
      </section>

      <section className={styles.bentoGrid}>
        <div className={styles.activityCard}>
          <div className={styles.activityHeader}>
            <h3 className={styles.sectionTitle}>Account Information</h3>
          </div>
          <div className={styles.accountInfoList}>
            <div className={styles.accountInfoRow}>
              <div className={styles.accountInfoLeft}>
                <span className={styles.accountInfoLabel}>Name</span>
                <span className={styles.accountInfoValue}>{currentProfileData.name}</span>
              </div>
              <button className={styles.changeBtn} onClick={() => openModal("name")}>Change</button>
            </div>
            <div className={styles.accountInfoRow}>
              <div className={styles.accountInfoLeft}>
                <span className={styles.accountInfoLabel}>Email</span>
                <span className={styles.accountInfoValue}>{currentProfileData.email}</span>
              </div>
              <button className={styles.changeBtn} onClick={() => openModal("email")}>Change</button>
            </div>
            <div className={styles.accountInfoRow}>
              <div className={styles.accountInfoLeft}>
                <span className={styles.accountInfoLabel}>Password</span>
                <span className={styles.accountInfoValue}>••••••••••••</span>
              </div>
              <button className={styles.changeBtn} onClick={() => openModal("password")}>Change</button>
            </div>
          </div>
        </div>

        <div className={styles.statsPanel}>
          <div className={`${styles.statCard} ${styles.statPrimary}`}>
            <span className="material-symbols-outlined">auto_stories</span>
            <div className={styles.statValue}>{stats.totalArticles}</div>
            <div className={styles.statLabel}>Total Articles Edited</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValueSmall}>{stats.accuracyScore}%</div>
            <div className={styles.statLabelSmall}>Accuracy Score</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${stats.accuracyScore}%` }} />
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.authorsRow}>
              <div className={styles.authorsIcon}><span className="material-symbols-outlined">groups</span></div>
              <div>
                <div className={styles.statValueSmall}>{stats.managedAuthors}</div>
                <div className={styles.statLabelSmall}>Managed Authors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.settingsSection}>
        <div className={styles.settingsHeader}>
          <div>
            <h3 className={styles.settingsTitle}>Profile Settings</h3>
            <p className={styles.settingsSubtitle}>Manage your workspace preferences and security configurations.</p>
          </div>
          <button className={styles.saveBtn} onClick={handleSave}>Save Changes</button>
        </div>
        <div className={styles.settingsGrid}>
          {settingsCards.map((card) => (
            <div
              key={card.id}
              className={`${styles.settingsCard} ${card.disabled ? styles.settingsCardDisabled : ""}`}
              onClick={() => !card.disabled && handleCardClick(card.id)}
            >
              <div className={styles.cardIcon}><span className="material-symbols-outlined">{card.icon}</span></div>
              {!card.disabled && <span className={`material-symbols-outlined ${styles.chevron}`}>chevron_right</span>}
              {card.disabled && <span className={`material-symbols-outlined ${styles.chevron} ${styles.lockIcon}`}>lock</span>}
              <h4 className={styles.cardTitle}>{card.title}</h4>
              <p className={styles.cardDesc}>{card.description}</p>
              {card.disabled && <span className={styles.comingSoonBadge}>Coming soon</span>}
            </div>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <p>The Editorial Archive Admin Portal © 2024</p>
      </footer>

      <SlideModal open={activeModal === "name"} onClose={closeModal} title="Change Name">
        <p className={styles.modalHint}>Update your display name across the platform.</p>
        <label className={styles.popLabel}>Full name</label>
        <input
          className={styles.popInput}
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Enter your name"
          autoFocus
        />
        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={closeModal}>Cancel</button>
          <button
            className={styles.modalConfirmBtn}
            onClick={handleSaveName}
            disabled={!draftName.trim() || draftName.trim() === currentProfileData.name}
          >
            Save Name
          </button>
        </div>
      </SlideModal>

      <SlideModal open={activeModal === "email"} onClose={closeModal} title="Change Email">
        <div className={styles.emailVerifyBox}>
          <div className={styles.emailVerifyIcon}><span className="material-symbols-outlined">mark_email_unread</span></div>
          <p className={styles.emailVerifyText}>
            We'll send a verification email to your current address <strong>{currentProfileData.email}</strong> to confirm it's you.
          </p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={closeModal}>Cancel</button>
          <button
            className={styles.modalConfirmBtn}
            onClick={() => {
              api.post("/auth/request-email-change")
                .then(() => alert(`Verification email sent to ${currentProfileData.email}`))
                .catch(() => alert("Error initiating email change verification."));
              closeModal();
            }}
          >
            Send Verification Email
          </button>
        </div>
      </SlideModal>

      <SlideModal open={activeModal === "password"} onClose={closeModal} title="Change Password">
        <p className={styles.modalHint}>Enter your current password, then choose a strong new one.</p>
        <label className={styles.popLabel}>Current password</label>
        <div className={styles.pwInputRow}>
          <input
            className={styles.popInput}
            type={showCurrentPw ? "text" : "password"}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="Current password"
          />
          <button type="button" className={styles.eyeBtn} onClick={() => setShowCurrentPw(!showCurrentPw)} tabIndex={-1}>
            <span className="material-symbols-outlined">{showCurrentPw ? "visibility_off" : "visibility"}</span>
          </button>
        </div>

        <label className={styles.popLabel} style={{ marginTop: "1.25rem" }}>New password</label>
        <PasswordStrengthInput value={newPw} onChange={setNewPw} placeholder="New password" />

        <label className={styles.popLabel} style={{ marginTop: "1.25rem" }}>Confirm new password</label>
        <div className={styles.pwInputRow}>
          <input
            className={`${styles.popInput} ${confirmPw && confirmPw !== newPw ? styles.popInputError : ""}`}
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        {confirmPw && confirmPw !== newPw && <span className={styles.mismatchText}>Passwords don't match</span>}
        {confirmPw && confirmPw === newPw && newPw.length > 0 && <span className={styles.matchText}>Passwords match ✓</span>}

        {pwError && <p className={styles.popError}>{pwError}</p>}
        {pwSuccess && <p className={styles.popSuccess}>{pwSuccess}</p>}

        <div className={styles.modalActions}>
          <button className={styles.modalCancelBtn} onClick={closeModal}>Cancel</button>
          <button
            className={styles.modalConfirmBtn}
            onClick={handleSavePassword}
            disabled={!currentPw || !isNewPwValid || confirmPw !== newPw}
          >
            Update Password
          </button>
        </div>
      </SlideModal>
    </div>
  );
}

export default UserProfile;