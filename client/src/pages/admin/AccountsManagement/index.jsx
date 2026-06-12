import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountsManagement.module.css";
import { getAllUsers, toggleBanUser, deleteUser } from "@/api/auth";

// ─── Toast system (self-contained) ───────────────────────────────────────────

const TOAST_ICONS = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

const TOAST_COLORS = {
  success: "#16a34a",
  error: "#dc2626",
  warning: "#f59e0b",
  info: "#1591dc",
};

function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        zIndex: 9999,
        pointerEvents: "none",
      }}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "#fff",
            borderRadius: "12px",
            padding: "0.85rem 1rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)",
            minWidth: "300px",
            maxWidth: "420px",
            pointerEvents: "all",
            borderLeft: `3px solid ${TOAST_COLORS[t.type]}`,
            animation: t.exiting
              ? "toastOut 0.25s ease-in forwards"
              : "toastIn 0.25s cubic-bezier(0.23,1,0.32,1) forwards",
            fontFamily: '"Geist","Satoshi","Plus Jakarta Sans",sans-serif',
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.25rem", flexShrink: 0, color: TOAST_COLORS[t.type] }}
          >
            {TOAST_ICONS[t.type]}
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#1d1b1b", lineHeight: 1.4, flex: 1 }}>
            {t.message}
          </span>
          <button
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              borderRadius: "6px",
              padding: "0.15rem",
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>close</span>
          </button>
        </div>
      ))}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(8px) scale(0.97); }
        }
        @media (prefers-reduced-motion: reduce) {
          [role="alert"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, type, exiting: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  };

  return { toasts, removeToast, toast };
}

// ─── Field mapping helpers ────────────────────────────────────────────────────

function normalizeUser(user) {
  return {
    id: user._id,
    username: user.name,
    email: user.email,
    avatar: user.profilePicture || null,
    subscription_date: user.createdAt,
    status: user.isBanned ? "banned" : "active",
    _raw: user,
  };
}

function deriveStats(users) {
  return users.reduce(
    (acc, u) => {
      if (u.isBanned) acc.banned++;
      else acc.active++;
      return acc;
    },
    { active: 0, suspended: 0, banned: 0, reported: 0 },
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className={styles.searchBox}>
      <span className="material-symbols-outlined">search</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function formatRelativeTime(date) {
  if (!date) return "N/A";
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

// ─── Main component ───────────────────────────────────────────────────────────

function AccountsManagement() {
  const navigate = useNavigate();
  const accountsSectionRef = useRef(null);
  const { toasts, removeToast, toast } = useToast();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const [stats, setStats] = useState({ active: 0, suspended: 0, banned: 0, reported: 0 });

  const [currentPage, setCurrentPage] = useState(1);
  const [reportedPage, setReportedPage] = useState(1);
  const itemsPerPage = 10;

  const [banDialog, setBanDialog] = useState({ open: false, account: null, reason: "" });
  const [unbanDialog, setUnbanDialog] = useState({ open: false, account: null });
  const [removeDialog, setRemoveDialog] = useState({ open: false, account: null });

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await getAllUsers();
      const rawUsers = res.data.data ?? res.data.users ?? res.data ?? [];
      const normalized = rawUsers.map(normalizeUser);
      setAccounts(normalized);
      setStats(deriveStats(rawUsers));
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAccounts();
      setLoading(false);
    };
    loadData();
  }, [fetchAccounts]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, debouncedSearch]);

  // ── Animated stat counters ────────────────────────────────────────────────

  const animatedActive = useAnimatedNumber(stats.active);
  const animatedBanned = useAnimatedNumber(stats.banned);
  const animatedSuspended = useAnimatedNumber(stats.suspended);
  const animatedReported = useAnimatedNumber(stats.reported);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
      const matchesSearch =
        !debouncedSearch ||
        acc.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        acc.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [accounts, statusFilter, debouncedSearch]);

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, currentPage]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // ── Reported accounts ─────────────────────────────────────────────────────

  const [reportedSearchInput, setReportedSearchInput] = useState("");
  const [debouncedReportedSearch, setDebouncedReportedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedReportedSearch(reportedSearchInput), 300);
    return () => clearTimeout(timer);
  }, [reportedSearchInput]);

  const reportedAccounts = useMemo(() => {
    return accounts
      .filter((acc) => acc.status === "banned")
      .filter(
        (acc) =>
          !debouncedReportedSearch ||
          acc.username?.toLowerCase().includes(debouncedReportedSearch.toLowerCase()) ||
          acc.email?.toLowerCase().includes(debouncedReportedSearch.toLowerCase()),
      )
      .map((acc) => ({ ...acc, flags: 1, last_incident: acc.subscription_date }));
  }, [accounts, debouncedReportedSearch]);

  const paginatedReported = useMemo(() => {
    const start = (reportedPage - 1) * itemsPerPage;
    return reportedAccounts.slice(start, start + itemsPerPage);
  }, [reportedAccounts, reportedPage]);

  const reportedTotalPages = Math.ceil(reportedAccounts.length / itemsPerPage);

  const [lastIncidentTimes, setLastIncidentTimes] = useState([]);
  useEffect(() => {
    setLastIncidentTimes(reportedAccounts.map((rep) => formatRelativeTime(rep.last_incident)));
  }, [reportedAccounts]);

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleBan = (account) => {
    setBanDialog({ open: true, account, reason: "" });
    setActiveMenu(null);
  };

  const confirmBan = async () => {
    if (!banDialog.reason.trim()) return;
    const username = banDialog.account?.username ?? "Account";
    try {
      await toggleBanUser(banDialog.account.id);
      setBanDialog({ open: false, account: null, reason: "" });
      await fetchAccounts();
      toast.success(`${username} has been banned.`);
    } catch (err) {
      toast.error("Failed to ban account: " + (err.response?.data?.message || err.message));
    }
  };

  const handleSuspend = async (account) => {
    try {
      await toggleBanUser(account.id);
      await fetchAccounts();
      setActiveMenu(null);
      toast.warning(`${account.username} has been suspended.`);
    } catch (err) {
      toast.error("Failed to suspend account: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReactivate = async (account) => {
    try {
      await toggleBanUser(account.id);
      await fetchAccounts();
      setActiveMenu(null);
      toast.success(`${account.username}'s account has been reactivated.`);
    } catch (err) {
      toast.error("Failed to reactivate account: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUnban = async (account) => {
    try {
      await toggleBanUser(account.id);
      await fetchAccounts();
      toast.success(`Ban lifted for ${account.username}.`);
    } catch (err) {
      toast.error("Failed to unban account: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUnbanFromReported = (account) => setUnbanDialog({ open: true, account });

  const confirmUnban = async () => {
    const username = unbanDialog.account?.username;
    try {
      await toggleBanUser(unbanDialog.account.id);
      setUnbanDialog({ open: false, account: null });
      await fetchAccounts();
      toast.success(`Ban lifted for ${username}.`);
    } catch (err) {
      toast.error("Failed to unban account: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveUser = (account) => setRemoveDialog({ open: true, account });

  const confirmRemoveUser = async () => {
    const username = removeDialog.account?.username;
    try {
      await deleteUser(removeDialog.account.id);
      setRemoveDialog({ open: false, account: null });
      await fetchAccounts();
      toast.success(`${username} has been permanently removed.`);
    } catch (err) {
      toast.error("Failed to remove user: " + (err.response?.data?.message || err.message));
    }
  };

  // ── Quick-access ──────────────────────────────────────────────────────────

  const handleOpenGuidelines = () => toast.info("Community Guidelines are currently unavailable.");
  const handleOpenBanHistory = () => navigate("/admin/ban-history");
  const handleOpenAppealsQueue = () => toast.info("Appeals Queue: 14 pending review.");
  const handleOpenModeratorChat = () => navigate("/admin/chat");

  // ── Outside click closes action menu ─────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeMenu]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (accountsSectionRef.current) {
      accountsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className={styles.page}><div className={styles.loading}>Loading accounts...</div></div>;
  }

  if (error) {
    return <div className={styles.page}><div className={styles.error}>Error: {error}</div></div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Account Custodianship</h1>
          <p className={styles.subtitle}>
            Monitor user engagement, verify credentials, and maintain the
            editorial integrity of the global travel community.
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined" style={{ color: "#1B56FD", fontSize: "2rem" }}>group</span>
          <div>
            <p className={styles.statVal}>{animatedActive}</p>
            <p className={styles.statLabel}>Active Accounts</p>
          </div>
        </div>
        {/* <div className={styles.statCard}>
          <span className="material-symbols-outlined" style={{ color: "#dc2626", fontSize: "2rem" }}>report</span>
          <div>
            <p className={styles.statVal}>{animatedReported}</p>
            <p className={styles.statLabel}>Pending Reports</p>
          </div>
        </div> */}
        <div className={styles.statCard}>
          <span className="material-symbols-outlined" style={{ color: "#dc2626", fontSize: "2rem" }}>block</span>
          <div>
            <p className={styles.statVal}>{animatedBanned}</p>
            <p className={styles.statLabel}>Banned Accounts</p>
          </div>
        </div>
        {/* <div className={styles.statCard}>
          <span className="material-symbols-outlined" style={{ color: "#f59e0b", fontSize: "2rem" }}>pause_circle</span>
          <div>
            <p className={styles.statVal}>{animatedSuspended}</p>
            <p className={styles.statLabel}>Suspended Accounts</p>
          </div>
        </div> */}
      </div>

      <div className={styles.section} ref={accountsSectionRef}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>All Accounts</h2>
            {statusFilter !== "all" && <span className={styles.filterBadge}>Filtered</span>}
          </div>
          <div className={styles.sectionActions}>
            <button
              className={`${styles.filterBtn} ${showFilter ? styles.filterBtnActive : ""}`}
              onClick={() => setShowFilter(!showFilter)}
            >
              <span className="material-symbols-outlined">filter_list</span>
              Filter
            </button>
          </div>
        </div>

        {showFilter && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Status</label>
              <div className={styles.filterOptions}>
                {["all", "active", "suspended", "banned"].map((status) => (
                  <button
                    key={status}
                    className={`${styles.filterOption} ${statusFilter === status ? styles.filterOptionActive : ""}`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.searchRow}>
          <SearchInput value={searchInput} onChange={setSearchInput} placeholder="Search by name or email..." />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Email Address</th>
                <th>Subscription Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.map((acc) => (
                <tr key={acc.email}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>
                        {acc.avatar
                          ? <img src={acc.avatar} alt={acc.username} />
                          : <span className="material-symbols-outlined">account_circle</span>
                        }
                      </div>
                      <div>
                        <p className={styles.userName}>{acc.username}</p>
                        <p className={styles.userId}>ID: {acc.id?.slice(0, 8) || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.email}>{acc.email}</td>
                  <td className={styles.date}>{formatDate(acc.subscription_date)}</td>
                  <td>
                    <span className={`${styles.statusDot} ${styles[acc.status]}`}></span>
                    <span className={styles.statusText}>{acc.status}</span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === acc.email ? null : acc.email);
                        }}
                      >
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                      {activeMenu === acc.email && (
                        <div className={styles.actionMenu}>
                          {acc.status === "active" && (
                            <>
                              {/* <button onClick={() => handleSuspend(acc)}>Suspend Account</button> */}
                              <button onClick={() => handleBan(acc)} className={styles.destructive}>Ban Account</button>
                            </>
                          )}
                          {acc.status === "suspended" && (
                            <>
                              <button onClick={() => handleReactivate(acc)}>Reactivate Account</button>
                              <button onClick={() => handleBan(acc)} className={styles.destructive}>Ban Account</button>
                            </>
                          )}
                          {acc.status === "banned" && (
                            <button onClick={() => handleUnban(acc)}>Remove Ban</button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
            <span className="material-symbols-outlined">chevron_left</span>Previous
          </button>
          <span className={styles.pageInfo}>Page {currentPage} of {totalPages || 1}</span>
          <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>
            Next<span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <p className={styles.showing}>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} of{" "}
          {filteredAccounts.length} accounts
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} ${styles.red}`}>Reported Accounts</h2>
        <p className={styles.subtitle}>Review flagged behavior and enforce community standards.</p>

        <div className={styles.searchRow}>
          <SearchInput value={reportedSearchInput} onChange={setReportedSearchInput} placeholder="Search reported accounts..." />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Profile</th>
                <th>Flags</th>
                <th>Primary Reason</th>
                <th>Last Incident</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReported.map((rep, i) => (
                <tr key={rep.email}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={`${styles.avatar} ${styles.avatarWarn}`}>
                        {rep.avatar
                          ? <img src={rep.avatar} alt={rep.username} />
                          : <span className="material-symbols-outlined">warning</span>
                        }
                      </div>
                      <div>
                        <p className={styles.userName}>{rep.username}</p>
                        <p className={styles.userSubtitle}>{rep.flags > 5 ? "Multiple Violations" : "Flagged Account"}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={styles.flagCount}>{rep.flags}</span></td>
                  <td>
                    <span className={styles.reasonBadge}>
                      {rep.flags >= 7 ? "SPAM ACTIVITY" : rep.flags >= 4 ? "INAPPROPRIATE CONTENT" : "MINOR VIOLATION"}
                    </span>
                  </td>
                  <td className={styles.date}>{lastIncidentTimes[i]}</td>
                  <td>
                    <div className={styles.reportActions}>
                      <button className={styles.clearBtn} onClick={() => handleUnbanFromReported(rep)}>Unban</button>
                      <button className={styles.removeBtn} onClick={() => handleRemoveUser(rep)}>Remove User</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button className={styles.pageBtn} disabled={reportedPage === 1} onClick={() => setReportedPage((p) => p - 1)}>
            <span className="material-symbols-outlined">chevron_left</span>Previous
          </button>
          <span className={styles.pageInfo}>Page {reportedPage} of {reportedTotalPages || 1}</span>
          <button className={styles.pageBtn} disabled={reportedPage >= reportedTotalPages} onClick={() => setReportedPage((p) => p + 1)}>
            Next<span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.quickAccess}>
          <h3 className={styles.quickTitle}>Moderator Quick-Access</h3>
          <div className={styles.quickGrid}>
            <button className={`${styles.quickBtn} ${styles.quickBtnDisabled}`} onClick={handleOpenGuidelines} disabled>
              <span className="material-symbols-outlined" style={{ fontSize: "2.2rem" }}>gavel</span>
              <div><p>Guidelines</p><span>Updated 2 days ago</span></div>
            </button>
            <button className={styles.quickBtn} onClick={handleOpenBanHistory}>
              <span className="material-symbols-outlined" style={{ fontSize: "2.2rem" }}>block</span>
              <div><p>Ban History</p><span>Full archival access</span></div>
            </button>
            <button className={`${styles.quickBtn} ${styles.quickBtnDisabled}`} onClick={handleOpenAppealsQueue} disabled>
              <span className="material-symbols-outlined" style={{ fontSize: "2.2rem" }}>pending_actions</span>
              <div><p>Appeals Queue</p><span>14 pending review</span></div>
            </button>
            <button className={styles.quickBtn} onClick={handleOpenModeratorChat}>
              <span className="material-symbols-outlined" style={{ fontSize: "2.2rem" }}>forum</span>
              <div><p>Moderator Chat</p><span>8 online now</span></div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Ban dialog ── */}
      {banDialog.open && (
        <div className={styles.dialogBackdrop} onClick={() => setBanDialog({ open: false, account: null, reason: "" })}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#dc2626" }}>block</span>
            <h3 className={styles.dialogTitle}>Ban this account?</h3>
            <p className={styles.dialogBody}>
              This account will be banned and removed from active users. You can remove the ban from
              Ban History or via Actions in the All Accounts section.
            </p>
            <div className={styles.reasonInput}>
              <label htmlFor="ban-reason">Reason for ban</label>
              <input
                id="ban-reason"
                type="text"
                placeholder="e.g. Repeated harassment, Spam activity..."
                value={banDialog.reason}
                onChange={(e) => setBanDialog({ ...banDialog, reason: e.target.value })}
                autoFocus
              />
            </div>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancel} onClick={() => setBanDialog({ open: false, account: null, reason: "" })}>
                Cancel
              </button>
              <button className={styles.dialogConfirm} onClick={confirmBan} disabled={!banDialog.reason.trim()}>
                Ban Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unban dialog ── */}
      {unbanDialog.open && (
        <div className={styles.dialogBackdrop} onClick={() => setUnbanDialog({ open: false, account: null })}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#1591dc" }}>lock_open</span>
            <h3 className={styles.dialogTitle}>Unban this account?</h3>
            <p className={styles.dialogBody}>
              <strong>{unbanDialog.account?.username}</strong> will be reinstated and regain full access to the platform.
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancel} onClick={() => setUnbanDialog({ open: false, account: null })}>
                Cancel
              </button>
              <button className={styles.dialogConfirm} onClick={confirmUnban} style={{ backgroundColor: "#1591dc" }}>
                Unban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove user dialog ── */}
      {removeDialog.open && (
        <div className={styles.dialogBackdrop} onClick={() => setRemoveDialog({ open: false, account: null })}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#dc2626" }}>delete_forever</span>
            <h3 className={styles.dialogTitle}>Permanently remove user?</h3>
            <p className={styles.dialogBody}>
              This will permanently delete <strong>{removeDialog.account?.username}</strong> and all of their
              data. This action cannot be undone.
            </p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancel} onClick={() => setRemoveDialog({ open: false, account: null })}>
                Cancel
              </button>
              <button className={styles.dialogConfirm} onClick={confirmRemoveUser} style={{ backgroundColor: "#dc2626" }}>
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default AccountsManagement;