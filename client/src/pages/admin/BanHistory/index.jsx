import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./BanHistory.module.css";
import * as accountsService from "@/services/accountsService";

// Animation hook for number counting
function useAnimatedNumber(targetValue, duration = 400) {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const previousValue = useRef(targetValue);

  useEffect(() => {
    if (targetValue === previousValue.current) return;

    const startValue = previousValue.current;
    const diff = targetValue - startValue;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + diff * easeOut);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = targetValue;
      }
    };

    requestAnimationFrame(animate);
  }, [targetValue, duration]);

  return displayValue;
}

function formatBanDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BanHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const highlightRef = useRef(null);
  const [highlightedEmail, setHighlightedEmail] = useState(null);

  const [bannedUsers, setBannedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [unbanModal, setUnbanModal] = useState(null);

  // Stats
  const [stats, setStats] = useState({ totalBanned: 0, bannedThisMonth: 0 });

  useEffect(() => {
    if (location.state?.highlightId) {
      setHighlightedEmail(location.state.highlightId);
      // Clear the state to prevent re-highlighting
      navigate(location.pathname, { replace: true });
    }
  }, [location.state]);

  // Trigger highlight animation
  useEffect(() => {
    if (highlightedEmail && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedEmail]);

  // Clear highlight after animation
  useEffect(() => {
    if (highlightedEmail) {
      const timer = setTimeout(() => {
        setHighlightedEmail(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedEmail]);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const [bannedData, statsData] = await Promise.all([
        accountsService.getBanHistory(filter),
        accountsService.getBanHistoryStats(),
      ]);
      setBannedUsers(bannedData);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching ban history:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, [refreshKey]);

  // Filter effect
  useEffect(() => {
    fetchData();
  }, [filter]);

  // Animated stats
  const animatedBanned = useAnimatedNumber(stats.totalBanned);
  const animatedUnbanned = useAnimatedNumber(stats.bannedThisMonth);

  const filtered = useMemo(() => {
    return [...bannedUsers];
  }, [bannedUsers]);

  const handleUnban = async (user) => {
    setUnbanModal(user);
  };

  const confirmUnban = async () => {
    if (!unbanModal) return;

    try {
      await accountsService.unbanAccount(unbanModal.email);
      await fetchData();
    } catch (err) {
      alert("Failed to unban account: " + err.message);
    }
    setUnbanModal(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading ban history...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Ban History</h1>
          <p className={styles.subtitle}>
            View and manage accounts that have been banned from the platform.
          </p>
        </div>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin/accounts")}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Accounts
        </button>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#dc2626", fontSize: "2rem" }}
          >
            block
          </span>
          <div>
            <p className={styles.statVal}>{animatedBanned}</p>
            <p className={styles.statLabel}>Total Banned</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#16a34a", fontSize: "2rem" }}
          >
            history
          </span>
          <div>
            <p className={styles.statVal}>{animatedUnbanned}</p>
            <p className={styles.statLabel}>Banned This Month</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder="Search by username or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Username</th>
              <th>Email</th>
              <th>Ban Date</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.email}
                ref={highlightedEmail === user.email ? highlightRef : null}
                className={
                  highlightedEmail === user.email ? styles.highlightedRow : ""
                }
              >
                <td>
                  <div className={styles.avatar}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} />
                    ) : (
                      <span className="material-symbols-outlined">
                        account_circle
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={styles.username}>{user.username}</span>
                </td>
                <td className={styles.email}>{user.email}</td>
                <td className={styles.date}>{formatBanDate(user.ban_date)}</td>
                <td>
                  <span className={styles.reasonBadge}>{user.ban_reason}</span>
                </td>
                <td>
                  <button
                    className={styles.unbanBtn}
                    onClick={() => handleUnban(user)}
                  >
                    <span className="material-symbols-outlined">lock_open</span>
                    Un-ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className={styles.showing}>
        Showing 1 to {filtered.length} of {filtered.length} banned accounts
      </p>

      {/* Unban Confirmation Modal */}
      {unbanModal && (
        <div className={styles.modalOverlay} onClick={() => setUnbanModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Unban User?</h2>
            <p className={styles.modalBody}>
              Are you sure you want to unban {unbanModal.username}? They will regain access to the platform.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setUnbanModal(null)}
              >
                Cancel
              </button>
              <button className={styles.unbanConfirmBtn} onClick={confirmUnban}>
                Unban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BanHistory;
