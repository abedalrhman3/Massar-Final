import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import CheckInModal from "./CheckInModal";
import LocationReviews from "./LocationReviews";
import styles from "./Map.module.css";
import { getLocations } from "@/api/locations";
import { getQuests, joinQuest } from "@/api/quests";
import { useAuth } from "@/context/AuthContext";
import { BASE_URL } from "@/api/client";
import { useNavigate, useLocation } from "react-router-dom";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Handles map click for manual location
const ManualLocationPicker = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
};

// Handles map click to clear route coordinates
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click() {
      onMapClick();
    },
  });
  return null;
};

// A helper component to center the map when initial coordinates are passed
const MapCenterSetter = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.lat && coords.lng) {
      map.setView([coords.lat, coords.lng], 13);
    }
  }, [coords, map]);
  return null;
};
const AutoLocationTracker = ({ onFound, isCelebrating, userAvatarUrl }) => {
  const [position, setPosition] = useState(null);
  const navigate = useNavigate();
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      onFound(e.latlng);
      if (!position) {
        try {
          map.flyTo(e.latlng, 14);
        } catch (_) { }
      }
    },
    locationerror() { },
  });

  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
    return () => map.stopLocate();
  }, [map]);

  if (!position) return null;

  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  const avatarSrc = userAvatarUrl ? `${BASE_URL}${userAvatarUrl}` : defaultAvatar;

  const avatarIcon = new L.divIcon({
    html: `<img src="${avatarSrc}" class="user-avatar-marker ${isCelebrating ? "celebrate-animation" : ""
      }" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--color-accent); background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.3); object-fit: cover;" />`,
    className: "custom-avatar-container",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  return (
    <>
      <Marker position={position} icon={avatarIcon}>
        <Popup>📡 موقعك الفعلي (GPS)</Popup>
      </Marker>
      <Circle
        center={position}
        radius={500}
        pathOptions={{
          color: "var(--color-accent)",
          fillColor: "var(--color-accent)",
          fillOpacity: 0.08,
          weight: 1,
          dashArray: "6",
        }}
      />
    </>
  );
};

// ... (Keep all your existing imports, icon fixes, and helper components exactly the same)

const Map = () => {
  const locationState = useLocation();
  const initialCoords = locationState.state; // { lat, lng, name }

  const [locations, setLocations] = useState([]);
  const [quests, setQuests] = useState([]);
  const [budget, setBudget] = useState("");
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeReviewsLocation, setActiveReviewsLocation] = useState(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualPos, setManualPos] = useState(null);
  const [autoPos, setAutoPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [joiningQuestId, setJoiningQuestId] = useState(null);
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate(); // Assured this is active

  const drawRoute = async (destLat, destLng) => {
    if (!userPosition) {
      alert(i18n.language === "ar" ? "يرجى تحديد موقعك أولاً" : "Please set your location first");
      return;
    }
    const userLat = userPosition.lat;
    const userLng = userPosition.lng;

    const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRouteCoords(coords);
      } else {
        setRouteCoords([[userLat, userLng], [destLat, destLng]]);
      }
    } catch (error) {
      console.error("Error drawing route:", error);
      setRouteCoords([[userLat, userLng], [destLat, destLng]]);
    }
  };

  const handleJoinQuest = async (questId) => {
    setJoiningQuestId(questId);
    try {
      const res = await joinQuest(questId);
      if (res.data.success) {
        alert(i18n.language === "ar" ? "تم الانضمام للمسار بنجاح! تم فتح المواقع المرتبطة به." : "Successfully joined the quest! Linked locations are unlocked.");
        
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        // Re-fetch locations to show/hide quest locations
        const params = budget && budget !== "All" ? { budgetCategory: budget } : {};
        getLocations(params)
          .then((res) => setLocations(Array.isArray(res.data) ? res.data : []))
          .catch(() => setLocations([]));
      }
    } catch (error) {
      console.error("Error joining quest", error);
      alert(i18n.language === "ar" ? "فشل الانضمام للمسار" : "Failed to join quest");
    } finally {
      setJoiningQuestId(null);
    }
  };

  const userPosition = manualMode ? manualPos : autoPos;

  const triggerCelebration = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 3000);
  };

  useEffect(() => {
    const params = budget && budget !== "All" ? { budgetCategory: budget } : {};
    getLocations(params)
      .then((res) => setLocations(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLocations([]));

    getQuests()
      .then((res) => setQuests(res.data?.data ?? []))
      .catch(() => setQuests([]));
  }, [budget]);

  const createQuestIcon = (url) =>
    new L.Icon({
      iconUrl: `${BASE_URL}${url}`,
      iconSize: [40, 40],
      className: "quest-map-icon",
    });

  const manualIcon = new L.divIcon({
    html: `<div style="background:var(--color-accent);width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const JORDAN_BOUNDS = [
    [29.1, 34.9],
    [33.4, 39.3],
  ];

  return (
    // FIXED: Ensured the main wrapper explicitly controls the full screen layout
    <div className={styles.container} style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", justifyContent: "flex-start", alignItems: "stretch" }}>

      {/* Controls Bar */}
      <div className={styles.controlsBar} style={{ zIndex: 10 }}>
        <div className={styles.leftContainer}>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={styles.selectField}
          >
            <option value="All">{i18n.language === "ar" ? "جميع الميزانيات" : "All Budgets"}</option>
            <option value="Low">{i18n.language === "ar" ? "منخفضة (Low)" : "Low Budget"}</option>
            <option value="Medium">{i18n.language === "ar" ? "متوسطة (Medium)" : "Medium Budget"}</option>
            <option value="High">{i18n.language === "ar" ? "عالية (High)" : "High Budget"}</option>
          </select>

          <button
            onClick={() => {
              setManualMode(!manualMode);
              setManualPos(null);
            }}
            className={`${styles.btn} ${manualMode ? styles.btnActive : ""}`}
          >
            {manualMode
              ? "📍 " + (i18n.language === "ar" ? "انقر لتحديد موقعك" : "Click to set location")
              : "🖱️ " + (i18n.language === "ar" ? "تحديد الموقع يدوياً" : "Set Location Manually")}
          </button>

          {manualMode && (
            <span className={styles.statusIndicator}>
              {manualPos
                ? `✅ ${i18n.language === "ar" ? "تم تحديد الموقع" : "Location set"}`
                : `⬇️ ${i18n.language === "ar" ? "انقر على خريطتك الفعلية" : "Click your real position on map"}`}
            </span>
          )}

        </div>

        {/* Home Button inside the controls bar to keep it safely on top of Leaflet layers */}
        <button
          className={styles.hBtn}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", zIndex: 20, marginLeft: "auto" }}
        >
          🏠 Home
        </button>
      </div>

      {/* FIXED: Added explicit flex growth and height rules to the Map wrapper */}
      <div style={{ flex: 1, position: "relative", zIndex: 1, borderRadius: "25px", overflow: "hidden", border: "1px solid var(--color-border, #E8E8E8)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", height: "calc(100vh - 80px)" }}>
        <MapContainer
          center={[31.2, 36.5]}
          zoom={8}
          minZoom={7}
          maxBounds={JORDAN_BOUNDS}
          maxBoundsViscosity={0.8}
          style={{ height: "100%", width: "100%" }} // Changed to 100% of parent wrapper
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {initialCoords && <MapCenterSetter coords={initialCoords} />}

          {initialCoords && (
            <Marker position={[initialCoords.lat, initialCoords.lng]}>
              <Popup>
                <div style={{ padding: "5px", fontFamily: "var(--font-ui), sans-serif" }}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#000", margin: "0 0 5px 0" }}>
                    📍 {initialCoords.name || "Destination"}
                  </h3>
                </div>
              </Popup>
            </Marker>
          )}

          {!manualMode && (
            <AutoLocationTracker
              onFound={setAutoPos}
              isCelebrating={isCelebrating}
              userAvatarUrl={user?.avatar_url}
            />
          )}

          {manualMode && <ManualLocationPicker onPick={(pos) => setManualPos(pos)} />}

          <MapClickHandler onMapClick={() => setRouteCoords([])} />

          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{
                color: "var(--color-accent)",
                weight: 5,
                opacity: 0.8,
                dashArray: "5, 10"
              }}
            />
          )}

          {manualMode && manualPos && (
            <>
              <Marker position={manualPos} icon={manualIcon}>
                <Popup>
                  📍 {i18n.language === "ar" ? "موقعك المحدد يدوياً" : "Your manually set location"}
                </Popup>
              </Marker>
              <Circle
                center={manualPos}
                radius={500}
                pathOptions={{
                  color: "var(--color-accent)",
                  fillFillColor: "var(--color-accent)",
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: "6",
                }}
              />
            </>
          )}

          {locations.map((loc) => (
            <Marker key={loc._id} position={[loc.coordinates.lat, loc.coordinates.lng]}>
              <Popup>
                <div style={{ padding: "5px", fontFamily: "var(--font-ui), sans-serif" }}>
                  <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#000", margin: "0 0 5px 0" }}>
                    {i18n.language === "ar" ? loc.name : loc.name_en}
                  </h3>
                  <p style={{ fontSize: "1.2rem", color: "#666", margin: "0 0 10px 0" }}>
                    {i18n.language === "ar" ? loc.description : loc.description_en}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexDirection: "column", marginTop: "8px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => setActiveLocation(loc)}
                        style={{ flex: 1, background: "var(--color-accent)", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "1.1rem" }}
                      >
                        {t("check_in")}
                      </button>
                      <button
                        onClick={() => setActiveReviewsLocation(loc)}
                        style={{ flex: 1, background: "#2E7D32", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "1.1rem" }}
                      >
                        {i18n.language === "ar" ? "الآراء" : "Reviews"}
                      </button>
                    </div>
                    {userPosition && (
                      <button
                        onClick={() => drawRoute(loc.coordinates.lat, loc.coordinates.lng)}
                        style={{ background: "#4F46E5", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "1.1rem" }}
                      >
                        🗺️ {i18n.language === "ar" ? "ارسم المسار" : "Draw Route"}
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {quests.map((quest) => {
            if (!quest.start_coordinates?.lat) return null;
            return (
              <Marker
                key={quest._id}
                position={[quest.start_coordinates.lat, quest.start_coordinates.lng]}
                icon={quest.icon_url ? createQuestIcon(quest.icon_url) : new L.Icon.Default()}
              >
                <Popup>
                  <div style={{ padding: "5px", fontFamily: "var(--font-ui), sans-serif" }}>
                    <h3 style={{ color: "#D97706", fontWeight: "800", fontSize: "1.4rem", margin: "0 0 5px 0" }}>
                      ✨ {i18n.language === "ar" ? quest.title : quest.title_en}
                    </h3>
                    <p style={{ margin: "3px 0", fontSize: "1.2rem" }}>
                      <strong>Bonus XP:</strong> {quest.bonus_xp}
                    </p>
                    <p style={{ margin: "3px 0", fontSize: "1.2rem" }}>
                      <strong>Title:</strong> {quest.title_reward}
                    </p>
                    {user && (
                      <button
                        onClick={() => handleJoinQuest(quest._id)}
                        disabled={joiningQuestId === quest._id}
                        style={{
                          background: user.joined_quests?.map(String).includes(String(quest._id)) ? "#2E7D32" : "var(--color-accent)",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontWeight: "700",
                          cursor: "pointer",
                          fontSize: "1.1rem",
                          width: "100%",
                          marginTop: "8px"
                        }}
                      >
                        {user.joined_quests?.map(String).includes(String(quest._id))
                          ? (i18n.language === "ar" ? "مشارك فيه ✅" : "Joined ✅")
                          : (i18n.language === "ar" ? "انضمام للمسار" : "Join Quest")}
                      </button>
                    )}
                    {userPosition && (
                      <button
                        onClick={() => drawRoute(quest.start_coordinates.lat, quest.start_coordinates.lng)}
                        style={{ background: "#4F46E5", color: "white", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "1.1rem", width: "100%", marginTop: "8px" }}
                      >
                        🗺️ {i18n.language === "ar" ? "ارسم المسار" : "Draw Route"}
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {activeLocation && (
        <CheckInModal
          location={activeLocation}
          currentUser={user}
          manualPosition={userPosition}
          onClose={() => setActiveLocation(null)}
          onCheckInSuccess={() => {
            setActiveLocation(null);
            triggerCelebration();
          }}
        />
      )}

      {activeReviewsLocation && (
        <LocationReviews
          location={activeReviewsLocation}
          onClose={() => setActiveReviewsLocation(null)}
        />
      )}
    </div>
  );
};

export default Map;