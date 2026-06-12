import { useEffect, useRef, useState } from "react";
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
const phoneBackground = "/images/homepage/phonePlaceholder.png";

// Adventure
const nature = "/images/homepage/nature.jpg";
const hobby = "/images/homepage/hobby.jpg";
const culture = "/images/homepage/culture.jpg";

// ─── Tutorial steps ───────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    navId: "nav-destinations",
    label: "1 of 3",
    title: "Destinations",
    desc: "Browse all of Jordan's top sites — Wadi Rum, Petra, Dead Sea and more — with guides, photos and tips.",
    circle: false,
  },
  {
    navId: "nav-map",
    label: "2 of 3",
    title: "Map",
    desc: "Track your route in real time. See points of interest, trail paths and your live location across Jordan.",
    circle: false,
  },
  {
    navId: "nav-chatbot",
    label: "3 of 3",
    title: "AI trip assistant",
    desc: "Your personal guide. Ask about routes, activities, opening hours, packing tips — anything about Jordan.",
    circle: true,
  },
];

// ─── TutorialOverlay ──────────────────────────────────────────────────────────
function TutorialOverlay({ onDone }) {
  const [cur, setCur] = useState(0);
  const [hlRect, setHlRect] = useState(null);
  const step = TUTORIAL_STEPS[cur];
  const PAD = 7;

  useEffect(() => {
    function measure() {
      const el = document.getElementById(step.navId);
      if (!el) return;
      const r = el.getBoundingClientRect();
      setHlRect({
        top: r.top + window.scrollY,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cur, step.navId]);

  const advance = () => {
    if (cur < TUTORIAL_STEPS.length - 1) setCur((c) => c + 1);
    else onDone();
  };

  // Tooltip placement: below navbar items, left-of for chatbot
  const tipStyle = hlRect
    ? step.circle
      ? {
        position: "fixed",
        top: hlRect.top - window.scrollY - 160,
        left: Math.max(8, hlRect.left - 230),
      }
      : {
        position: "fixed",
        top: hlRect.top - window.scrollY + hlRect.height + 14,
        left: Math.min(hlRect.left, window.innerWidth - 230),
      }
    : { display: "none" };

  const hlStyle = hlRect
    ? {
      position: "fixed",
      top: hlRect.top - window.scrollY - PAD,
      left: hlRect.left - PAD,
      width: hlRect.width + PAD * 2,
      height: hlRect.height + PAD * 2,
      borderRadius: step.circle ? "50%" : 8,
      border: "2.5px solid transparent",
      boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
      pointerEvents: "none",
      zIndex: 10000,
      transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
    }
    : {};

  return (
    <>
      {/* Dark overlay (click to dismiss) */}
      <div
        onClick={onDone}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          zIndex: 9999,
        }}
      />

      {/* Highlight ring */}
      {hlRect && <div style={hlStyle} />}

      {/* Tooltip */}
      <div
        style={{
          ...tipStyle,
          zIndex: 10001,
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 14,
          padding: "16px 18px",
          width: 220,
          boxShadow: "0 6px 28px rgba(0,0,0,0.18)",
          fontFamily: "inherit",
        }}
      >
        <div style={{ fontSize: 10, color: "black", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          Step {step.label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "black", marginBottom: 6 }}>
          {step.title}
        </div>
        <div style={{ fontSize: 12, color: "black", lineHeight: 1.6, marginBottom: 14 }}>
          {step.desc}
        </div>

        {/* Footer: dots + buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 5 }}>
            {TUTORIAL_STEPS.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: i === cur ? "var(--color-accent)" : "white",
                  display: "inline-block",
                  transition: "background 0.2s",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onDone}
              style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11,
                border: "1px solid white", background: "transparent",
                color: "white", cursor: "pointer",
              }}
            >
              Skip
            </button>
            <button
              onClick={advance}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 11,
                border: "none", background: "var(--color-accent)",
                color: "white", fontWeight: 600, cursor: "pointer",
              }}
            >
              {cur === TUTORIAL_STEPS.length - 1 ? "Done ✓" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home() {
  const navigate = useNavigate();
  const images = [deadSea, petra, wadiRum];
  const [index, setIndex] = useState(0);
  const { user } = useAuth();
  const [showTutorial, setShowTutorial] = useState(false);

  // Hero slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Show tutorial on first login
  useEffect(() => {
    if (user) {
      const key = `massar_tutorial_seen_${user.uid}`; // or user.id depending on your auth
      if (!localStorage.getItem(key)) {
        const t = setTimeout(() => setShowTutorial(true), 600);
        return () => clearTimeout(t);
      }
    }
  }, [user]);

  const handleTutorialDone = () => {
    const key = `massar_tutorial_seen_${user.uid}`; // or user.id
    localStorage.setItem(key, "true");
    setShowTutorial(false);
  };

  return (
    <div className={styles.homepage}>
      {showTutorial && <TutorialOverlay onDone={handleTutorialDone} />}

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
              >
                Let's start
              </button>
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
          <button
            className={styles.learnMoreBtn}
            style={{ zIndex: 100, position: "relative" }}
            onClick={() => navigate("/destinations/wadi-rum")}
          >
            learn more
          </button>
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
            <button
              className={styles.learnMoreBtn}
              onClick={() => navigate("/destinations/petra-1")}
            >
              learn more
            </button>
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
          <button
            className={styles.learnMoreBtn}
            onClick={() => navigate("/destinations/dead-sea-1")}
          >
            learn more
          </button>
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
        <div className={styles.trackHalfPhoneContainer}>
          <img src={halfPhone} alt="phone" className={styles.trackHalfPhone} />
        </div>
        <div className={styles.trackPhoneContainer}>
          <img src={phone} alt="phone" className={styles.trackPhone} />
        </div>
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