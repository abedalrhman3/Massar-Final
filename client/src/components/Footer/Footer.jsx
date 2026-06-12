import styles from "./Footer.module.css";
import { useNavigate } from 'react-router-dom';
import Logo from "/massar-logo.png";

function Footer() {
  const navigate = useNavigate();

  const navTo = (path) => {
    navigate(path);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 10);
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>

        {/* Col 1: Brand + contact + social */}
        <div className={styles.footerSection}>
          <img src={Logo} alt="Massar" width={90} className={styles.logo} />
          <p className={styles.tagline}>
            Discover, book, and follow every step<br /> of your Jordan journey with us
          </p>
          <p className={styles.contactItem}>
            <i className="fa-regular fa-envelope" aria-hidden="true"></i>
            <a href="mailto:abedalrhmanabood12@gmail.com">abedalrhmanabood12@gmail.com</a>
          </p>
          <p className={styles.contactItem}>
            <i className="fa-solid fa-phone" aria-hidden="true"></i>
            00962781668565
          </p>
          <div className={styles.socialIcons}>
            <a href="https://web.facebook.com/share/g/1TSWjVtr1K/" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/abedalrhman_3/?__pwa=1#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className={styles.footerSection}>
          <p className={styles.colLabel}>Navigate</p>
          <ul className={styles.navList}>
            <li onClick={() => navTo('/')}><span>Home</span></li>
            <li onClick={() => navTo('/destinations')}><span>Destinations</span></li>
            <li onClick={() => navTo('/map')}><span>Map</span></li>
            <li onClick={() => navTo('/support')}><span>Support</span></li>
          </ul>
        </div>

        {/* Col 3: Newsletter */}
        <div className={styles.footerSection}>
          <p className={styles.colLabel}>Stay updated</p>
          <div className={styles.newsletter}>
            <input
              type="email"
              placeholder="email@gmail.com"
              className={styles.newsletterInput}
            />
            <button type="button" className={styles.newsletterBtn} aria-label="Subscribe">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          <p className={styles.newsletterNote}>
            Subscribe for new trips, destinations, and travel inspiration.
          </p>
        </div>

      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <span>© 2026 Massar. All rights reserved.</span>
        <div className={styles.bottomLinks}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;