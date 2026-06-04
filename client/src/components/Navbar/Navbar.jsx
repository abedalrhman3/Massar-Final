import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsAdmin(user.is_admin === true);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    window.location.href = "/";
  };

  return (
    <div className={styles.topnav}>
      <h2>Massar</h2>

      {/* Desktop nav links */}
      <div className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/destinations">Destinations</Link>
        <Link to="/map">Map</Link>
        {isLoggedIn && <Link to="/dashboard">Dashboard</Link>}
        {isLoggedIn && <Link to="/profile">Profile</Link>}
        {isAdmin && <Link to="/admin" style={{ color: "#7C3AED", fontWeight: "bold" }}>Admin</Link>}
      </div>

      {/* Desktop button */}
      {isLoggedIn ? (
        <button className={styles.getStartedBtn} onClick={handleLogout}>
          Sign Out
        </button>
      ) : (
        <Link to="/login" className={styles.getStartedBtn} style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          Get started
        </Link>
      )}

      {/* Hamburger icon (mobile only) */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile fullscreen overlay */}
      {menuOpen && (
        <div className={styles.mobileOverlay}>
          <button
            className={styles.closeBtn}
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            &#x2715;
          </button>

          <h2 className={styles.overlayTitle}>Explore</h2>

          <nav className={styles.overlayLinks}>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <Link to="/destinations" onClick={() => setMenuOpen(false)}>
              Destinations
            </Link>
            <Link to="/map" onClick={() => setMenuOpen(false)}>
              Map
            </Link>
            {isLoggedIn && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
            {isLoggedIn && (
              <Link to="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ color: "#7C3AED", fontWeight: "bold" }}>
                Admin
              </Link>
            )}
          </nav>

          {isLoggedIn ? (
            <button
              className={styles.overlayGetStarted}
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className={styles.overlayGetStarted}
              onClick={() => setMenuOpen(false)}
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            >
              Let's start
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
