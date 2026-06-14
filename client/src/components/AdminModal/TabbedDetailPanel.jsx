import { useState } from "react";
import styles from "./TabbedDetailPanel.module.css";


const detectContactType = (value) => {
  const lower = value.toLowerCase().trim();

  
  if (/^\+[\d\s\-()]+$/.test(lower) || /^[\d\s\-()]+$/.test(lower)) {
    return { type: "phone", display: value };
  }

  
  if (lower.includes("wa.me") || lower.includes("whatsapp")) {
    return { type: "whatsapp", display: value };
  }

  
  if (lower.includes("facebook.com") || lower.includes("fb.com")) {
    
    let username = value;
    const fbMatch = value.match(/(?:facebook\.com|fb\.com)\/([^/?]+)/i);
    if (fbMatch && fbMatch[1] && !fbMatch[1].includes("=")) {
      username = fbMatch[1];
    }
    return { type: "facebook", display: username };
  }

  
  if (lower.includes("instagram.com")) {
    const igMatch = value.match(/instagram\.com\/([^/?]+)/i);
    const username = igMatch ? igMatch[1] : value;
    return { type: "instagram", display: username };
  }

  
  if (lower.includes("x.com") || lower.includes("twitter.com")) {
    const xMatch = value.match(/(?:x\.com|twitter\.com)\/([^/?]+)/i);
    const username = xMatch ? xMatch[1] : value;
    return { type: "x", display: username };
  }

  
  if (lower.includes("discord")) {
    let username = value;
    const discordMatch = value.match(/discord(?:app\.com)?(?:[\/]=)?\/([^/?]+)/i);
    if (discordMatch && discordMatch[1]) {
      username = discordMatch[1];
    }
    return { type: "discord", display: username };
  }

  
  return { type: "url", display: value };
};


const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes || "00"} ${ampm}`;
};


const PLACEHOLDER_REVIEWS = [
  { id: 1, name: "Sarah M.", rating: 5, text: "Amazing experience! The views were breathtaking and the staff was incredibly friendly. Would definitely come back.", date: "2 weeks ago" },
  { id: 2, name: "John D.", rating: 4, text: "Great place to visit. A bit crowded on weekends but still worth it.", date: "1 month ago" },
  { id: 3, name: "Emma W.", rating: 5, text: "Absolutely stunning! The photos don't do it justice. Must visit!", date: "1 month ago" },
  { id: 4, name: "Michael B.", rating: 4, text: "Good overall experience. The facilities were clean and well-maintained.", date: "2 months ago" },
  { id: 5, name: "Lisa K.", rating: 5, text: "One of the best places I've ever visited. Highly recommend!", date: "2 months ago" },
];


const PLACEHOLDER_STATS = {
  rating: 4.5,
  label: "Wonderful",
  totalReviews: 4439,
  source: "Google",
  distribution: { 5: 2800, 4: 1200, 3: 300, 2: 100, 1: 39 },
};

function TabbedDetailPanel({ isOpen, onClose, data, type }) {
  const [activeTab, setActiveTab] = useState("about");

  if (!isOpen) return null;

  const tabs = type === "hotel"
    ? ["about", "reviews", "contact", "photos", "book"]
    : ["about", "reviews", "contact", "photos"];

  const formatOperatingHours = () => {
    if (!data.operatingHours) return "Not specified";
    const { start, end } = data.operatingHours;
    if (!start && !end) return "Not specified";
    return `${formatTime(start)} — ${formatTime(end)}`;
  };

  const getContactIcon = (type) => {
    switch (type) {
      case "phone": return "phone";
      case "whatsapp": return "chat";
      case "facebook": return "facebook";
      case "instagram": return "photo_camera";
      case "x": return "tag";
      case "discord": return "forum";
      default: return "language";
    }
  };

  const renderAboutTab = () => (
    <div className={styles.aboutTab}>
      <div className={styles.aboutLeft}>
        <div className={styles.aboutItem}>
          <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>location_on</span>
          <div>
            <span className={styles.aboutLabel}>Location</span>
            <p className={styles.aboutValue}>{data.location || "Not specified"}</p>
          </div>
        </div>

        <div className={styles.aboutItem}>
          <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>attach_money</span>
          <div>
            <span className={styles.aboutLabel}>Budget</span>
            <p className={styles.aboutValue}>{data.budget || "Not specified"}</p>
          </div>
        </div>

        <div className={styles.aboutItem}>
          <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>schedule</span>
          <div>
            <span className={styles.aboutLabel}>Operating Hours</span>
            <p className={styles.aboutValue}>{formatOperatingHours()}</p>
          </div>
        </div>

        <div className={styles.aboutItem}>
          <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>calendar_today</span>
          <div>
            <span className={styles.aboutLabel}>Working Days</span>
            <div className={styles.dayPills}>
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <span
                  key={day}
                  className={`${styles.dayPill} ${(data.workingDays || []).includes(day) ? styles.dayPillActive : ""}`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.aboutRight}>
        <img src={data.image} alt="Cover" className={styles.coverThumbnail} />
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className={styles.reviewsTab}>
      <div className={styles.reviewsSummary}>
        <div className={styles.scoreBox}>
          <span className={styles.scoreValue}>{PLACEHOLDER_STATS.rating}</span>
          <span className={styles.scoreLabel}>{PLACEHOLDER_STATS.label}</span>
          <span className={styles.scoreReviews}>{PLACEHOLDER_STATS.totalReviews} reviews</span>
          <span className={styles.scoreSource}>From {PLACEHOLDER_STATS.source}</span>
        </div>

        <div className={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = PLACEHOLDER_STATS.distribution[stars];
            const percentage = (count / PLACEHOLDER_STATS.totalReviews) * 100;
            return (
              <div key={stars} className={styles.ratingBarRow}>
                <span className={styles.ratingBarLabel}>{stars}</span>
                <span className="material-symbols-outlined" style={{ color: "#f59e0b", fontSize: "0.9rem" }}>star</span>
                <div className={styles.ratingBarTrack}>
                  <div className={styles.ratingBarFill} style={{ width: `${percentage}%` }}></div>
                </div>
                <span className={styles.ratingBarCount}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.reviewsList}>
        {PLACEHOLDER_REVIEWS.map((review) => (
          <div key={review.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <div className={styles.reviewerAvatar}>
                  {review.name.charAt(0)}
                </div>
                <div>
                  <span className={styles.reviewerName}>{review.name}</span>
                  <span className={styles.reviewDate}>{review.date}</span>
                </div>
              </div>
              <div className={styles.reviewRating}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined"
                    style={{ color: i < review.rating ? "#f59e0b" : "#e5e7eb", fontSize: "1rem" }}
                  >
                    star
                  </span>
                ))}
              </div>
            </div>
            <p className={styles.reviewText}>{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactTab = () => {
    const contacts = data.contacts || [];

    if (contacts.length === 0) {
      return (
        <div className={styles.emptyContact}>
          <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#9ca3af" }}>contact_phone</span>
          <p>No contact information available</p>
        </div>
      );
    }

    return (
      <div className={styles.contactList}>
        {contacts.map((contact, index) => {
          const { type, display } = detectContactType(contact);
          return (
            <div key={index} className={styles.contactItem}>
              <div className={styles.contactIcon} data-type={type}>
                <span className="material-symbols-outlined">{getContactIcon(type)}</span>
              </div>
              <span className={styles.contactValue}>{display}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPhotosTab = () => {
    const photos = data.photos || [];

    if (photos.length === 0) {
      return (
        <div className={styles.emptyPhotos}>
          <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#9ca3af" }}>photo_library</span>
          <p>There are no photos at the moment</p>
        </div>
      );
    }

    return (
      <div className={styles.photoGrid}>
        {photos.map((photo, index) => (
          <img key={index} src={photo} alt={`Photo ${index + 1}`} className={styles.photoItem} />
        ))}
      </div>
    );
  };

  const renderBookTab = () => {
    const bookingLink = data.bookingLink;

    if (!bookingLink) {
      return (
        <div className={styles.emptyBook}>
          <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#9ca3af" }}>hotel</span>
          <p>There is no booking option currently</p>
        </div>
      );
    }

    return (
      <div className={styles.bookTab}>
        <p className={styles.bookPrompt}>Ready to book your stay at {data.name}?</p>
        <a
          href={bookingLink.startsWith("http") ? bookingLink : `https://${bookingLink}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.bookButton}
        >
          Book on Booking.com
        </a>
      </div>
    );
  };

  return (
    <div className={styles.panelOverlay} onClick={onClose}>
      <div className={styles.panelContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{data.name || "Details"}</h2>
          <button className={styles.panelClose} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === "about" && renderAboutTab()}
          {activeTab === "reviews" && renderReviewsTab()}
          {activeTab === "contact" && renderContactTab()}
          {activeTab === "photos" && renderPhotosTab()}
          {activeTab === "book" && renderBookTab()}
        </div>
      </div>
    </div>
  );
}

export default TabbedDetailPanel;