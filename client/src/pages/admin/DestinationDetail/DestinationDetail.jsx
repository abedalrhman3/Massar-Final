import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styles from "./DestinationDetail.module.css";

// Modal components
import PlacesModal from "../../components/AdminModal/PlacesModal";
import EventsModal from "../../components/AdminModal/EventsModal";
import HotelsModal from "../../components/AdminModal/HotelsModal";
import RestaurantsModal from "../../components/AdminModal/RestaurantsModal";

// Helper to format time from 24h to 12h AM/PM
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes || "00"} ${ampm}`;
};

// Placeholder reviews data
const PLACEHOLDER_REVIEWS = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    text: "Amazing experience! The views were breathtaking and the staff was incredibly friendly. Would definitely come back.",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "John D.",
    rating: 4,
    text: "Great place to visit. A bit crowded on weekends but still worth it.",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Emma W.",
    rating: 5,
    text: "Absolutely stunning! The photos don't do it justice. Must visit!",
    date: "1 month ago",
  },
];

const PLACEHOLDER_STATS = {
  rating: 4.5,
  label: "Wonderful",
  totalReviews: 4439,
  source: "Google",
  distribution: { 5: 2800, 4: 1200, 3: 300, 2: 100, 1: 39 },
};

// Detect contact type from input
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
    const discordMatch = value.match(
      /discord(?:app\.com)?(?:[\/]=)?\/([^/?]+)/i,
    );
    if (discordMatch && discordMatch[1]) {
      username = discordMatch[1];
    }
    return { type: "discord", display: username };
  }
  return { type: "url", display: value };
};

const getContactIcon = (type) => {
  switch (type) {
    case "phone":
      return "phone";
    case "whatsapp":
      return "chat";
    case "facebook":
      return "facebook";
    case "instagram":
      return "photo_camera";
    case "x":
      return "tag";
    case "discord":
      return "forum";
    default:
      return "language";
  }
};

function DestinationDetail() {
  const { slug } = useParams();

  // Modal states
  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [showRestaurantsModal, setShowRestaurantsModal] = useState(false);

  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);

  // Remove confirmation state
  const [removingItem, setRemovingItem] = useState(null);
  const [removingType, setRemovingType] = useState(null);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState(null);

  // Card tab states - keyed by item id
  const [cardTabs, setCardTabs] = useState({});
  const [cardMenus, setCardMenus] = useState({});

  // Click outside ref for menus
  const menuRefs = useRef({});

  // Prevent body scroll when modal is open
  useEffect(() => {
    const anyModalOpen =
      showPlacesModal ||
      showEventsModal ||
      showHotelsModal ||
      showRestaurantsModal ||
      editingItem ||
      removingItem ||
      lightboxImage;
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    showPlacesModal,
    showEventsModal,
    showHotelsModal,
    showRestaurantsModal,
    editingItem,
    removingItem,
    lightboxImage,
  ]);

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      const openMenuId = Object.keys(cardMenus).find((id) => cardMenus[id]);
      if (openMenuId && menuRefs.current[openMenuId]) {
        if (!menuRefs.current[openMenuId].contains(e.target)) {
          setCardMenus({});
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cardMenus]);

  // Data states - local only, no fetching
  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [events, setEvents] = useState([]);

  const stats = [
    { label: "Places", count: places.length },
    { label: "Hotels", count: hotels.length },
    { label: "Restaurants", count: restaurants.length },
    { label: "Events", count: events.length },
  ];

  // Format slug back to display name
  const displayName = slug
    ? slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Destination";

  // Get tabs for a given type
  const getTabs = (type) => {
    return type === "hotel"
      ? ["overview", "about", "reviews", "contact", "photos", "book"]
      : ["overview", "about", "reviews", "contact", "photos"];
  };

  // Handle tab change for a specific card
  const handleTabChange = (itemId, tab) => {
    setCardTabs((prev) => ({ ...prev, [itemId]: tab }));
  };

  // Handle menu toggle for a specific card
  const handleMenuToggle = (e, itemId) => {
    e.stopPropagation();
    setCardMenus((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Handle edit
  const handleEdit = (item, type) => {
    setEditingItem(item);
    setEditingType(type);
    setCardMenus({});
  };

  // Handle remove - open confirmation
  const handleRemoveClick = (item, type) => {
    setRemovingItem(item);
    setRemovingType(type);
    setCardMenus({});
  };

  // Confirm remove
  const confirmRemove = () => {
    if (!removingItem || !removingType) return;

    switch (removingType) {
      case "place":
        setPlaces(places.filter((p) => p.id !== removingItem.id));
        break;
      case "hotel":
        setHotels(hotels.filter((h) => h.id !== removingItem.id));
        break;
      case "restaurant":
        setRestaurants(restaurants.filter((r) => r.id !== removingItem.id));
        break;
      case "event":
        setEvents(events.filter((e) => e.id !== removingItem.id));
        break;
      default:
        break;
    }
    setRemovingItem(null);
    setRemovingType(null);
  };

  // Cancel remove
  const cancelRemove = () => {
    setRemovingItem(null);
    setRemovingType(null);
  };

  // Save handlers (local state only)
  const handleSavePlace = (data) => {
    if (editingItem) {
      // Update existing
      setPlaces(
        places.map((p) =>
          p.id === editingItem.id ? { ...data, id: editingItem.id } : p,
        ),
      );
    } else {
      setPlaces([...places, { ...data, id: Date.now() }]);
    }
    setEditingItem(null);
    setEditingType(null);
  };

  const handleSaveEvent = (data) => {
    if (editingItem) {
      setEvents(
        events.map((e) =>
          e.id === editingItem.id ? { ...data, id: editingItem.id } : e,
        ),
      );
    } else {
      setEvents([...events, { ...data, id: Date.now() }]);
    }
    setEditingItem(null);
    setEditingType(null);
  };

  const handleSaveHotel = (data) => {
    if (editingItem) {
      setHotels(
        hotels.map((h) =>
          h.id === editingItem.id ? { ...data, id: editingItem.id } : h,
        ),
      );
    } else {
      setHotels([...hotels, { ...data, id: Date.now() }]);
    }
    setEditingItem(null);
    setEditingType(null);
  };

  const handleSaveRestaurant = (data) => {
    if (editingItem) {
      setRestaurants(
        restaurants.map((r) =>
          r.id === editingItem.id ? { ...data, id: editingItem.id } : r,
        ),
      );
    } else {
      setRestaurants([...restaurants, { ...data, id: Date.now() }]);
    }
    setEditingItem(null);
    setEditingType(null);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingItem(null);
    setEditingType(null);
  };

  // Get entity name for display
  const getEntityName = (type) => {
    switch (type) {
      case "place":
        return "Place";
      case "hotel":
        return "Hotel";
      case "restaurant":
        return "Restaurant";
      case "event":
        return "Event";
      default:
        return "Item";
    }
  };

  // Render card content based on active tab
  const renderCardContent = (item, type, activeTab) => {
    const formatOperatingHours = () => {
      if (!item.operatingHours) return "Not specified";
      const { start, end } = item.operatingHours;
      if (!start && !end) return "Not specified";
      return `${formatTime(start)} — ${formatTime(end)}`;
    };

    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.overviewTab}>
            <div
              className={styles.overviewImageWrapper}
              onClick={() => item.image && setLightboxImage(item.image)}
            >
              <img
                src={item.image || "/assets/images/placeholder.jpg"}
                alt={item.name}
                className={styles.overviewImage}
              />
            </div>
            <p className={styles.overviewDescription}>
              {item.description ||
                item.briefDescription ||
                "No description available"}
            </p>
          </div>
        );

      case "about":
        return (
          <div className={styles.aboutTabContent}>
            <div className={styles.aboutItem}>
              <span
                className="material-symbols-outlined"
                style={{ color: "#6b7280" }}
              >
                location_on
              </span>
              <div>
                <span className={styles.aboutLabel}>Location</span>
                <p className={styles.aboutValue}>
                  {item.location || "Not specified"}
                </p>
              </div>
            </div>

            <div className={styles.aboutItem}>
              <span
                className="material-symbols-outlined"
                style={{ color: "#6b7280" }}
              >
                attach_money
              </span>
              <div>
                <span className={styles.aboutLabel}>Budget</span>
                <p className={styles.aboutValue}>
                  {item.budget || "Not specified"}
                </p>
              </div>
            </div>

            <div className={styles.aboutItem}>
              <span
                className="material-symbols-outlined"
                style={{ color: "#6b7280" }}
              >
                schedule
              </span>
              <div>
                <span className={styles.aboutLabel}>Operating Hours</span>
                <p className={styles.aboutValue}>{formatOperatingHours()}</p>
              </div>
            </div>

            <div className={styles.aboutItem}>
              <span
                className="material-symbols-outlined"
                style={{ color: "#6b7280" }}
              >
                calendar_today
              </span>
              <div>
                <span className={styles.aboutLabel}>Working Days</span>
                <div className={styles.dayPills}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <span
                      key={day}
                      className={`${styles.dayPill} ${(item.workingDays || []).includes(day) ? styles.dayPillActive : ""}`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "reviews":
        return (
          <div className={styles.reviewsTabContent}>
            <div className={styles.reviewsSummary}>
              <div className={styles.scoreBox}>
                <span className={styles.scoreValue}>
                  {PLACEHOLDER_STATS.rating}
                </span>
                <span className={styles.scoreLabel}>
                  {PLACEHOLDER_STATS.label}
                </span>
                <span className={styles.scoreReviews}>
                  {PLACEHOLDER_STATS.totalReviews} reviews
                </span>
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
                        <span className={styles.reviewerName}>
                          {review.name}
                        </span>
                        <span className={styles.reviewDate}>{review.date}</span>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined"
                          style={{
                            color: i < review.rating ? "#f59e0b" : "#e5e7eb",
                            fontSize: "1rem",
                          }}
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

      case "contact":
        const contacts = item.contacts || [];
        if (contacts.length === 0) {
          return (
            <div className={styles.emptyContent}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.5rem", color: "#9ca3af" }}
              >
                contact_phone
              </span>
              <p>No contact information available</p>
            </div>
          );
        }
        return (
          <div className={styles.contactListContent}>
            {contacts.map((contact, index) => {
              const { type, display } = detectContactType(contact);
              return (
                <div key={index} className={styles.contactItemContent}>
                  <div className={styles.contactIconContent} data-type={type}>
                    <span className="material-symbols-outlined">
                      {getContactIcon(type)}
                    </span>
                  </div>
                  <span className={styles.contactValueContent}>{display}</span>
                </div>
              );
            })}
          </div>
        );

      case "photos":
        const photos = item.photos || [];
        if (photos.length === 0) {
          return (
            <div className={styles.emptyContent}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.5rem", color: "#9ca3af" }}
              >
                photo_library
              </span>
              <p>There are no photos at the moment</p>
            </div>
          );
        }
        return (
          <div className={styles.photoGridContent}>
            {photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Photo ${index + 1}`}
                className={styles.photoItemContent}
              />
            ))}
          </div>
        );

      case "book":
        const bookingLink = item.bookingLink;
        if (!bookingLink) {
          return (
            <div className={styles.emptyContent}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2.5rem", color: "#9ca3af" }}
              >
                hotel
              </span>
              <p>There is no booking option currently</p>
            </div>
          );
        }
        return (
          <div className={styles.bookTabContent}>
            <p className={styles.bookPrompt}>
              Ready to book your stay at {item.name}?
            </p>
            <a
              href={
                bookingLink.startsWith("http")
                  ? bookingLink
                  : `https://${bookingLink}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bookButton}
            >
              Book Now
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  // Render a card with tabs
  const renderCard = (item, type) => {
    const tabs = getTabs(type);
    const activeTab = cardTabs[item.id] || "overview";
    const isMenuOpen = cardMenus[item.id] || false;

    return (
      <div key={item.id} className={styles.entityCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName}>{item.name}</h3>
          <div
            className={styles.menuWrapper}
            ref={(el) => (menuRefs.current[item.id] = el)}
          >
            <button
              className={styles.menuBtn}
              onClick={(e) => handleMenuToggle(e, item.id)}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {isMenuOpen && (
              <div className={styles.dropdown}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item, type);
                  }}
                >
                  <span className="material-symbols-outlined">edit</span>
                  Edit
                </button>
                <button
                  className={styles.dropdownDanger}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick(item, type);
                  }}
                >
                  <span className="material-symbols-outlined">delete</span>
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.cardTabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
              onClick={() => handleTabChange(item.id, tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.cardContent}>
          {renderCardContent(item, type, activeTab)}
        </div>
      </div>
    );
  };

  // Card rendering helper
  const renderCards = (items, type) => {
    if (!items || items.length === 0) return null;
    return (
      <div className={styles.cardGrid}>
        {items.map((item) => renderCard(item, type))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{displayName}</h1>
          <p className={styles.subtitle}>
            Manage places, hotels, restaurants, and events for this destination.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.statItem}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statVal}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Content Sections */}
      <div className={styles.contentArea}>
        {/* Places Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Places</h2>
            <button
              className={styles.addSectionBtn}
              onClick={() => setShowPlacesModal(true)}
            >
              <span className="material-symbols-outlined">add</span>
              Add Place
            </button>
          </div>
          {places.length === 0 ? (
            <div className={styles.emptyState}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "3rem", color: "#9ca3af" }}
              >
                place
              </span>
              <p>No places added yet</p>
              <button
                className={styles.addBtnSmall}
                onClick={() => setShowPlacesModal(true)}
              >
                Add First Place
              </button>
            </div>
          ) : (
            renderCards(places, "place")
          )}
        </section>

        {/* Hotels Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Hotels</h2>
            <button
              className={styles.addSectionBtn}
              onClick={() => setShowHotelsModal(true)}
            >
              <span className="material-symbols-outlined">add</span>
              Add Hotel
            </button>
          </div>
          {hotels.length === 0 ? (
            <div className={styles.emptyState}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "3rem", color: "#9ca3af" }}
              >
                hotel
              </span>
              <p>No hotels added yet</p>
              <button
                className={styles.addBtnSmall}
                onClick={() => setShowHotelsModal(true)}
              >
                Add First Hotel
              </button>
            </div>
          ) : (
            renderCards(hotels, "hotel")
          )}
        </section>

        {/* Restaurants Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Restaurants</h2>
            <button
              className={styles.addSectionBtn}
              onClick={() => setShowRestaurantsModal(true)}
            >
              <span className="material-symbols-outlined">add</span>
              Add Restaurant
            </button>
          </div>
          {restaurants.length === 0 ? (
            <div className={styles.emptyState}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "3rem", color: "#9ca3af" }}
              >
                restaurant
              </span>
              <p>No restaurants added yet</p>
              <button
                className={styles.addBtnSmall}
                onClick={() => setShowRestaurantsModal(true)}
              >
                Add First Restaurant
              </button>
            </div>
          ) : (
            renderCards(restaurants, "restaurant")
          )}
        </section>

        {/* Events Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Events</h2>
            <button
              className={styles.addSectionBtn}
              onClick={() => setShowEventsModal(true)}
            >
              <span className="material-symbols-outlined">add</span>
              Add Event
            </button>
          </div>
          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "3rem", color: "#9ca3af" }}
              >
                event
              </span>
              <p>No events added yet</p>
              <button
                className={styles.addBtnSmall}
                onClick={() => setShowEventsModal(true)}
              >
                Add First Event
              </button>
            </div>
          ) : (
            renderCards(events, "event")
          )}
        </section>
      </div>

      {/* Add Modals - with state reset on open */}
      <PlacesModal
        isOpen={showPlacesModal}
        onClose={() => setShowPlacesModal(false)}
        onSave={handleSavePlace}
        destinationName={displayName}
      />

      <HotelsModal
        isOpen={showHotelsModal}
        onClose={() => setShowHotelsModal(false)}
        onSave={handleSaveHotel}
        destinationName={displayName}
      />

      <RestaurantsModal
        isOpen={showRestaurantsModal}
        onClose={() => setShowRestaurantsModal(false)}
        onSave={handleSaveRestaurant}
        destinationName={displayName}
      />

      <EventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        onSave={handleSaveEvent}
        destinationName={displayName}
      />

      {/* Edit Modals - pre-filled with existing data */}
      {editingItem && editingType === "place" && (
        <PlacesModal
          isOpen={true}
          onClose={closeEditModal}
          onSave={handleSavePlace}
          destinationName={displayName}
          editData={editingItem}
        />
      )}

      {editingItem && editingType === "hotel" && (
        <HotelsModal
          isOpen={true}
          onClose={closeEditModal}
          onSave={handleSaveHotel}
          destinationName={displayName}
          editData={editingItem}
        />
      )}

      {editingItem && editingType === "restaurant" && (
        <RestaurantsModal
          isOpen={true}
          onClose={closeEditModal}
          onSave={handleSaveRestaurant}
          destinationName={displayName}
          editData={editingItem}
        />
      )}

      {editingItem && editingType === "event" && (
        <EventsModal
          isOpen={true}
          onClose={closeEditModal}
          onSave={handleSaveEvent}
          destinationName={displayName}
          editData={editingItem}
        />
      )}

      {/* Remove Confirmation Modal */}
      {removingItem && (
        <div className={styles.confirmOverlay} onClick={cancelRemove}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "3rem", color: "#dc2626" }}
            >
              delete
            </span>
            <h3 className={styles.confirmTitle}>Remove {removingItem.name}?</h3>
            <p className={styles.confirmBody}>
              This action cannot be undone. The{" "}
              {getEntityName(removingType).toLowerCase()} will be permanently
              removed.
            </p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={cancelRemove}>
                Cancel
              </button>
              <button className={styles.removeBtn} onClick={confirmRemove}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className={styles.lightbox} onClick={() => setLightboxImage(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setLightboxImage(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={lightboxImage}
            alt="Full screen"
            className={styles.lightboxImage}
          />
        </div>
      )}
    </div>
  );
}

export default DestinationDetail;
