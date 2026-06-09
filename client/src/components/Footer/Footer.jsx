import styles from "./Footer.module.css";
import { useNavigate } from 'react-router-dom'


function Footer() {
  const navigate = useNavigate();
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Section 1: Brand info and contact details */}
        <div className={styles.footerSection}>
          <h2>Explore</h2>
          <p className={styles.footerText}>
            Discover, book, and follow
            <br /> every step of your Jordan
            <br /> journey with us
          </p>
          <p>
            <i className="fa-regular fa-envelope" id="mail1"></i>
            <a href="mailto:example@gmail.com">email@gmail.com</a>
          </p>
          <p>
            <i className="fa-solid fa-phone" id="phone1"></i>07xxxxxxxx
          </p>
        </div>

        {/* Section 2: Information navigation links */}
        <div className={styles.footerSection}>
          <h2>Navigate</h2>
          <ul>
            <li
              onClick={() => {
                navigate('/')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 10)
              }}
            >
              <p>Home</p>
            </li>
            <li
              onClick={() => {
                navigate('/destinations')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 10)
              }}
            >
              <p>Destination</p>
            </li> <li
              onClick={() => {
                navigate('/map')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 10)
              }}
            >
              <p>Map</p>
            </li> <li
              onClick={() => {
                navigate('/support')
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }, 10)
              }}
            >
              <p>Support</p>
            </li>
          </ul>
        </div>

        {/* Section 3: Category navigation links */}
        <div className={styles.footerSection}>


        </div>

        {/* Section 4: Newsletter subscription */}
        <div className={styles.footerSection}>
          <h2>Stay updated</h2>
          <form className={styles.newsletter}>
            <div className={styles.newsletterInputWrapper}>
              <input
                type="email"
                id="newsletter-email"
                autoComplete="off"
                placeholder=" "
                className={styles.newsletterInput}
              />
              <label
                htmlFor="newsletter-email"
                className={styles.newsletterLabel}
              >
                email address
              </label>
            </div>
            <button type="submit">
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </form>
          <p className={styles.footerText}>
            subscribe to get notifications for new trips, destination, and more
          </p>
        </div>

        {/* Section 5: Social icons — Centered and Optimized */}
        <div className={styles.footerSection}>
          <div className={styles.socialIcons}>
            <a href="#" id="face1">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" id="insta1">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#" id="tube1">
              <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>
      </div>
    </footer >
  );
}

export default Footer;
