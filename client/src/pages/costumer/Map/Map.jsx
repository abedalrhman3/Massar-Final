import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import L from "leaflet";
import CheckInModal from "./CheckInModal";
import LocationReviews from "./LocationReviews";
import styles from "./Map.module.css";
import { getLocations } from "../../../api/locations";
import { getQuests } from "../../../api/quests";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URL } from "../../../api/client";

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

// Auto GPS tracker
const AutoLocationTracker = ({ onFound, isCelebrating, userAvatarUrl }) => {
  const [position, setPosition] = useState(null);
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
      }" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #1B56FD; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.3); object-fit: cover;" />`,
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
          color: "#1B56FD",
          fillColor: "#1B56FD",
          fillOpacity: 0.08,
          weight: 1,
          dashArray: "6",
        }}
      />
    </>
  );
};

const Map = () => {
  const [locations, setLocations] = useState([]);
  const [quests, setQuests] = useState([]);
  const [budget, setBudget] = useState("");
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeReviewsLocation, setActiveReviewsLocation] = useState(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualPos, setManualPos] = useState(null);
  const [autoPos, setAutoPos] = useState(null);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const userPosition = manualMode ? manualPos : autoPos;

  const triggerCelebration = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 3000);
  };

  useEffect(() => {
    // getLocations returns a plain array (res.data = Location[]) per your api comment
    const params = budget && budget !== "All" ? { budgetCategory: budget } : {};
    getLocations(params)
      .then((res) => setLocations(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLocations([]));

    // getQuests returns { success, data: Quest[] }
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
    html: `<div style="background:#1B56FD;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const JORDAN_BOUNDS = [
    [29.1, 34.9],
    [33.4, 39.3],
  ];

  return (
    <div className={styles.container} style={{ flexDirection: "column", minHeight: "85vh", justifyContent: "flex-start", alignItems: "stretch", padding: "20px 40px" }}>
      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className={styles.selectField}
        >
          <option value="All">
            {i18n.language === "ar" ? "جميع الميزانيات" : "All Budgets"}
          </option>
          <option value="Low">
            {i18n.language === "ar" ? "منخفضة (Low)" : "Low Budget"}
          </option>
          <option value="Medium">
            {i18n.language === "ar" ? "متوسطة (Medium)" : "Medium Budget"}
          </option>
          <option value="High">
            {i18n.language === "ar" ? "عالية (High)" : "High Budget"}
          </option>
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

      <div style={{ position: "relative", zIndex: 1, borderRadius: "25px", overflow: "hidden", border: "1px solid var(--color-border, #E8E8E8)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        <MapContainer
          center={[31.2, 36.5]}
          zoom={8}
          minZoom={7}
          maxBounds={JORDAN_BOUNDS}
          maxBoundsViscosity={0.8}
          style={{ height: "70vh", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {!manualMode && (
            <AutoLocationTracker
              onFound={setAutoPos}
              isCelebrating={isCelebrating}
              userAvatarUrl={user?.avatar_url}
            />
          )}

          {manualMode && <ManualLocationPicker onPick={(pos) => setManualPos(pos)} />}

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
                  color: "#1B56FD",
                  fillColor: "#1B56FD",
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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setActiveLocation(loc)}
                      style={{
                        flex: 1,
                        background: "#1B56FD",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "1.1rem"
                      }}
                    >
                      {t("check_in")}
                    </button>
                    <button
                      onClick={() => setActiveReviewsLocation(loc)}
                      style={{
                        flex: 1,
                        background: "#2E7D32",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        cursor: "pointer",
                        fontSize: "1.1rem"
                      }}
                    >
                      {i18n.language === "ar" ? "الآراء" : "Reviews"}
                    </button>
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