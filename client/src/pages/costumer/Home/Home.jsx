import { useEffect, useState } from "react";
import styles from "./Home.module.css";
import Navbar from "../../../components/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Heroes
const deadSea = "images/homepage/dead-sea.jpeg";
const petra = "images/homepage/petra.jpeg";
const wadiRum = "images/homepage/wadi-rum.jpeg";

// Destinations
const wadiRumDest = "/images/destinationCard/wadi-rum.webp";
const petraDest = "/images/destinationCard/Petra.jpg";
const deadSeaDest = "/images/destinationCard/dead sea.webp";

// Decor
const route = "/images/homepage/route2.png";
const guide = "/images/homepage/guide.png";
const halfPhone = "/images/homepage/half-phone.PNG";
const phone = "/images/homepage/phone.png";
const star = "/images/homepage/star.png";

// Adventure
const nature = "/images/homepage/nature.jpg";
const hobby = "/images/homepage/hobby.jpg";
const culture = "/images/homepage/culture.jpg";

function Home() {
  const navigate = useNavigate();
  const images = [deadSea, petra, wadiRum];
  const [index, setIndex] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.homepage}>
      <div
        className={`${styles.imageContainer} ${styles.bottomCornersRounded}`}
        style={{ backgroundImage: `url(${images[index]})` }}
      >


        <div className={styles.inImageText}>
          Hike Wadi Rum at sunrise, float in Dead Sea by afternoon, and dine in
          Aqaba as the stars come out.
          <p>
            We will guide you{" "}
            {!user ? (
              <button
                className={styles.secondBtn}
                onClick={() => navigate("/login")}
              >Let's start</button>
            ) : (
              <></>
            )}
          </p>
        </div>

      </div>

      <div className={styles.discoverContainer}>
        <h3 className={styles.h3}>
          Discover
          <br />
          Unforggetable
          <br />
          Adventures
          <br />
          With us
        </h3>
        <figure>
          <img
            src={wadiRumDest}
            alt="Wadi Rum"
            className={`${styles.upperCornersRounded} ${styles.firstImg}`}
          />
          <h1 className={styles.h1}>Wadi Rum</h1>
          <figcaption>
            <p>
              A vast, silent desert of rust-red cliffs and
              <br /> golden sands, Wadi Rum is Jordan's most
              <br /> breathtaking escape.
            </p>
          </figcaption>
          <button className={styles.learnMoreBtn}>learn more</button>
        </figure>
        <img
          src={petraDest}
          alt="Petra"
          className={`${styles.leftCornersRounded} ${styles.secondImg}`}
        />
        <figure>
          <figcaption className={styles.secondTxt}>
            <h1 className={styles.h1}>Petra</h1>
            <p>
              Carved into rose-red rock over 2,000 years ago,
              <br /> Petra is Jordan's ancient wonder — a city of
              <br /> temples, tombs and timeless mystery waiting to
              <br /> be discovered.
            </p>
            <button className={styles.learnMoreBtn}>learn more</button>
          </figcaption>
        </figure>
        <h3 className={styles.adventure}>
          Adventure,
          <br />
          Theerpay,
          <br />
          And Culture
        </h3>
        <figure>
          <img
            src={deadSeaDest}
            alt="dead sea"
            className={`${styles.upperCornersRounded} ${styles.thirdImg}`}
          />
          <h1 className={styles.h1}>Dead Sea</h1>
          <figcaption>
            <p>
              The world's natural spa: mineral-rich waters.
              <br />
              that have healed and restored travellers for
              <br />
              for thousands of years.
            </p>
          </figcaption>
          <button className={styles.learnMoreBtn}>learn more</button>
        </figure>
      </div>

      <div className={`${styles.trackContainer} ${styles.cornersRounded}`}>
        <div className={styles.trackText}>
          Track
          <br />
          Every
          <br />
          Step
        </div>
        <img src={route} alt="route" className={styles.trackRoute} />
        <img src={guide} alt="map guide" className={styles.trackGuide} />
        <img src={halfPhone} alt="phone" className={styles.trackHalfPhone} />
        <img src={phone} alt="phone" className={styles.trackPhone} />
      </div>

      <div className={styles.adventureContainer}>
        <div className={styles.adventureTitle}>
          <h2 className={styles.h2}>
            Find the
            <br />
            Perfect
            <br />
            Adventure
          </h2>
        </div>
        <div className={styles.adventureRating}>
          <div className={styles.adventureRatingTop}>
            <img src={star} className={styles.adventureStar} />
            <span className={styles.adventureScore}>4.5k</span>
          </div>
          <p>the most stunning destination to visit in Jordan</p>
        </div>
        <div className={`${styles.adventureCard} ${styles.adventureNature}`}>
          <img src={nature} alt="Nature" />
          <span className={styles.adventureLabel}>Nature</span>
        </div>
        <div className={`${styles.adventureCard} ${styles.adventureHobby}`}>
          <img src={hobby} alt="Hobby" />
          <span className={styles.adventureLabel}>Hobby</span>
        </div>
        <div className={`${styles.adventureCard} ${styles.adventureCulture}`}>
          <img src={culture} alt="Culture" />
          <span className={styles.adventureLabel}>Culture</span>
        </div>
      </div>
    </div>
  );
}

export default Home;
