import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SaveList.module.css";
import AdminSidebar from "@/pages/admin/AdminSidebar";
import { getSavedItems, removeSavedItem } from "@/api/saved";
import { getDestinations } from "@/api/destination";

// ── Stars ─────────────────────────────────────────────────────────
const Stars = ({ rating = 0 }) => (
  <span className={styles.stars}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? "#1B56FD" : "#ddd", fontSize: 12 }}>★</span>
    ))}
  </span>
);

// ── Remove Button ─────────────────────────────────────────────────
const RemoveButton = ({ savedId, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const handleRemove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await removeSavedItem(savedId);
      onRemove(savedId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={handleRemove} disabled={loading} className={styles.removeBtn} title="Remove from saved">
      {loading ? "..." : "✕"}
    </button>
  );
};

// ── Helper: extract a display string from location field ──────────
// Destination & Place use GeoJSON { type, coordinates } — not renderable.
// Fall back to other address-like fields if present.
function getLocationLabel(entity) {
  if (!entity) return "";
  if (typeof entity.location === "string") return entity.location;
  return entity.city || entity.address || entity.region || "";
}

// ── Helper: pick the best image field ────────────────────────────
function getImage(entity) {
  return entity.image || entity.coverImage || entity.img || "";
}

const SECTION_ANCHOR = {
  place: "places-to-visit",
  restaurant: "food-and-dining",
  hotel: "hotels",
  event: "events",
};

// ── PAGE ──────────────────────────────────────────────────────────
export default function SavedLists() {
  const navigate = useNavigate();
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [saved, setSaved] = useState({
    destination: [],
    place: [],
    restaurant: [],
    hotel: [],
    event: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load ─────────────────────────────────────────────────────
  const loadSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [savedRes, destsRes] = await Promise.all([
        getSavedItems(),
        getDestinations(),
      ]);

      const items = savedRes.data?.data ?? [];
      const allDests = destsRes.data?.data ?? [];

      // Build _id → slug lookup
      const destSlugMap = {};
      for (const d of allDests) {
        destSlugMap[String(d._id)] = d.slug;
      }

      const grouped = { destination: [], place: [], restaurant: [], hotel: [], event: [] };
      for (const item of items) {
        if (item.entity && grouped[item.entityType] !== undefined) {
          const entry = { savedId: item._id, entity: item.entity };
          if (item.entityType !== "destination") {
            const destId = String(item.entity.destinationId);
            entry.destinationSlug = destSlugMap[destId] ?? null;
          }
          grouped[item.entityType].push(entry);
        }
      }
      setSaved(grouped);
    } catch (err) {
      setError("Failed to load your saved items. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  // ── Remove from local state ───────────────────────────────────
  const handleRemove = useCallback((savedId) => {
    setSaved((prev) => {
      const next = {};
      for (const type of Object.keys(prev)) {
        next[type] = prev[type].filter((i) => i.savedId !== savedId);
      }
      return next;
    });
  }, []);

  // ── Navigate helpers ──────────────────────────────────────────
  const goToDestination = useCallback((slug) => {
    if (slug) navigate(`/destinations/${slug}`);
  }, [navigate]);

  const goToSection = useCallback((slug, entityType) => {
    if (!slug) return;
    const anchor = SECTION_ANCHOR[entityType];
    navigate(`/destinations/${slug}`, { state: { scrollTo: anchor } });
  }, [navigate]);
  const events = saved.event;
  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setActiveEventIndex((prev) => (prev + 1) % events.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [events.length]);

  useEffect(() => {
    if (activeEventIndex >= events.length && events.length > 0) {
      setActiveEventIndex(events.length - 1);
    }
  }, [events.length, activeEventIndex]);

  const currentEvent = events[activeEventIndex]?.entity ?? null;
  const destItems = saved.destination;

  // ── States ────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className={styles.main}>
        <AdminSidebar type="user" />
        <div className={styles.stateContainer}>
          <p className={styles.stateMsg}>Loading your saved items…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <AdminSidebar type="user" />
        <div className={styles.stateContainer}>
          <p className={styles.stateMsg}>{error}</p>
          <button className={styles.retryBtn} onClick={loadSaved}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <AdminSidebar type="user" />

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Save Lists</h1>
        <p className={styles.pageSubtitle}>
          A curated collection of destinations, experiences, and luxury accommodations
          <br />flagged for upcoming editorial features.
        </p>
      </div>

      {/* ── Saved Destinations / Places ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Saved Destinations</h2>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        {destItems.length === 0 ? (
          <p className={styles.emptyMsg}>No saved destinations yet.</p>
        ) : (
          <div className={styles.destGrid}>
            {destItems.slice(0, 6).map(({ savedId, entity: d }) => (
              <div key={savedId} className={styles.destCard} onClick={() => goToDestination(d.slug)} style={{ cursor: "pointer" }}>
                <div className={styles.destImgWrap}>
                  <img src={getImage(d)} alt={d.name} className={styles.destImg} />
                  <RemoveButton savedId={savedId} onRemove={handleRemove} />
                </div>
                <div className={styles.destBody}>
                  <h3 className={styles.destTitle}>{d.name}</h3>
                  <p className={styles.destDesc}>{d.description || d.tagline || d.customOverview}</p>
                  <div className={styles.destFooter}>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingLabel}>Rating</span>
                      <Stars rating={d.rating} />
                    </div>
                    {getLocationLabel(d) && (
                      <span className={styles.destCount}>{getLocationLabel(d)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Saved Places ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Saved Places</h2>
          <button className={styles.viewAllBtn}>View All</button>
        </div>
        {saved.place.length === 0 ? (
          <p className={styles.emptyMsg}>No saved places yet.</p>
        ) : (
          <div className={styles.destGrid}>
            {saved.place.slice(0, 6).map(({ savedId, entity: p, destinationSlug }) => (
              <div key={savedId} className={styles.destCard} onClick={() => goToSection(destinationSlug, "place")} style={{ cursor: "pointer" }}>
                <div className={styles.destImgWrap}>
                  <img src={getImage(p)} alt={p.name} className={styles.destImg} />
                  <RemoveButton savedId={savedId} onRemove={handleRemove} />
                </div>
                <div className={styles.destBody}>
                  <h3 className={styles.destTitle}>{p.name}</h3>
                  <p className={styles.destDesc}>{p.customOverview || p.description}</p>
                  <div className={styles.destFooter}>
                    <div className={styles.ratingRow}>
                      <span className={styles.ratingLabel}>Rating</span>
                      <Stars rating={p.rating} />
                    </div>
                    {p.budget && <span className={styles.destCount}>{p.budget}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Restaurants & Hotels ── */}
      <div className={styles.twoColSection}>
        <section>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Restaurants</h2>
          {saved.restaurant.length === 0 ? (
            <p className={styles.emptyMsg}>No saved restaurants yet.</p>
          ) : (
            <div className={styles.listCards}>
              {saved.restaurant.map(({ savedId, entity: r, destinationSlug }) => (
                <div key={savedId} className={styles.listCard} onClick={() => goToSection(destinationSlug, "restaurant")} style={{ cursor: "pointer" }}>
                  <div className={styles.listCardImgWrap}>
                    <img src={getImage(r)} alt={r.name} className={styles.listCardImg} />
                    <RemoveButton savedId={savedId} onRemove={handleRemove} />
                  </div>
                  <div className={styles.listCardBody}>
                    <h3 className={styles.listCardTitle}>{r.name}</h3>
                    <p className={styles.listCardDesc}>{r.description || r.customOverview}</p>
                    <div className={styles.listCardFooter}>
                      <Stars rating={r.rating} />
                      {getLocationLabel(r) && (
                        <span className={styles.listCardLocation}>{getLocationLabel(r)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className={styles.sectionTitle} style={{ marginBottom: 16 }}>Hotels</h2>
          {saved.hotel.length === 0 ? (
            <p className={styles.emptyMsg}>No saved hotels yet.</p>
          ) : (
            <div className={styles.listCards}>
              {saved.hotel.map(({ savedId, entity: h, destinationSlug }) => (
                <div key={savedId} className={styles.listCard} onClick={() => goToSection(destinationSlug, "hotel")} style={{ cursor: "pointer" }}>
                  <div className={styles.listCardImgWrap}>
                    <img src={getImage(h)} alt={h.name} className={styles.listCardImg} />
                    <RemoveButton savedId={savedId} onRemove={handleRemove} />
                  </div>
                  <div className={styles.listCardBody}>
                    <h3 className={styles.listCardTitle}>{h.name}</h3>
                    <p className={styles.listCardDesc}>{h.description || h.customOverview}</p>
                    <div className={styles.listCardFooter}>
                      <Stars rating={h.rating} />
                      {getLocationLabel(h) && (
                        <span className={styles.listCardLocation}>{getLocationLabel(h)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Events (Carousel) ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Events</h2>
          <button className={styles.viewAllBtn} style={{ color: "#1b56fd" }}>Full Calendar</button>
        </div>
        {events.length === 0 ? (
          <p className={styles.emptyMsg}>No saved events yet.</p>
        ) : (
          <div className={styles.eventsLayout}>
            <div className={styles.eventFeatured} onClick={() => goToSection(events[activeEventIndex]?.destinationSlug, "event")} style={{ cursor: "pointer" }}>
              <img src={getImage(currentEvent)} alt={currentEvent.name} className={styles.eventFeaturedImg} />
              <div className={styles.eventFeaturedOverlay}>
                <h3 className={styles.eventFeaturedTitle}>{currentEvent.name}</h3>
                <p className={styles.eventFeaturedDesc}>{currentEvent.description}</p>
                <div className={styles.eventTags}>
                  {currentEvent.category && <span className={styles.eventTag}>{currentEvent.category}</span>}
                  {getLocationLabel(currentEvent) && <span className={styles.eventTag}>{getLocationLabel(currentEvent)}</span>}
                </div>
              </div>
              <RemoveButton savedId={events[activeEventIndex].savedId} onRemove={handleRemove} />
              <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "8px", zIndex: 10 }}>
                {events.map((_, idx) => (
                  <span key={idx} onClick={() => setActiveEventIndex(idx)} style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    background: idx === activeEventIndex ? "#fff" : "rgba(255,255,255,0.4)",
                    cursor: "pointer", transition: "background 0.3s",
                  }} />
                ))}
              </div>
            </div>

            <div className={styles.eventSideCard}>
              <div className={styles.eventSideIcon}>🏛️</div>
              <h3 className={styles.eventSideTitle}>{currentEvent.name}</h3>
              <p className={styles.eventSideDesc}>{currentEvent.description}</p>
              <div className={styles.eventSideMeta}>
                {currentEvent.date && <span className={styles.eventSideDate}>{currentEvent.date}</span>}
                {currentEvent.date && getLocationLabel(currentEvent) && <span className={styles.eventSideDot}>•</span>}
                {getLocationLabel(currentEvent) && <span className={styles.eventSideLocation}>{getLocationLabel(currentEvent)}</span>}
              </div>
              <button className={styles.eventDetailsBtn} onClick={() => goToSection(events[activeEventIndex]?.destinationSlug, "event")}>DETAILS</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}