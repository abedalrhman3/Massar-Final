import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AccountsManagement.module.css";
//import * as accountsService from "@/services/accountsService";

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

// Utility function to calculate relative time
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
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

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

function AccountsManagement() {
  const navigate = useNavigate();
  const accountsSectionRef = useRef(null);

  // State
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    active: 0,
    suspended: 0,
    banned: 0,
    reported: 0,
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [reportedPage, setReportedPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog states
  const [banDialog, setBanDialog] = useState({
    open: false,
    account: null,
    reason: "",
  });

  const [clearDialog, setClearDialog] = useState({
    open: false,
    account: null,
  });

  // Fetch accounts from API
  const fetchAccounts = useCallback(async () => {
    try {
      const data = await accountsService.getAccounts({
        status: statusFilter,
        tier: tierFilter,
        search: debouncedSearch,
      });
      setAccounts(data);
    } catch (err) {
      console.error("Error fetching accounts:", err);
      setError(err.message);
    }
  }, [statusFilter, tierFilter, debouncedSearch]);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    try {
      const data = await accountsService.getAccountStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchAccounts, fetchStats]);

  // Debounce search input - wait 300ms after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Refetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchAccounts();
  }, [statusFilter, tierFilter, debouncedSearch, fetchAccounts]);

  // Animated stat values
  const animatedActive = useAnimatedNumber(stats.active);
  const animatedBanned = useAnimatedNumber(stats.banned);
  const animatedSuspended = useAnimatedNumber(stats.suspended);
  const animatedReported = useAnimatedNumber(stats.reported);

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return [...accounts];
  }, [accounts]);

  // Pagination for filtered accounts
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, currentPage]);

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  // Reported accounts
  const [reportedAccounts, setReportedAccounts] = useState([]);
  const [reportedSearchInput, setReportedSearchInput] = useState("");
  const [debouncedReportedSearch, setDebouncedReportedSearch] = useState("");

  // Debounce reported accounts search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedReportedSearch(reportedSearchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [reportedSearchInput]);

  useEffect(() => {
    const fetchReported = async () => {
      try {
        const data = await accountsService.getReportedAccounts(
          debouncedReportedSearch,
        );
        setReportedAccounts(data);
      } catch (err) {
        console.error("Error fetching reported accounts:", err);
      }
    };
    fetchReported();
    setReportedPage(1);
  }, [debouncedReportedSearch, stats.reported]);

  const filteredReported = useMemo(() => {
    return [...reportedAccounts];
  }, [reportedAccounts]);

  const paginatedReported = useMemo(() => {
    const start = (reportedPage - 1) * itemsPerPage;
    return filteredReported.slice(start, start + itemsPerPage);
  }, [filteredReported, reportedPage]);

  const reportedTotalPages = Math.ceil(filteredReported.length / itemsPerPage);

  // Relative time updates
  const [lastIncidentTimes, setLastIncidentTimes] = useState([]);

  useEffect(() => {
    const times = filteredReported.map((rep) =>
      formatRelativeTime(rep.last_incident),
    );
    setLastIncidentTimes(times);
  }, [filteredReported]);

  // Action handlers
  const handleSuspend = async (account) => {
    try {
      await accountsService.suspendAccount(account.email);
      await fetchAccounts();
      await fetchStats();
      setActiveMenu(null);
    } catch (err) {
      alert("Failed to suspend account: " + err.message);
    }
  };

  const handleReactivate = async (account) => {
    try {
      await accountsService.reactivateAccount(account.email);
      await fetchAccounts();
      await fetchStats();
      setActiveMenu(null);
    } catch (err) {
      alert("Failed to reactivate account: " + err.message);
    }
  };

  const handleBan = (account) => {
    setBanDialog({ open: true, account, reason: "" });
    setActiveMenu(null);
  };

  const confirmBan = async () => {
    if (!banDialog.reason.trim()) return;

    try {
      await accountsService.banAccount(
        banDialog.account.email,
        banDialog.reason,
      );
      setBanDialog({ open: false, account: null, reason: "" });
      await Promise.all([fetchAccounts(), fetchStats()]);
    } catch (err) {
      alert("Failed to ban account: " + err.message);
    }
  };

  const handleClearFlags = (account) => {
    setClearDialog({ open: true, account });
  };

  const confirmClearFlags = async () => {
    try {
      await accountsService.clearAccountFlags(clearDialog.account.email);
      setClearDialog({ open: false, account: null });
      await Promise.all([fetchAccounts(), fetchStats()]);
    } catch (err) {
      alert("Failed to clear flags: " + err.message);
    }
  };

  const handleUnban = async (account) => {
    if (!confirm(`Are you sure you want to unban ${account.username}?`)) return;

    try {
      await accountsService.unbanAccount(account.email);
      await Promise.all([fetchAccounts(), fetchStats()]);
    } catch (err) {
      alert("Failed to unban account: " + err.message);
    }
  };

  const handleQuickAccess = (action) => {
    switch (action) {
      case "guidelines":
        alert("Opening Community Guidelines...");
        break;
      case "ban-history":
        navigate("/admin/ban-history");
        break;
      case "appeals":
        alert("Appeals Queue: 14 pending review");
        break;
      case "chat":
        navigate("/admin/chat");
        break;
      default:
        break;
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [activeMenu]);

  // Fix scroll jump on pagination - Task 7
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll accounts section to top
    if (accountsSectionRef.current) {
      accountsSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading accounts...</div>
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
          <h1 className={styles.title}>Account Custodianship</h1>
          <p className={styles.subtitle}>
            Monitor user engagement, verify credentials, and maintain the
            editorial integrity of the global travel community.
          </p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#1B56FD", fontSize: "2rem" }}
          >
            group
          </span>
          <div>
            <p className={styles.statVal}>{animatedActive}</p>
            <p className={styles.statLabel}>Active Accounts</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#dc2626", fontSize: "2rem" }}
          >
            report
          </span>
          <div>
            <p className={styles.statVal}>{animatedReported}</p>
            <p className={styles.statLabel}>Pending Reports</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#dc2626", fontSize: "2rem" }}
          >
            block
          </span>
          <div>
            <p className={styles.statVal}>{animatedBanned}</p>
            <p className={styles.statLabel}>Banned Accounts</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <span
            className="material-symbols-outlined"
            style={{ color: "#f59e0b", fontSize: "2rem" }}
          >
            pause_circle
          </span>
          <div>
            <p className={styles.statVal}>{animatedSuspended}</p>
            <p className={styles.statLabel}>Suspended Accounts</p>
          </div>
        </div>
      </div>

      <div className={styles.section} ref={accountsSectionRef}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleRow}>
            <h2 className={styles.sectionTitle}>All Accounts</h2>
            {(statusFilter !== "all" || tierFilter !== "all") && (
              <span className={styles.filterBadge}>Filtered</span>
            )}
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
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Tier</label>
              <div className={styles.filterOptions}>
                {["all", "standard", "elite"].map((tier) => (
                  <button
                    key={tier}
                    className={`${styles.filterOption} ${tierFilter === tier ? styles.filterOptionActive : ""}`}
                    onClick={() => setTierFilter(tier)}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles.searchRow}>
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Search by name or email..."
          />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Email Address</th>
                <th>Subscription Date</th>
                <th>Tier</th>
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
                        {acc.avatar ? (
                          <img src={acc.avatar} alt={acc.username} />
                        ) : (
                          <span className="material-symbols-outlined">
                            account_circle
                          </span>
                        )}
                      </div>
                      <div>
                        <p className={styles.userName}>{acc.username}</p>
                        <p className={styles.userId}>
                          ID: {acc.id?.slice(0, 8) || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.email}>{acc.email}</td>
                  <td className={styles.date}>
                    {formatDate(acc.subscription_date)}
                  </td>
                  <td>
                    <span
                      className={`${styles.tierBadge} ${styles[acc.tier?.toLowerCase()]}`}
                    >
                      {acc.tier}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusDot} ${styles[acc.status]}`}
                    ></span>
                    <span className={styles.statusText}>{acc.status}</span>
                  </td>
                  <td>
                    <div className={styles.actionCell}>
                      <button
                        className={styles.actionBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu === acc.email ? null : acc.email,
                          );
                        }}
                      >
                        <span className="material-symbols-outlined">
                          more_horiz
                        </span>
                      </button>
                      {activeMenu === acc.email && (
                        <div className={styles.actionMenu}>
                          {acc.status === "active" && (
                            <>
                              <button onClick={() => handleSuspend(acc)}>
                                Suspend Account
                              </button>
                              <button
                                onClick={() => handleBan(acc)}
                                className={styles.destructive}
                              >
                                Ban Account
                              </button>
                            </>
                          )}
                          {acc.status === "suspended" && (
                            <>
                              <button onClick={() => handleReactivate(acc)}>
                                Reactivate Account
                              </button>
                              <button
                                onClick={() => handleBan(acc)}
                                className={styles.destructive}
                              >
                                Ban Account
                              </button>
                            </>
                          )}
                          {acc.status === "banned" && (
                            <button
                              onClick={() =>
                                navigate("/admin/ban-history", {
                                  state: { highlightId: acc.email },
                                })
                              }
                            >
                              Remove Ban
                            </button>
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
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            className={styles.pageBtn}
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <p className={styles.showing}>
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} of{" "}
          {filteredAccounts.length} accounts
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={`${styles.sectionTitle} ${styles.red}`}>
          Reported Accounts
        </h2>
        <p className={styles.subtitle}>
          Review flagged behavior and enforce community standards.
        </p>

        <div className={styles.searchRow}>
          <SearchInput
            value={reportedSearchInput}
            onChange={setReportedSearchInput}
            placeholder="Search reported accounts..."
          />
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
                        {rep.avatar ? (
                          <img src={rep.avatar} alt={rep.username} />
                        ) : (
                          <span className="material-symbols-outlined">
                            warning
                          </span>
                        )}
                      </div>
                      <div>
                        <p className={styles.userName}>{rep.username}</p>
                        <p className={styles.userSubtitle}>
                          {rep.flags > 5
                            ? "Multiple Violations"
                            : "Flagged Account"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.flagCount}>{rep.flags}</span>
                  </td>
                  <td>
                    <span className={styles.reasonBadge}>
                      {rep.flags >= 7
                        ? "SPAM ACTIVITY"
                        : rep.flags >= 4
                          ? "INAPPROPRIATE CONTENT"
                          : "MINOR VIOLATION"}
                    </span>
                  </td>
                  <td className={styles.date}>{lastIncidentTimes[i]}</td>
                  <td>
                    <div className={styles.reportActions}>
                      <button
                        className={styles.clearBtn}
                        onClick={() => handleClearFlags(rep)}
                      >
                        Clear
                      </button>
                      <button
                        className={styles.banBtn}
                        onClick={() => handleBan(rep)}
                      >
                        Ban Account
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            disabled={reportedPage === 1}
            onClick={() => setReportedPage((p) => p - 1)}
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Previous
          </button>
          <span className={styles.pageInfo}>
            Page {reportedPage} of {reportedTotalPages || 1}
          </span>
          <button
            className={styles.pageBtn}
            disabled={reportedPage >= reportedTotalPages}
            onClick={() => setReportedPage((p) => p + 1)}
          >
            Next
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.quickAccess}>
          <h3 className={styles.quickTitle}>Moderator Quick-Access</h3>
          <div className={styles.quickGrid}>
            <button
              className={`${styles.quickBtn} ${styles.quickBtnDisabled}`}
              onClick={() => handleQuickAccess("guidelines")}
              disabled
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.2rem" }}
              >
                gavel
              </span>
              <div>
                <p>Guidelines</p>
                <span>Updated 2 days ago</span>
              </div>
            </button>
            <button
              className={styles.quickBtn}
              onClick={() => handleQuickAccess("ban-history")}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.2rem" }}
              >
                block
              </span>
              <div>
                <p>Ban History</p>
                <span>Full archival access</span>
              </div>
            </button>
            <button
              className={`${styles.quickBtn} ${styles.quickBtnDisabled}`}
              onClick={() => handleQuickAccess("appeals")}
              disabled
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.2rem" }}
              >
                pending_actions
              </span>
              <div>
                <p>Appeals Queue</p>
                <span>14 pending review</span>
              </div>
            </button>
            <button
              className={styles.quickBtn}
              onClick={() => handleQuickAccess("chat")}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.2rem" }}
              >
                forum
              </span>
              <div>
                <p>Moderator Chat</p>
                <span>8 online now</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {banDialog.open && (
        <div
          className={styles.dialogBackdrop}
          onClick={() =>
            setBanDialog({ open: false, account: null, reason: "" })
          }
        >
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "3rem", color: "#dc2626" }}
            >
              block
            </span>
            <h3 className={styles.dialogTitle}>Ban this account?</h3>
            <p className={styles.dialogBody}>
              This account will be banned and removed from active users. You can
              remove the ban from Ban History or via Actions in the All Accounts
              section.
            </p>

            <div className={styles.reasonInput}>
              <label htmlFor="ban-reason">Reason for ban</label>
              <input
                id="ban-reason"
                type="text"
                placeholder="e.g. Repeated harassment, Spam activity..."
                value={banDialog.reason}
                onChange={(e) =>
                  setBanDialog({ ...banDialog, reason: e.target.value })
                }
                autoFocus
              />
            </div>

            <div className={styles.dialogActions}>
              <button
                className={styles.dialogCancel}
                onClick={() =>
                  setBanDialog({ open: false, account: null, reason: "" })
                }
              >
                Cancel
              </button>
              <button
                className={styles.dialogConfirm}
                onClick={confirmBan}
                disabled={!banDialog.reason.trim()}
              >
                Ban Account
              </button>
            </div>
          </div>
        </div>
      )}

      {clearDialog.open && (
        <div
          className={styles.dialogBackdrop}
          onClick={() => setClearDialog({ open: false, account: null })}
        >
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "3rem", color: "#22c55e" }}
            >
              check_circle
            </span>
            <h3 className={styles.dialogTitle}>Clear all flags?</h3>
            <p className={styles.dialogBody}>
              This will clear all flags and reports for this account. The user
              will be restored to good standing.
            </p>

            <div className={styles.dialogActions}>
              <button
                className={styles.dialogCancel}
                onClick={() => setClearDialog({ open: false, account: null })}
              >
                Cancel
              </button>
              <button
                className={styles.clearConfirmBtn}
                onClick={confirmClearFlags}
              >
                Clear Flags
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountsManagement;
