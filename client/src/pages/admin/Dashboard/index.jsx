import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { getAllUsers } from "@/api/auth";
import { getDestinations } from "@/api/destination";
import { getReportedPhotos, getBudgetSettings } from "@/api/admin";
import styles from "./Dashboard.module.css";

// Chart data for different time periods (static — no analytics endpoint)
const chartData = {
  daily: {
    path: "M0,130 C30,125 50,110 80,100 C110,90 130,95 160,80 C190,65 210,70 240,55 C270,40 290,50 320,40 C350,30 380,20 420,15 C460,10 500,25 540,20 C560,18 580,30 600,25",
    fillPath: "M0,130 C30,125 50,110 80,100 C110,90 130,95 160,80 C190,65 210,70 240,55 C270,40 290,50 320,40 C350,30 380,20 420,15 C460,10 500,25 540,20 C560,18 580,30 600,25 L600,160 L0,160 Z",
    labels: ["12AM", "4AM", "8AM", "12PM", "4PM", "8PM", "11PM"],
  },
  weekly: {
    path: "M0,140 C40,135 60,120 100,115 C140,110 160,130 200,110 C240,90 260,100 300,85 C340,70 380,90 420,65 C460,40 500,55 600,30",
    fillPath: "M0,140 C40,135 60,120 100,115 C140,110 160,130 200,110 C240,90 260,100 300,85 C340,70 380,90 420,65 C460,40 500,55 600,30 L600,160 L0,160 Z",
    labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  },
  monthly: {
    path: "M0,145 C50,140 100,100 150,105 C200,110 250,60 300,70 C350,80 400,40 450,30 C500,20 550,45 600,35",
    fillPath: "M0,145 C50,140 100,100 150,105 C200,110 250,60 300,70 C350,80 400,40 450,30 C500,20 550,45 600,35 L600,160 L0,160 Z",
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
  },
};

const statsData = {
  daily: {
    visits: "1.2k", visitsChange: "— stable from yesterday", visitsColor: "#6b7280",
    bookings: "48", bookingsChange: "↑ +8% today", bookingsColor: "#16a34a",
  },
  weekly: {
    visits: "8.4k", visitsChange: "↑ +15% this week", visitsColor: "#16a34a",
    bookings: "312", bookingsChange: "↑ +22% this week", bookingsColor: "#16a34a",
  },
  monthly: {
    visits: "36k", visitsChange: "↑ +32% this month", visitsColor: "#16a34a",
    bookings: "1,284", bookingsChange: "↑ +45% this month", bookingsColor: "#16a34a",
  },
};

// Map a reported photo into an activity item shape
function photoToActivity(photo) {
  return {
    icon: "flag",
    text: (
      <>
        <strong>Photo Reported</strong>{" "}
        {photo.user?.name ? `by ${photo.user.name}` : "by a user"}
        {photo.location?.name ? ` at ${photo.location.name}` : ""}.
      </>
    ),
    time: (() => {
      try {
        const d = photo.createdAt ? new Date(photo.createdAt) : null;
        return (d && !isNaN(d))
          ? d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Recently';
      } catch (e) { return 'Recently'; }
    })(),
  };
}

function StatCard({ label, value, icon, badge, badgeColor, loading }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <div className={styles.statRow}>
        <span className={styles.statValue}>
          {loading ? "—" : value}
        </span>
        <span
          className={`material-symbols-outlined ${styles.statIcon}`}
          style={{ color: "var(--color-accent)" }}
        >
          {icon}
        </span>
      </div>
      <span className={styles.statBadge} style={{ color: badgeColor }}>
        {badge}
      </span>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState("daily");

  // ── Live API calls ──────────────────────────────────────────
  const { data: usersData, loading: usersLoading } = useApi(getAllUsers);
  const { data: destinationsData, loading: destinationsLoading } = useApi(getDestinations);
  const { data: reportedData, loading: reportedLoading } = useApi(getReportedPhotos);
  const { data: budgetData, loading: budgetLoading } = useApi(getBudgetSettings);

  // ── Derived values ──────────────────────────────────────────
  const totalUsers = usersData?.data?.length ?? usersData?.length ?? null;
  const destinations = destinationsData?.data ?? [];
  const totalDestinations = destinations.length || null;

  // Reported photos → activity feed (cap at 5)
  const reportedPhotos = reportedData?.data ?? [];
  const activityItems = reportedPhotos.length > 0
    ? reportedPhotos.slice(0, 5).map(photoToActivity)
    : [
      { icon: "person_add", text: (<><strong>New User</strong> registered: Sofia Laurent from Paris, France.</>), time: "2 MINUTES AGO" },
      { icon: "edit", text: (<><strong>Marcus V.</strong> edited "Kyoto Travel Guide" descriptions.</>), time: "45 MINUTES AGO" },
      { icon: "photo_camera", text: (<><strong>Booking Confirmed</strong> for Amalfi Villa Experience ($1,200).</>), time: "2 HOURS AGO" },
      { icon: "photo_camera", text: (<><strong>Elena R.</strong> uploaded 12 new high-res photos for "Bali Resorts".</>), time: "5 HOURS AGO" },
      { icon: "info", text: (<><strong>System Alert:</strong> High traffic spike detected in North America.</>), time: "YESTERDAY" },
    ];

  // Budget ranges for the pro-tip banner
  const budgetRanges = budgetData?.budget_ranges ?? budgetData ?? null;
  const budgetLabel = budgetRanges && !budgetLoading
    ? `Low ≤ $${budgetRanges.low_max} · Mid ≤ $${budgetRanges.mid_max}`
    : null;

  // Top destinations: first 2 published ones, fallback to first 2
  const topDestinations = destinations.length > 0
    ? (destinations.filter((d) => d.isPublished !== false).slice(0, 2).length >= 2
      ? destinations.filter((d) => d.isPublished !== false).slice(0, 2)
      : destinations.slice(0, 2))
    : [];

  const currentStats = statsData[chartPeriod];

  const handleViewDestination = (id) => navigate(`/destination/${id}`);
  const handleSyncNow = () =>
    alert("Global Sync started! This will update tax rates across all destinations.");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Performance Summary</h1>
          <p className={styles.subtitle}>
            Welcome back. Here is the latest data from the Editorial ecosystem.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total Destinations"
          value={destinationsLoading ? "—" : (totalDestinations ?? "—")}
          icon="map"
          badge="↑ +12% this month"
          badgeColor="#16a34a"
          loading={destinationsLoading}
        />
        <StatCard
          label="Total Users"
          value={usersLoading ? "—" : (totalUsers != null ? totalUsers.toLocaleString() : "—")}
          icon="group"
          badge="↑ +5.2% this month"
          badgeColor="#16a34a"
          loading={usersLoading}
        />
        <StatCard
          label={`${chartPeriod === "daily" ? "Daily" : chartPeriod === "weekly" ? "Weekly" : "Monthly"} Visits`}
          value={currentStats.visits}
          icon="visibility"
          badge={currentStats.visitsChange}
          badgeColor={currentStats.visitsColor}
        />
        <StatCard
          label="Lifetime Visits"
          value="150k"
          icon="history"
          badge="↑ +22% year-over-year"
          badgeColor="#16a34a"
        />
      </div>

      {/* Middle section */}
      <div className={styles.middleGrid}>
        {/* Traffic chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.sectionTitle}>Traffic Over Time</h2>
            <div className={styles.tabGroup}>
              {["daily", "weekly", "monthly"].map((p) => (
                <button
                  key={p}
                  className={`${styles.tab} ${chartPeriod === p ? styles.tabActive : ""}`}
                  onClick={() => setChartPeriod(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.chartArea}>
            <svg viewBox="0 0 600 160" className={styles.chart}>
              <defs>
                <linearGradient id={`chartGrad-${chartPeriod}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chartData[chartPeriod].path} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
              <path d={chartData[chartPeriod].fillPath} fill={`url(#chartGrad-${chartPeriod})`} />
            </svg>
            <div className={styles.chartDays}>
              {chartData[chartPeriod].labels.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.activityCard}>
          <h2 className={styles.sectionTitle}>
            Recent Activity
            {reportedPhotos.length > 0 && (
              <span style={{ fontSize: "0.75rem", color: "#ef4444", marginLeft: "0.5rem", fontWeight: 500 }}>
                {reportedPhotos.length} reported photo{reportedPhotos.length !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <div className={styles.activityList}>
            {reportedLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={styles.activityItem} style={{ opacity: 0.4 }}>
                  <div className={styles.activityIcon}>
                    <span className="material-symbols-outlined">hourglass_empty</span>
                  </div>
                  <div className={styles.activityBody}>
                    <p className={styles.activityText}>Loading…</p>
                  </div>
                </div>
              ))
              : activityItems.map((item, i) => (
                <div key={i} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div className={styles.activityBody}>
                    <p className={styles.activityText}>{item.text}</p>
                    <span className={styles.activityTime}>{item.time}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top destinations */}
      <div className={styles.destSection}>
        <h2 className={styles.sectionTitle}>Top Performing Destinations</h2>
        {destinationsLoading ? (
          <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Loading destinations…</p>
        ) : topDestinations.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>No destinations found.</p>
        ) : (
          <div className={styles.destGrid}>
            {topDestinations.map((dest, index) => (
              <div key={dest._id ?? dest.id} className={styles.destCard}>
                <div className={styles.destImgWrapper}>
                  <img src={dest.image} alt={dest.name} className={styles.destImg} />
                </div>
                <div className={styles.destInfo}>
                  <div className={styles.destMeta}>
                    <h3>{dest.name}</h3>
                    <span className={styles.rating}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#f59e0b" }}>star</span>
                      {(4.5 + index * 0.1).toFixed(1)}
                    </span>
                  </div>
                  <p className={styles.destDesc}>
                    {dest.description?.substring(0, 80)}...
                  </p>
                  <div className={styles.destFooter}>
                    <span>
                      {typeof dest.location === "string"
                        ? dest.location
                        : dest.location?.name ?? dest.location?.city ?? dest.location?.title ?? ""}
                    </span>
                    <button
                      className={styles.detailsBtn}
                      onClick={() => handleViewDestination(dest._id ?? dest.id)}
                    >
                      Details{" "}
                      <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>
                        chevron_right
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pro tip */}
      <div className={styles.proTip}>
        <div>
          <h3 className={styles.proTipTitle}>
            <em>Editor&apos;s Pro Tip</em>
          </h3>
          <p>
            Use the "Global Sync" feature to update tax rates across all{" "}
            {totalDestinations ?? "your"} destinations simultaneously from the Destination
            Management tab.
            {budgetLabel && (
              <span style={{ display: "block", marginTop: "0.35rem", opacity: 0.8, fontSize: "0.85em" }}>
                Current budget ranges: <strong>{budgetLabel}</strong>
              </span>
            )}
          </p>
        </div>
        <button className={styles.syncBtn} onClick={handleSyncNow}>
          TRY SYNC NOW
        </button>
      </div>
    </div>
  );
}

export default Dashboard;