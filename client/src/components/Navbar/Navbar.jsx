import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../UserAvatar';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user) return;
    console.log(user);
  }, [user])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY < 10) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        setVisible(false);
        setMenuOpen(false);
      } else if (currentY < lastScrollY.current - 8) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className={`${styles.topnav} ${scrolled ? styles.scrolled : ""} ${visible ? styles.navVisible : styles.navHidden}`}>
      <h2>Massar</h2>

      <div className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/destinations">Destinations</Link>
        <Link to="/map">Map</Link>
        {user?.role === 'admin' && <Link to="/admin">Admin</Link>}
      </div>

      {user
        ? <UserAvatar onLogout={handleLogout} />
        : <button className={styles.getStartedBtn} onClick={() => navigate("/login")}>Get Started</button>
      }

      <button className={styles.hamburger} onClick={() => setMenuOpen(true)} aria-label="Open menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      {menuOpen && (
        <div className={styles.mobileOverlay}>
          <button className={styles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Close menu">
            &#x2715;
          </button>
          <h2 className={styles.overlayTitle}>Explore</h2>
          <nav className={styles.overlayLinks}>
            <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/tours" onClick={() => setMenuOpen(false)}>Tours</Link>
            <Link to="/map" onClick={() => setMenuOpen(false)}>Map</Link>
          </nav>
          <button className={styles.overlayGetStarted}>Let's start</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;