import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { destinations } from "@/data/destinations";
import styles from "./Dashboard.module.css";

const recentActivity = [
  {
    icon: "person_add",
    text: (
      <>
        <strong>New User</strong> registered: Sofia Laurent from Paris, France.
      </>
    ),
    time: "2 MINUTES AGO",
  },
  {
    icon: "edit",
    text: (
      <>
        <strong>Marcus V.</strong> edited "Kyoto Travel Guide" descriptions.
      </>
    ),
    time: "45 MINUTES AGO",
  },
  {
    icon: "photo_camera",
    text: (
      <>
        <strong>Booking Confirmed</strong> for Amalfi Villa Experience ($1,200).
      </>
    ),
    time: "2 HOURS AGO",
  },
  {
    icon: "photo_camera",
    text: (
      <>
        <strong>Elena R.</strong> uploaded 12 new high-res photos for "Bali Resorts".
      </>
    ),
    time: "5 HOURS AGO",
  },
  {
    icon: "info",
    text: (
      <>
        <strong>System Alert:</strong> High traffic spike detected in North America.
      </>
    ),
    time: "YESTERDAY",
  },
];

// Chart data for different time periods
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

function Dashboard() {
  const navigate = useNavigate();

  const handleViewAllLogs = () => {
    navigate("/admin/support");
  };

  const handleViewDestination = (id) => {
    navigate(`/destination/${id}`);
  };

  const handleSyncNow = () => {
    alert("Global Sync started! This will update tax rates across all 128 destinations.");
  };

  const [chartPeriod, setChartPeriod] = useState("daily");

  const statsData = {
    daily: {
      visits: "1.2k",
      visitsChange: "— stable from yesterday",
      visitsColor: "#6b7280",
      bookings: "48",
      bookingsChange: "↑ +8% today",
      bookingsColor: "#16a34a",
    },
    weekly: {
      visits: "8.4k",
      visitsChange: "↑ +15% this week",
      visitsColor: "#16a34a",
      bookings: "312",
      bookingsChange: "↑ +22% this week",
      bookingsColor: "#16a34a",
    },
    monthly: {
      visits: "36k",
      visitsChange: "↑ +32% this month",
      visitsColor: "#16a34a",
      bookings: "1,284",
      bookingsChange: "↑ +45% this month",
      bookingsColor: "#16a34a",
    },
  };

  const currentStats = statsData[chartPeriod];

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
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Destinations</p>
          <div className={styles.statRow}>
            <span className={styles.statValue}>{destinations.length}</span>
            <span className={`material-symbols-outlined ${styles.statIcon}`} style={{ color: "#1B56FD" }}>
              map
            </span>
          </div>
          <span className={styles.statBadge} style={{ color: "#16a34a" }}>
            ↑ +12% this month
          </span>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Users</p>
          <div className={styles.statRow}>
            <span className={styles.statValue}>4.5k</span>
            <span className={`material-symbols-outlined ${styles.statIcon}`} style={{ color: "#1B56FD" }}>
              group
            </span>
          </div>
          <span className={styles.statBadge} style={{ color: "#16a34a" }}>
            ↑ +5.2% this month
          </span>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>{chartPeriod === "daily" ? "Daily" : chartPeriod === "weekly" ? "Weekly" : "Monthly"} Visits</p>
          <div className={styles.statRow}>
            <span className={styles.statValue}>{currentStats.visits}</span>
            <span className={`material-symbols-outlined ${styles.statIcon}`} style={{ color: "#1B56FD" }}>
              visibility
            </span>
          </div>
          <span className={styles.statBadge} style={{ color: currentStats.visitsColor }}>
            {currentStats.visitsChange}
          </span>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>Lifetime Visits</p>
          <div className={styles.statRow}>
            <span className={styles.statValue}>150k</span>
            <span className={`material-symbols-outlined ${styles.statIcon}`} style={{ color: "#1B56FD" }}>
              history
            </span>
          </div>
          <span className={styles.statBadge} style={{ color: "#16a34a" }}>
            ↑ +22% year-over-year
          </span>
        </div>
      </div>

      {/* Middle section */}
      <div className={styles.middleGrid}>
        {/* Traffic chart placeholder */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.sectionTitle}>Traffic Over Time</h2>
            <div className={styles.tabGroup}>
              <button className={`${styles.tab} ${chartPeriod === "daily" ? styles.tabActive : ""}`} onClick={() => setChartPeriod("daily")}>Daily</button>
              <button className={`${styles.tab} ${chartPeriod === "weekly" ? styles.tabActive : ""}`} onClick={() => setChartPeriod("weekly")}>Weekly</button>
              <button className={`${styles.tab} ${chartPeriod === "monthly" ? styles.tabActive : ""}`} onClick={() => setChartPeriod("monthly")}>Monthly</button>
            </div>
          </div>
          <div className={styles.chartArea}>
            <svg viewBox="0 0 600 160" className={styles.chart}>
              <defs>
                <linearGradient id={`chartGrad-${chartPeriod}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1B56FD" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1B56FD" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={chartData[chartPeriod].path}
                fill="none"
                stroke="#1B56FD"
                strokeWidth="2.5"
              />
              <path
                d={chartData[chartPeriod].fillPath}
                fill={`url(#chartGrad-${chartPeriod})`}
              />
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
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            {recentActivity.map((item, i) => (
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
          <button className={styles.viewAllBtn} onClick={handleViewAllLogs}>VIEW ALL LOGS</button>
        </div>
      </div>

      {/* Top destinations */}
      <div className={styles.destSection}>
        <h2 className={styles.sectionTitle}>Top Performing Destinations</h2>
        <div className={styles.destGrid}>
          {destinations.filter(d => d.id === 3 || d.id === 6).map((dest, index) => (
            <div key={dest.id} className={styles.destCard}>
              <div className={styles.destImgWrapper}>
                <img
                  src={dest.image}
                  alt={dest.name}
                  className={styles.destImg}
                />
              </div>
              <div className={styles.destInfo}>
                <div className={styles.destMeta}>
                  <h3>{dest.name}</h3>
                  <span className={styles.rating}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#f59e0b" }}>star</span>
                    {(4.5 + (index * 0.1)).toFixed(1)}
                  </span>
                </div>
                <p className={styles.destDesc}>
                  {dest.description.substring(0, 80)}...
                </p>
                <div className={styles.destFooter}>
                  <span>{dest.location}</span>
                  <button className={styles.detailsBtn} onClick={() => handleViewDestination(dest.id)}>
                    Details <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro tip */}
      <div className={styles.proTip}>
        <div>
          <h3 className={styles.proTipTitle}>
            <em>Editor&apos;s Pro Tip</em>
          </h3>
          <p>
            Use the "Global Sync" feature to update tax rates across all 128 destinations
            simultaneously from the Destination Management tab.
          </p>
        </div>
        <button className={styles.syncBtn} onClick={handleSyncNow}>TRY SYNC NOW</button>
      </div>
    </div>
  );
}

export default Dashboard;
