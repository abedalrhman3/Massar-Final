import styles from "./About.module.css";
//import Footer from "../../components/Footer/Footer";

// Icons
import star from "../../../assets/images/icons/star.png";
import shine from "../../../assets/images/icons/shine.png";
import play from "../../../assets/images/icons/play.png";
import tourGuide from "../../../assets/images/icons/tour-guide.png";
import location from "../../../assets/images/icons/location.png";
import walk from "../../../assets/images/icons/walk.png";

// Decor
import about1 from "../../../assets/images/decor/about-1.png";
import about2 from "../../../assets/images/decor/about-2.png";
import about3 from "../../../assets/images/decor/about-3.jpg";
import about4 from "../../../assets/images/decor/about-4.jpg";
import video from "/video/about-test.mp4";

export default function AboutPage() {
  return (
    <>
      <div style={{ backgroundColor: "#2D6BFF" }}>
      </div>
      <div className={styles.aboutPage}>
        <div className={styles.aboutHero}>
          <div className={styles.aboutHeroTitle}>
            <img src={star} alt="" className={styles.starTr} />
            <img src={shine} alt="" className={styles.starBl} />
            <h1>About us</h1>
          </div>
          <p className={styles.aboutHeroText}>
            We are a passionate group of Jordanian explorers and tech
            enthusiasts dedicated to making every journey safe, memorable, and
            uniquely yours.
          </p>
        </div>

        <div className={styles.aboutImagesRow}>
          <img
            src={about1}
            alt="About 1"
            className={`${styles.aboutImg} ${styles.aboutImgTall}`}
          />
          <img
            src={about2}
            alt="About 2"
            className={`${styles.aboutImg} ${styles.aboutImgShort}`}
          />
          <img
            src={about3}
            alt="About 3"
            className={`${styles.aboutImg} ${styles.aboutImgTall}`}
          />
          <img
            src={about4}
            alt="About 4"
            className={`${styles.aboutImg} ${styles.aboutImgShort}`}
          />
        </div>

        <div className={styles.aboutWho}>
          <h2 className={styles.aboutWhoTitle}>
            We are the locals who know every hidden path,
            <br /> ancient ruin, and starlit camp in Jordan.
          </h2>
          <p className={styles.aboutWhoText}>
            From the winding streets of Jerash to the calm shores of Aqaba, we
            turn every destination into a story worth telling. Live navigation,
            handpicked routes, and a team that knows Jordan — everything in one
            app, made for explorers like you.
          </p>
        </div>

        <div className={styles.aboutGuide}>
          <div className={styles.aboutVideoWrapper}>
            <video className={styles.aboutVideo} controls>
              <source src={video} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className={styles.aboutQuote}>
            <h2 className={styles.aboutGuideTitle}>
              We guide every traveler
              <br /> through Jordan
            </h2>
            <blockquote className={styles.aboutBlockquote}>
              "Jordan has always been on my bucket list, but exploring it with
              Massar made it something far beyond what I imagined — every trail
              was mapped, every stop was worth it, and I never once felt lost"
            </blockquote>
            <p className={styles.aboutAuthor}>
              — James R., Adventure Traveler from Canada
            </p>
          </div>
        </div>

        <div className={styles.aboutFeatures}>
          <div className={styles.aboutFeature}>
            <div className={styles.aboutFeatureIcon}>
              <img src={tourGuide} alt="Local Expertise" />
            </div>
            <h3>Local Expertise</h3>
            <p>
              Our guides are born and raised in Jordan, with firsthand knowledge
              of every trail, landmark, and hidden gem worth discovering.
            </p>
          </div>
          <div className={styles.aboutFeature}>
            <div className={styles.aboutFeatureIcon}>
              <img src={location} alt="Real-Time Tracking" />
            </div>
            <h3>Real-Time Tracking</h3>
            <p>
              Stay connected with live route tracking that lets you and your
              loved ones follow every step of your journey.
            </p>
          </div>
          <div className={styles.aboutFeature}>
            <div className={styles.aboutFeatureIcon}>
              <img src={walk} alt="Curated Adventures" />
            </div>
            <h3>Curated Adventures</h3>
            <p>
              Every tour is carefully selected and tested by our team to make
              sure you get the most authentic and memorable experience Jordan
              has to offer.
            </p>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
