import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import styles from "./DestinationDetail.module.css";

import PlacesModal from "@/components/AdminModal/PlacesModal";
import EventsModal from "@/components/AdminModal/EventsModal";
import HotelsModal from "@/components/AdminModal/HotelsModal";
import RestaurantsModal from "@/components/AdminModal/RestaurantsModal";

import { getDestination } from "@/api/destination";
import { placesApi, restaurantsApi, hotelsApi } from "@/api/listings";
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/api/events";

// ── Helpers ────────────────────────────────────────────────────────────────

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes || "00"} ${ampm}`;
};

// Convert base64 string to File object for FormData upload
const base64ToFile = (base64, filename = "image.jpg") => {
  if (!base64 || typeof base64 !== "string" || !base64.startsWith("data:")) return null;
  const [header, data] = base64.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new File([array], filename, { type: mime });
};

// Build FormData for listings (places, hotels, restaurants)
const buildListingFormData = (formData, destinationId) => {
  const fd = new FormData();
  fd.append("name", formData.name);
  fd.append("destinationId", destinationId);
  fd.append("isPublished", true);

  if (formData.description) fd.append("customOverview", formData.description);
  if (formData.budget) fd.append("budget", formData.budget);
  if (formData.operatingHours) fd.append("operatingHours", JSON.stringify(formData.operatingHours));
  if (formData.workingDays) fd.append("workingDays", JSON.stringify(formData.workingDays));
  if (formData.bookingLink) fd.append("bookingUrl", formData.bookingLink);

  // Parse contact array to contact object
  const contactObj = {};
  if (formData.contacts && formData.contacts.length > 0) {
    formData.contacts.forEach((val) => {
      const { type, display } = detectContactType(val);
      if (type === "phone") contactObj.phone = display;
      else if (type === "whatsapp") contactObj.whatsapp = display;
      else if (type === "facebook") contactObj.facebook = display;
      else if (type === "instagram") contactObj.instagramUrl = display;
      else if (type === "x") contactObj.twitterUrl = display;
      else if (type === "url") {
        if (display.includes("@")) contactObj.email = display;
        else contactObj.address = display;
      }
    });
  }
  fd.append("contact", JSON.stringify(contactObj));

  // coordinates → location JSON
  if (formData.coordinates) {
    const [lat, lng] = formData.coordinates.split(",").map(Number);
    fd.append("location", JSON.stringify({ type: "Point", coordinates: [lng, lat] }));
  }

  // cover image — handle both File and base64
  if (formData.image) {
    if (formData.image instanceof File) {
      fd.append("coverImage", formData.image);
    } else {
      const file = base64ToFile(formData.image, `${formData.name}-cover.jpg`);
      if (file) fd.append("coverImage", file);
    }
  }

  // additional photos
  if (formData.photos?.length) {
    formData.photos.forEach((photo, i) => {
      if (photo instanceof File) {
        fd.append("images", photo);
      } else {
        const file = base64ToFile(photo, `photo-${i}.jpg`);
        if (file) fd.append("images", file);
      }
    });
  }

  return fd;
};

// Build FormData for events
const buildEventFormData = (formData, destinationId) => {
  const fd = new FormData();
  fd.append("name", formData.name);
  fd.append("destinationId", destinationId);
  fd.append("isPublished", true);

  if (formData.description) fd.append("customOverview", formData.description);
  if (formData.startDate) fd.append("startDate", formData.startDate);
  if (formData.endDate) fd.append("endDate", formData.endDate);
  if (formData.bookingUrl) fd.append("bookingUrl", formData.bookingUrl);

  // Parse contact array to contact object
  const contactObj = {};
  if (formData.contacts && formData.contacts.length > 0) {
    formData.contacts.forEach((val) => {
      const { type, display } = detectContactType(val);
      if (type === "phone") contactObj.phone = display;
      else if (type === "whatsapp") contactObj.whatsapp = display;
      else if (type === "facebook") contactObj.facebook = display;
      else if (type === "instagram") contactObj.instagramUrl = display;
      else if (type === "x") contactObj.twitterUrl = display;
      else if (type === "url") {
        if (display.includes("@")) contactObj.email = display;
        else contactObj.address = display;
      }
    });
  }
  fd.append("contact", JSON.stringify(contactObj));

  // startTime / endTime — model requires { from: Date, to: Date }
  // EventsModal should supply these; fall back to midnight–midnight on the date
  const startFrom = formData.startTimeFrom || formData.startDate;
  const startTo = formData.startTimeTo || formData.startDate;
  const endFrom = formData.endTimeFrom || formData.endDate;
  const endTo = formData.endTimeTo || formData.endDate;
  if (startFrom && startTo) fd.append("startTime", JSON.stringify({ from: startFrom, to: startTo }));
  if (endFrom && endTo) fd.append("endTime", JSON.stringify({ from: endFrom, to: endTo }));

  if (formData.coordinates) {
    const [lat, lng] = formData.coordinates.split(",").map(Number);
    fd.append("location", JSON.stringify({ type: "Point", coordinates: [lng, lat] }));
  }

  if (formData.image) {
    if (formData.image instanceof File) {
      fd.append("coverImage", formData.image);
    } else {
      const file = base64ToFile(formData.image, `${formData.name}-cover.jpg`);
      if (file) fd.append("coverImage", file);
    }
  }

  return fd;
};

// ── Placeholder data ───────────────────────────────────────────────────────

const PLACEHOLDER_REVIEWS = [
  { id: 1, name: "Sarah M.", rating: 5, text: "Amazing experience! The views were breathtaking.", date: "2 weeks ago" },
  { id: 2, name: "John D.", rating: 4, text: "Great place to visit. A bit crowded on weekends.", date: "1 month ago" },
  { id: 3, name: "Emma W.", rating: 5, text: "Absolutely stunning! Must visit!", date: "1 month ago" },
];

const PLACEHOLDER_STATS = {
  rating: 4.5, label: "Wonderful", totalReviews: 4439, source: "Google",
};

// ── Contact helpers ────────────────────────────────────────────────────────

const detectContactType = (value) => {
  const lower = value.toLowerCase().trim();
  if (/^\+[\d\s\-()]+$/.test(lower) || /^[\d\s\-()]+$/.test(lower)) return { type: "phone", display: value };
  if (lower.includes("wa.me") || lower.includes("whatsapp")) return { type: "whatsapp", display: value };
  if (lower.includes("facebook.com") || lower.includes("fb.com")) {
    const m = value.match(/(?:facebook\.com|fb\.com)\/([^/?]+)/i);
    return { type: "facebook", display: m?.[1] || value };
  }
  if (lower.includes("instagram.com")) {
    const m = value.match(/instagram\.com\/([^/?]+)/i);
    return { type: "instagram", display: m?.[1] || value };
  }
  if (lower.includes("x.com") || lower.includes("twitter.com")) {
    const m = value.match(/(?:x\.com|twitter\.com)\/([^/?]+)/i);
    return { type: "x", display: m?.[1] || value };
  }
  return { type: "url", display: value };
};

const getContactIcon = (type) => {
  const map = { phone: "phone", whatsapp: "chat", facebook: "facebook", instagram: "photo_camera", x: "tag", discord: "forum" };
  return map[type] || "language";
};

const mapItemToEditData = (item) => {
  if (!item) return null;
  
  // map contact object to contacts array
  const contacts = [];
  if (item.contact) {
    if (item.contact.phone) contacts.push(item.contact.phone);
    if (item.contact.whatsapp) contacts.push(item.contact.whatsapp);
    if (item.contact.email) contacts.push(item.contact.email);
    if (item.contact.address) contacts.push(item.contact.address);
    if (item.contact.instagramUrl) contacts.push(item.contact.instagramUrl);
    if (item.contact.twitterUrl) contacts.push(item.contact.twitterUrl);
  }

  // map coordinates
  let coordinates = "";
  if (item.location?.coordinates) {
    coordinates = `${item.location.coordinates[1]}, ${item.location.coordinates[0]}`;
  }

  // startTime / endTime for Event model format to form format
  let startTimeFrom = "";
  let startTimeTo = "";
  if (item.startTime) {
    if (item.startTime.from) startTimeFrom = new Date(item.startTime.from).toTimeString().slice(0, 5);
    if (item.startTime.to) startTimeTo = new Date(item.startTime.to).toTimeString().slice(0, 5);
  }
  let endTimeFrom = "";
  let endTimeTo = "";
  if (item.endTime) {
    if (item.endTime.from) endTimeFrom = new Date(item.endTime.from).toTimeString().slice(0, 5);
    if (item.endTime.to) endTimeTo = new Date(item.endTime.to).toTimeString().slice(0, 5);
  }

  return {
    ...item,
    image: item.coverImage,
    description: item.customOverview,
    briefDescription: item.customOverview,
    coordinates,
    photos: item.images || [],
    contacts,
    bookingLink: item.bookingUrl || "",
    startTimeFrom,
    startTimeTo,
    endTimeFrom,
    endTimeTo,
  };
};

// ── Main Component ─────────────────────────────────────────────────────────

function DestinationDetail() {
  const { slug } = useParams();

  const [destination, setDestination] = useState(null);
  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPlacesModal, setShowPlacesModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showHotelsModal, setShowHotelsModal] = useState(false);
  const [showRestaurantsModal, setShowRestaurantsModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [removingType, setRemovingType] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [cardTabs, setCardTabs] = useState({});
  const [cardMenus, setCardMenus] = useState({});

  const menuRefs = useRef({});

  // ── Fetch destination + all listings ──────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    const fetchAll = async () => {
      try {
        const destRes = await getDestination(slug);
        const dest = destRes.data.data;
        setDestination(dest);
        const id = dest._id;

        const [placesRes, hotelsRes, restaurantsRes, eventsRes] = await Promise.all([
          placesApi.getAll({ destinationId: id }),
          hotelsApi.getAll({ destinationId: id }),
          restaurantsApi.getAll({ destinationId: id }),
          getEvents({ destinationId: id }),
        ]);

        setPlaces(placesRes.data?.data ?? []);
        setHotels(hotelsRes.data?.data ?? []);
        setRestaurants(restaurantsRes.data?.data ?? []);
        setEvents(eventsRes.data?.data ?? []);
      } catch (err) {
        setError("Failed to load destination data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    const open = showPlacesModal || showEventsModal || showHotelsModal ||
      showRestaurantsModal || editingItem || removingItem || lightboxImage;
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [showPlacesModal, showEventsModal, showHotelsModal, showRestaurantsModal, editingItem, removingItem, lightboxImage]);

  // ── Click outside menus ────────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      const openId = Object.keys(cardMenus).find((id) => cardMenus[id]);
      if (openId && menuRefs.current[openId] && !menuRefs.current[openId].contains(e.target)) {
        setCardMenus({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cardMenus]);

  const destId = destination?._id;
  const displayName = destination?.name || slug?.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Destination";

  // ── Save handlers ──────────────────────────────────────────────────────────
  const handleSavePlace = async (formData) => {
    try {
      const fd = buildListingFormData(formData, destId);
      if (editingItem) {
        const res = await placesApi.update(editingItem._id, fd);
        setPlaces(places.map((p) => p._id === editingItem._id ? res.data.data : p));
      } else {
        const res = await placesApi.create(fd);
        setPlaces([...places, res.data.data]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save place.");
    }
    setEditingItem(null); setEditingType(null);
  };

  const handleSaveHotel = async (formData) => {
    try {
      const fd = buildListingFormData(formData, destId);
      if (editingItem) {
        const res = await hotelsApi.update(editingItem._id, fd);
        setHotels(hotels.map((h) => h._id === editingItem._id ? res.data.data : h));
      } else {
        const res = await hotelsApi.create(fd);
        setHotels([...hotels, res.data.data]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save hotel.");
    }
    setEditingItem(null); setEditingType(null);
  };

  const handleSaveRestaurant = async (formData) => {
    try {
      const fd = buildListingFormData(formData, destId);
      if (editingItem) {
        const res = await restaurantsApi.update(editingItem._id, fd);
        setRestaurants(restaurants.map((r) => r._id === editingItem._id ? res.data.data : r));
      } else {
        const res = await restaurantsApi.create(fd);
        setRestaurants([...restaurants, res.data.data]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save restaurant.");
    }
    setEditingItem(null); setEditingType(null);
  };

  const handleSaveEvent = async (formData) => {
    try {
      const fd = buildEventFormData(formData, destId);
      if (editingItem) {
        const res = await updateEvent(editingItem._id, fd);
        setEvents(events.map((e) => e._id === editingItem._id ? res.data.data : e));
      } else {
        const res = await createEvent(fd);
        setEvents([...events, res.data.data]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save event.");
    }
    setEditingItem(null); setEditingType(null);
  };

  // ── Delete handlers ────────────────────────────────────────────────────────
  const confirmRemove = async () => {
    if (!removingItem || !removingType) return;
    try {
      switch (removingType) {
        case "place":
          await placesApi.remove(removingItem._id);
          setPlaces(places.filter((p) => p._id !== removingItem._id));
          break;
        case "hotel":
          await hotelsApi.remove(removingItem._id);
          setHotels(hotels.filter((h) => h._id !== removingItem._id));
          break;
        case "restaurant":
          await restaurantsApi.remove(removingItem._id);
          setRestaurants(restaurants.filter((r) => r._id !== removingItem._id));
          break;
        case "event":
          await deleteEvent(removingItem._id);
          setEvents(events.filter((e) => e._id !== removingItem._id));
          break;
      }
    } catch (err) {
      alert("Failed to delete item.");
    }
    setRemovingItem(null); setRemovingType(null);
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────
  const handleTabChange = (itemId, tab) => setCardTabs((prev) => ({ ...prev, [itemId]: tab }));
  const handleMenuToggle = (e, itemId) => { e.stopPropagation(); setCardMenus((prev) => ({ ...prev, [itemId]: !prev[itemId] })); };
  const handleEdit = (item, type) => { setEditingItem(mapItemToEditData(item)); setEditingType(type); setCardMenus({}); };
  const handleRemoveClick = (item, type) => { setRemovingItem(item); setRemovingType(type); setCardMenus({}); };
  const closeEditModal = () => { setEditingItem(null); setEditingType(null); };
  const getEntityName = (type) => ({ place: "Place", hotel: "Hotel", restaurant: "Restaurant", event: "Event" }[type] || "Item");
  const getTabs = (type) => type === "hotel"
    ? ["overview", "about", "reviews", "contact", "photos", "book"]
    : ["overview", "about", "reviews", "contact", "photos"];

  // ── Card content renderer ──────────────────────────────────────────────────
  const renderCardContent = (item, type, activeTab) => {
    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.overviewTab}>
            <div className={styles.overviewImageWrapper} onClick={() => item.image && setLightboxImage(item.image)}>
              <img src={item.image || item.coverImage || "/assets/images/placeholder.jpg"} alt={item.name} className={styles.overviewImage} />
            </div>
            <p className={styles.overviewDescription}>{item.description || item.customOverview || item.briefDescription || "No description available"}</p>
          </div>
        );

      case "about": {
        const address = item.contact?.address || "Not specified";
        const coords = item.location?.coordinates
          ? `${item.location.coordinates[1]}, ${item.location.coordinates[0]}`
          : "Not specified";

        if (type === "event") {
          const formattedStartTime = item.startTime
            ? `${formatTime(item.startTime.from)} — ${formatTime(item.startTime.to)}`
            : "Not specified";
          const formattedEndTime = item.endTime
            ? `${formatTime(item.endTime.from)} — ${formatTime(item.endTime.to)}`
            : "Not specified";
          const startDateStr = item.startDate
            ? new Date(item.startDate).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "Not specified";
          const endDateStr = item.endDate
            ? new Date(item.endDate).toLocaleDateString("en-US", { dateStyle: "medium" })
            : "Not specified";

          return (
            <div className={styles.aboutTabContent}>
              {[
                { icon: "location_on", label: "Coordinates", value: coords },
                { icon: "pin_drop", label: "Address", value: address },
                { icon: "attach_money", label: "Ticket Cost", value: item.startingFromPrice != null ? `$${item.startingFromPrice}` : "Not specified" },
                { icon: "schedule", label: "Duration", value: item.durationText || "Not specified" },
                { icon: "calendar_today", label: "Event Dates", value: `${startDateStr} — ${endDateStr}` },
                { icon: "alarm", label: "Start / End Times", value: `Start: ${formattedStartTime} | End: ${formattedEndTime}` },
              ].map(({ icon, label, value }) => (
                <div className={styles.aboutItem} key={label}>
                  <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>{icon}</span>
                  <div>
                    <span className={styles.aboutLabel}>{label}</span>
                    <p className={styles.aboutValue}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        }

        // place | restaurant | hotel
        const formatOperatingHours = () => {
          if (!item.operatingHours) return "Not specified";
          const { start, end } = item.operatingHours;
          if (!start && !end) return "Not specified";
          return `${formatTime(start)} — ${formatTime(end)}`;
        };

        return (
          <div className={styles.aboutTabContent}>
            <div className={styles.aboutDetailsList} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { icon: "location_on", label: "Coordinates", value: coords },
                { icon: "pin_drop", label: "Address", value: address },
                { icon: "attach_money", label: "Budget", value: item.budget || (item.startingFromPrice != null ? `$${item.startingFromPrice}` : "Not specified") },
                { icon: "schedule", label: "Operating Hours", value: formatOperatingHours() },
              ].map(({ icon, label, value }) => (
                <div className={styles.aboutItem} key={label}>
                  <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>{icon}</span>
                  <div>
                    <span className={styles.aboutLabel}>{label}</span>
                    <p className={styles.aboutValue}>{value}</p>
                  </div>
                </div>
              ))}

              <div className={styles.aboutItem}>
                <span className="material-symbols-outlined" style={{ color: "#6b7280" }}>calendar_today</span>
                <div>
                  <span className={styles.aboutLabel}>Working Days</span>
                  <div className={styles.dayPills} style={{ display: "flex", gap: "0.25rem", marginTop: "0.35rem" }}>
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <span
                        key={day}
                        className={`${styles.dayPill} ${(item.workingDays || []).includes(day) ? styles.dayPillActive : ""}`}
                        style={{
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          backgroundColor: (item.workingDays || []).includes(day) ? "var(--color-accent, var(--color-accent))" : "#f3f4f6",
                          color: (item.workingDays || []).includes(day) ? "#fff" : "#9ca3af"
                        }}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "reviews":
        return (
          <div className={styles.reviewsTabContent}>
            <div className={styles.reviewsSummary}>
              <div className={styles.scoreBox}>
                <span className={styles.scoreValue}>{PLACEHOLDER_STATS.rating}</span>
                <span className={styles.scoreLabel}>{PLACEHOLDER_STATS.label}</span>
                <span className={styles.scoreReviews}>{PLACEHOLDER_STATS.totalReviews} reviews</span>
              </div>
            </div>
            <div className={styles.reviewsList}>
              {PLACEHOLDER_REVIEWS.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerInfo}>
                      <div className={styles.reviewerAvatar}>{review.name.charAt(0)}</div>
                      <div>
                        <span className={styles.reviewerName}>{review.name}</span>
                        <span className={styles.reviewDate}>{review.date}</span>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="material-symbols-outlined" style={{ color: i < review.rating ? "#f59e0b" : "#e5e7eb", fontSize: "1rem" }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "contact": {
        // API returns item.contact as an object: { phone, whatsapp, email, address, instagramUrl, twitterUrl }
        const contactObj = item.contact || {};
        const contactEntries = [
          { key: "phone", value: contactObj.phone, type: "phone" },
          { key: "whatsapp", value: contactObj.whatsapp, type: "whatsapp" },
          { key: "email", value: contactObj.email, type: "url" },
          { key: "address", value: contactObj.address, type: "url" },
          { key: "instagramUrl", value: contactObj.instagramUrl, type: "instagram" },
          { key: "twitterUrl", value: contactObj.twitterUrl, type: "x" },
        ].filter((c) => c.value);

        if (!contactEntries.length) return (
          <div className={styles.emptyContent}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#9ca3af" }}>contact_phone</span>
            <p>No contact information available</p>
          </div>
        );
        return (
          <div className={styles.contactListContent}>
            {contactEntries.map(({ key, value, type }) => (
              <div key={key} className={styles.contactItemContent}>
                <div className={styles.contactIconContent} data-type={type}>
                  <span className="material-symbols-outlined">{getContactIcon(type)}</span>
                </div>
                <span className={styles.contactValueContent}>{value}</span>
              </div>
            ))}
          </div>
        );
      }

      case "photos":
        const photos = item.photos || item.images || [];
        if (!photos.length) return (
          <div className={styles.emptyContent}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#9ca3af" }}>photo_library</span>
            <p>No photos yet</p>
          </div>
        );
        return (
          <div className={styles.photoGridContent}>
            {photos.map((photo, i) => (
              <img key={i} src={photo} alt={`Photo ${i + 1}`} className={styles.photoItemContent} onClick={() => setLightboxImage(photo)} />
            ))}
          </div>
        );

      case "book":
        if (!item.bookingLink && !item.bookingUrl) return (
          <div className={styles.emptyContent}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#9ca3af" }}>hotel</span>
            <p>No booking option currently</p>
          </div>
        );
        const bookUrl = item.bookingLink || item.bookingUrl;
        return (
          <div className={styles.bookTabContent}>
            <p className={styles.bookPrompt}>Ready to book your stay at {item.name}?</p>
            <a href={bookUrl.startsWith("http") ? bookUrl : `https://${bookUrl}`} target="_blank" rel="noopener noreferrer" className={styles.bookButton}>Book Now</a>
          </div>
        );

      default: return null;
    }
  };

  // ── Card renderer ──────────────────────────────────────────────────────────
  const renderCard = (item, type) => {
    const tabs = getTabs(type);
    const activeTab = cardTabs[item._id] || "overview";
    const isMenuOpen = cardMenus[item._id] || false;

    return (
      <div key={item._id} className={styles.entityCard}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardName}>{item.name}</h3>
          <div className={styles.menuWrapper} ref={(el) => (menuRefs.current[item._id] = el)}>
            <button className={styles.menuBtn} onClick={(e) => handleMenuToggle(e, item._id)}>
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {isMenuOpen && (
              <div className={styles.dropdown}>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(item, type); }}>
                  <span className="material-symbols-outlined">edit</span> Edit
                </button>
                <button className={styles.dropdownDanger} onClick={(e) => { e.stopPropagation(); handleRemoveClick(item, type); }}>
                  <span className="material-symbols-outlined">delete</span> Remove
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.cardTabs}>
          {tabs.map((tab) => (
            <button key={tab} className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`} onClick={() => handleTabChange(item._id, tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.cardContent}>{renderCardContent(item, type, activeTab)}</div>
      </div>
    );
  };

  const renderCards = (items, type) => {
    if (!items?.length) return null;
    return <div className={styles.cardGrid}>{items.map((item) => renderCard(item, type))}</div>;
  };

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading...</div></div>;
  if (error) return <div className={styles.page}><div className={styles.loading} style={{ color: "#dc2626" }}>{error}</div></div>;

  const stats = [
    { label: "Places", count: places.length },
    { label: "Hotels", count: hotels.length },
    { label: "Restaurants", count: restaurants.length },
    { label: "Events", count: events.length },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{displayName}</h1>
          <p className={styles.subtitle}>Manage places, hotels, restaurants, and events for this destination.</p>
        </div>
      </div>

      <div className={styles.statsRow}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statItem}>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statVal}>{stat.count}</p>
          </div>
        ))}
      </div>

      <div className={styles.contentArea}>
        {/* Places */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Places</h2>
            <button className={styles.addSectionBtn} onClick={() => setShowPlacesModal(true)}>
              <span className="material-symbols-outlined">add</span> Add Place
            </button>
          </div>
          {!places.length ? (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#9ca3af" }}>place</span>
              <p>No places added yet</p>
              <button className={styles.addBtnSmall} onClick={() => setShowPlacesModal(true)}>Add First Place</button>
            </div>
          ) : renderCards(places, "place")}
        </section>

        {/* Hotels */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Hotels</h2>
            <button className={styles.addSectionBtn} onClick={() => setShowHotelsModal(true)}>
              <span className="material-symbols-outlined">add</span> Add Hotel
            </button>
          </div>
          {!hotels.length ? (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#9ca3af" }}>hotel</span>
              <p>No hotels added yet</p>
              <button className={styles.addBtnSmall} onClick={() => setShowHotelsModal(true)}>Add First Hotel</button>
            </div>
          ) : renderCards(hotels, "hotel")}
        </section>

        {/* Restaurants */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Restaurants</h2>
            <button className={styles.addSectionBtn} onClick={() => setShowRestaurantsModal(true)}>
              <span className="material-symbols-outlined">add</span> Add Restaurant
            </button>
          </div>
          {!restaurants.length ? (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#9ca3af" }}>restaurant</span>
              <p>No restaurants added yet</p>
              <button className={styles.addBtnSmall} onClick={() => setShowRestaurantsModal(true)}>Add First Restaurant</button>
            </div>
          ) : renderCards(restaurants, "restaurant")}
        </section>

        {/* Events */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Events</h2>
            <button className={styles.addSectionBtn} onClick={() => setShowEventsModal(true)}>
              <span className="material-symbols-outlined">add</span> Add Event
            </button>
          </div>
          {!events.length ? (
            <div className={styles.emptyState}>
              <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#9ca3af" }}>event</span>
              <p>No events added yet</p>
              <button className={styles.addBtnSmall} onClick={() => setShowEventsModal(true)}>Add First Event</button>
            </div>
          ) : renderCards(events, "event")}
        </section>
      </div>

      {/* Add Modals */}
      <PlacesModal isOpen={showPlacesModal} onClose={() => setShowPlacesModal(false)} onSave={handleSavePlace} destinationName={displayName} />
      <HotelsModal isOpen={showHotelsModal} onClose={() => setShowHotelsModal(false)} onSave={handleSaveHotel} destinationName={displayName} />
      <RestaurantsModal isOpen={showRestaurantsModal} onClose={() => setShowRestaurantsModal(false)} onSave={handleSaveRestaurant} destinationName={displayName} />
      <EventsModal isOpen={showEventsModal} onClose={() => setShowEventsModal(false)} onSave={handleSaveEvent} destinationName={displayName} />

      {/* Edit Modals */}
      {editingItem && editingType === "place" && <PlacesModal isOpen onClose={closeEditModal} onSave={handleSavePlace} destinationName={displayName} editData={editingItem} />}
      {editingItem && editingType === "hotel" && <HotelsModal isOpen onClose={closeEditModal} onSave={handleSaveHotel} destinationName={displayName} editData={editingItem} />}
      {editingItem && editingType === "restaurant" && <RestaurantsModal isOpen onClose={closeEditModal} onSave={handleSaveRestaurant} destinationName={displayName} editData={editingItem} />}
      {editingItem && editingType === "event" && <EventsModal isOpen onClose={closeEditModal} onSave={handleSaveEvent} destinationName={displayName} editData={editingItem} />}

      {/* Remove Confirmation */}
      {removingItem && (
        <div className={styles.confirmOverlay} onClick={() => { setRemovingItem(null); setRemovingType(null); }}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#dc2626" }}>delete</span>
            <h3 className={styles.confirmTitle}>Remove {removingItem.name}?</h3>
            <p className={styles.confirmBody}>This action cannot be undone. The {getEntityName(removingType).toLowerCase()} will be permanently removed.</p>
            <div className={styles.confirmActions}>
              <button className={styles.cancelBtn} onClick={() => { setRemovingItem(null); setRemovingType(null); }}>Cancel</button>
              <button className={styles.removeBtn} onClick={confirmRemove}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div className={styles.lightbox} onClick={() => setLightboxImage(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxImage(null)}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <img src={lightboxImage} alt="Full screen" className={styles.lightboxImage} />
        </div>
      )}
    </div>
  );
}

export default DestinationDetail;