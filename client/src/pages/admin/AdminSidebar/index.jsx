import { NavLink, useNavigate } from "react-router-dom";
import styles from "./AdminSidebar.module.css";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      window.location.href = "/";
    }
  };
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.logo}>Editorial Archive</h1>
        <p className={styles.subtitle}>Admin Portal</p>
      </div>

      <nav className={styles.nav}>
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/destinations"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <span className="material-symbols-outlined">travel_explore</span>
          <span>Destinations</span>
        </NavLink>

        <NavLink
          to="/admin/accounts"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <span className="material-symbols-outlined">manage_accounts</span>
          <span>Accounts</span>
        </NavLink>

        <NavLink
          to="/admin/chat"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <span className="material-symbols-outlined">forum</span>
          <span>Admin Chat</span>
        </NavLink>

        <NavLink
          to="/admin/support"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <span className="material-symbols-outlined">support_agent</span>
          <span>Support</span>
        </NavLink>
      </nav>

      <div className={styles.footer}>
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <span className="material-symbols-outlined">person</span>
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ""}`
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>

        <button className={styles.navItem} onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
