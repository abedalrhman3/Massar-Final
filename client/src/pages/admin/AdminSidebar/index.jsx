import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./AdminSidebar.module.css";
import { useAuth } from '@/context/AuthContext';


function AdminSidebar(params) {
  const { type } = params;
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    await logout();
    navigate('/');
  };

  console.log(params.type)
  return (
    <>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h1 className={styles.logo}>Editorial Archive</h1>
          <p className={styles.subtitle}>Admin Portal</p>
        </div>

        {type === "admin" && (
          <nav className={styles.nav}>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </NavLink>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>
                Dashboard
              </span>
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
              to="/admin/game"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className="material-symbols-outlined">gamepad</span>
              <span>Game</span>
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
          </nav>
        )}

        {type === "user" && (
          <nav className={styles.nav}>
            {console.log("user applied")}

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className="material-symbols-outlined">person</span>
              <span>Profile</span>
            </NavLink>
            <NavLink
              to="/save-list"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className="material-symbols-outlined">bookmark</span>
              <span>Save List</span>
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ""}`
              }
            >
              <span className="material-symbols-outlined">image</span>
              <span>Gallery</span>
            </NavLink>


          </nav>
        )}

        <div className={styles.footer}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ""}`
            }
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </NavLink>
          <button className={styles.navItem} onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {}
      {showLogoutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowLogoutModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Log Out?</h2>
            <p className={styles.modalBody}>Are you sure you want to log out?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button className={styles.logoutBtn} onClick={confirmLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminSidebar;
