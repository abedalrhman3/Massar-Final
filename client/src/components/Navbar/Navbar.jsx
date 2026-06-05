import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  // Scroll behavior: hide on scroll down, show on scroll up, add background when not at top
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;

      setScrolled(currentY > 10);

      if (currentY < 10) {
        // Always show at top
        setVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        // Scrolling down — hide
        setVisible(false);
        setMenuOpen(false); // close mobile menu on hide
      } else if (currentY < lastScrollY.current - 8) {
        // Scrolling up — show
        setVisible(true);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div
      className={`${styles.topnav} ${scrolled ? styles.scrolled : ""} ${visible ? styles.navVisible : styles.navHidden}`}
    >
      <h2>Massar</h2>

      {/* Desktop nav links */}
      <div className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/destinations">Destinations</Link>
        <Link to="/map">Map</Link>
      </div>

      {/* Desktop button */}
      <button className={styles.getStartedBtn}
        onClick={() => navigate("/login")}
      >Get started</button>

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
            <Link to="/tours" onClick={() => setMenuOpen(false)}>
              Tours
            </Link>
            <Link to="/map" onClick={() => setMenuOpen(false)}>
              Map
            </Link>
          </nav>

          <button className={styles.overlayGetStarted}>Let's start</button>
        </div>
      )}
    </div>
  );
}

export default Navbar;
