import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DestinationsManagement.module.css";
import {
  getDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  updateDestinationDetails,
  getDestinationDetails,
} from "@/api/destination";

const toSlug = (name) =>
  name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const emptyForm = {
  name: "",
  tagline: "",
  location: "",
  coordinates: "",
  recommendedStay: "",
  bestSeason: "",
  averageCost: "",
  description: "",
  budget: "",
  isPublished: false,
  image: null,       // File object
  imagePreview: "",  // base64 preview
  imageUrl: "",      // external URL fallback
  activities: [],
  travelGuide: { howToGetThere: "", bestTimeToVisit: "", whatToBring: "" },
};

const validateCoordinates = (value) => {
  if (!value) return true;
  return /^[+-]?\d{1,3}\.\d{4,6},\s*[+-]?\d{1,3}\.\d{4,6}$/.test(value.trim());
};

function DestinationsManagement() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newDest, setNewDest] = useState(emptyForm);
  const [coordinatesError, setCoordinatesError] = useState("");
  const [saving, setSaving] = useState(false);

  const itemsPerPage = 16;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDestinations();
        setDestinations(res.data?.data ?? []);
      } catch (err) {
        setError("Failed to load destinations.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Scroll lock ────────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = showModal || showDeleteConfirm ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [showModal, showDeleteConfirm]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalDestinations = destinations.length;
  const totalPages = Math.ceil(totalDestinations / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalDestinations);
  const currentDestinations = destinations.slice(startIndex, endIndex);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingDestination(null);
    setNewDest(emptyForm);
    setCoordinatesError("");
    setShowModal(true);
  };

  const openEditModal = async (dest) => {
    setEditingDestination(dest);
    // Start with what the Destination doc gives us
    const base = {
      name: dest.name || "",
      tagline: dest.tagline || "",
      location: "",
      coordinates: dest.location?.coordinates
        ? `${dest.location.coordinates[1]}, ${dest.location.coordinates[0]}`
        : "",
      recommendedStay: "",
      bestSeason: "",
      averageCost: "",
      description: dest.description || "",
      budget: dest.budget || "",
      isPublished: dest.isPublished || false,
      image: null,
      imagePreview: "",
      imageUrl: dest.image || "",
      activities: [],
      travelGuide: { howToGetThere: "", bestTimeToVisit: "", whatToBring: "" },
    };

    // Fetch DestinationDetail to pre-fill overview + activities + guideSections
    try {
      const detailRes = await getDestinationDetails(dest._id);
      const detail = detailRes.data.data;
      if (detail) {
        base.location        = detail.overview?.locationText    || "";
        base.recommendedStay = detail.overview?.recommendedStay || "";
        base.bestSeason      = detail.overview?.bestSeason      || "";
        base.averageCost     = detail.overview?.averageCost     || "";
        // activities stored as [{name}], form uses flat strings
        base.activities = (detail.activities || []).map(a => a.name || "");
        // guideSections back to travelGuide
        const guide = detail.guideSections || [];
        const find = (titles) => guide.find(s => titles.includes(s.title))?.content || "";
        base.travelGuide = {
          howToGetThere:  find(["How to Get There"]),
          bestTimeToVisit: find(["Best Time to Visit"]),
          whatToBring:    find(["What to Bring"]),
        };
      }
    } catch (_) {
      // no detail doc yet — that's fine, form stays blank for those fields
    }

    setNewDest(base);
    setCoordinatesError("");
    setShowModal(true);
    setOpenMenu(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setNewDest(emptyForm);
    setCoordinatesError("");
    setEditingDestination(null);
  };

  // ── Image handlers ─────────────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setNewDest({ ...newDest, image: file, imagePreview: reader.result, imageUrl: "" });
    reader.readAsDataURL(file);
  };

  const handleImageUrlChange = (e) =>
    setNewDest({ ...newDest, imageUrl: e.target.value, image: null, imagePreview: "" });

  // ── Coordinates ────────────────────────────────────────────────────────────
  const handleCoordinatesChange = (e) => {
    setNewDest({ ...newDest, coordinates: e.target.value });
    if (coordinatesError) setCoordinatesError("");
  };

  const handleCoordinatesBlur = (e) => {
    if (e.target.value && !validateCoordinates(e.target.value))
      setCoordinatesError("Invalid format. Use: 31.9522, 35.2332");
    else setCoordinatesError("");
  };

  // ── Activities ─────────────────────────────────────────────────────────────
  const handleAddActivity = () =>
    setNewDest({ ...newDest, activities: [...newDest.activities, ""] });

  const handleActivityChange = (index, value) => {
    const updated = [...newDest.activities];
    updated[index] = value;
    setNewDest({ ...newDest, activities: updated });
  };

  const handleRemoveActivity = (index) =>
    setNewDest({ ...newDest, activities: newDest.activities.filter((_, i) => i !== index) });

  // ── Travel guide ───────────────────────────────────────────────────────────
  const handleTravelGuideChange = (field, value) =>
    setNewDest({ ...newDest, travelGuide: { ...newDest.travelGuide, [field]: value } });

  // ── Save (create / update) ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!newDest.name || !newDest.budget) {
      alert("Name and budget are required.");
      return;
    }
    if (newDest.coordinates && !validateCoordinates(newDest.coordinates)) {
      setCoordinatesError("Invalid format. Use: 31.9522, 35.2332");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", newDest.name);
      formData.append("budget", newDest.budget);
      formData.append("isPublished", newDest.isPublished);
      formData.append("tagline", newDest.tagline);
      formData.append("description", newDest.description);

      // Build GeoJSON location from coordinates string
      if (newDest.coordinates) {
        const [lat, lng] = newDest.coordinates.split(",").map(Number);
        formData.append("location", JSON.stringify({
          type: "Point",
          coordinates: [lng, lat], // MongoDB expects [lng, lat]
        }));
      }

      // Image — file takes priority over URL
      if (newDest.image) {
        formData.append("image", newDest.image);
      }

      let destinationId;
      if (editingDestination) {
        const res = await updateDestination(editingDestination._id, formData);
        const updated = res.data.data;
        destinationId = updated._id;
        setDestinations(destinations.map((d) =>
          d._id === updated._id ? updated : d
        ));
      } else {
        const res = await createDestination(formData);
        destinationId = res.data.data._id;
        setDestinations([...destinations, res.data.data]);
      }

      await updateDestinationDetails(destinationId, {
        overview: {
          text:            newDest.description,
          locationText:    newDest.location,
          recommendedStay: newDest.recommendedStay,
          bestSeason:      newDest.bestSeason,
          averageCost:     newDest.averageCost,
        },
        // flat strings → [{name}], skip blanks
        activities: newDest.activities.filter(a => a.trim()).map(name => ({ name })),
        guideSections: [
          { type: 'transport', title: 'How to Get There',  content: newDest.travelGuide.howToGetThere,  sortOrder: 0 },
          { type: 'tips',     title: 'Best Time to Visit', content: newDest.travelGuide.bestTimeToVisit, sortOrder: 1 },
          { type: 'other',    title: 'What to Bring',      content: newDest.travelGuide.whatToBring,     sortOrder: 2 },
        ],
      });

      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save destination.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    try {
      await deleteDestination(showDeleteConfirm);
      setDestinations(destinations.filter((d) => d._id !== showDeleteConfirm));
    } catch (err) {
      alert("Failed to delete destination.");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleCardClick = (dest) => {
    navigate(`/admin/destinations/${dest.slug || toSlug(dest.name)}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading destinations...</div></div>;
  if (error) return <div className={styles.page}><div className={styles.loading} style={{ color: '#dc2626' }}>{error}</div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Destination Management</h1>
          <p className={styles.subtitle}>
            Curate and manage your global portfolio of featured travel locations.
          </p>
        </div>
        <button className={styles.addBtn} onClick={openAddModal}>
          <span className="material-symbols-outlined">add</span>
          Add New Destination
        </button>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Total Listings</p>
          <p className={styles.statVal}>{totalDestinations}</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Average Rating</p>
          <p className={`${styles.statVal} ${styles.statBlue}`}>
            {totalDestinations > 0
              ? (destinations.reduce((s, d) => s + (d.rating || 0), 0) / totalDestinations).toFixed(1)
              : "—"}{" "}
            <span className="material-symbols-outlined" style={{ color: "#f59e0b", fontSize: "1.2rem", verticalAlign: "middle" }}>star</span>
          </p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Published</p>
          <p className={styles.statVal}>{destinations.filter((d) => d.isPublished).length}</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Unpublished</p>
          <p className={`${styles.statVal} ${styles.statRed}`}>{destinations.filter((d) => !d.isPublished).length}</p>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {currentDestinations.map((dest) => (
          <div
            key={dest._id}
            className={`${styles.card} ${openMenu === dest._id ? styles.cardMenuOpen : ""}`}
            onClick={() => handleCardClick(dest)}
          >
            <div className={styles.imgWrapper}>
              <img src={dest.image} alt={dest.name} className={styles.img} />
              <div className={styles.imgOverlay}></div>
              <button
                className={styles.menuBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === dest._id ? null : dest._id);
                }}
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
              {openMenu === dest._id && (
                <div className={styles.dropdown}>
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(dest); }}>Edit</button>
                  <button
                    className={styles.dropDanger}
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(dest._id); setOpenMenu(null); }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className={styles.imgMeta}>
                <span className={styles.ratingBadge}>
                  <span className="material-symbols-outlined" style={{ fontSize: "0.85rem", color: "#f59e0b" }}>star</span>
                  {dest.rating ?? "—"}
                </span>
                <span className={styles.likesBadge}>
                  <span className="material-symbols-outlined" style={{ fontSize: "0.85rem", color: "#f472b6" }}>favorite</span>
                  {dest.likes ?? 0}
                </span>
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.destName}>{dest.name}</h3>
              <p className={styles.destDesc}>{dest.description || dest.tagline || ""}</p>
              <p className={styles.destLoc}>
                <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>location_on</span>
                Budget: {dest.budget} JD
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <p className={styles.paginationLabel}>
          Showing {startIndex + 1}–{endIndex} of {totalDestinations} destinations
        </p>

        {/* Delete Confirm */}
        {showDeleteConfirm && (
          <div className={`${styles.modalOverlay} ${styles.modalOverlayVisible}`} onClick={() => setShowDeleteConfirm(null)}>
            <div className={`${styles.modalContent} ${styles.modalContentVisible}`} onClick={(e) => e.stopPropagation()}>
              <div className={styles.deleteConfirmContent}>
                <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#dc2626" }}>delete</span>
                <h3 className={styles.deleteConfirmTitle}>Remove this destination?</h3>
                <p className={styles.deleteConfirmBody}>
                  This destination will be permanently removed. This action cannot be undone.
                </p>
                <div className={styles.deleteConfirmActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                  <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>Remove Destination</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit Modal */}
        <div
          className={`${styles.modalOverlay} ${showModal ? styles.modalOverlayVisible : ""}`}
          onClick={closeModal}
        >
          <div
            className={`${styles.modalContent} ${showModal ? styles.modalContentVisible : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingDestination ? "Edit Destination" : "Add New Destination"}</h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Image */}
              <div className={styles.imageUpload}>
                {newDest.imagePreview || newDest.imageUrl ? (
                  <div className={styles.imagePreview}>
                    <img src={newDest.imagePreview || newDest.imageUrl} alt="Preview" />
                    <button className={styles.removeImage} onClick={() => setNewDest({ ...newDest, image: null, imagePreview: "", imageUrl: "" })}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <span className="material-symbols-outlined">add_photo_alternate</span>
                    <span>Upload Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                  </label>
                )}
              </div>

              {/* Or image URL */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Or paste image URL</label>
                <input type="text" className={styles.input} placeholder="https://..." value={newDest.imageUrl} onChange={handleImageUrlChange} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Destination Name *</label>
                <input type="text" className={styles.input} placeholder="e.g., Petra, Wadi Rum" value={newDest.name} onChange={(e) => setNewDest({ ...newDest, name: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Budget (JD) *</label>
                <input type="number" className={styles.input} placeholder="e.g., 50" value={newDest.budget} onChange={(e) => setNewDest({ ...newDest, budget: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Published</label>
                <input type="checkbox" checked={newDest.isPublished} onChange={(e) => setNewDest({ ...newDest, isPublished: e.target.checked })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Coordinates</label>
                <input type="text" className={styles.input} placeholder="e.g., 31.9522, 35.2332" value={newDest.coordinates} onChange={handleCoordinatesChange} onBlur={handleCoordinatesBlur} />
                {coordinatesError && <span className={styles.errorText}>{coordinatesError}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tagline</label>
                <input type="text" className={styles.input} placeholder="e.g., The Rose City" value={newDest.tagline} onChange={(e) => setNewDest({ ...newDest, tagline: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.textarea} placeholder="Describe the destination..." rows={4} value={newDest.description} onChange={(e) => setNewDest({ ...newDest, description: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Location Text</label>
                <input type="text" className={styles.input} placeholder="e.g., Southern Jordan, 4 hours from Amman" value={newDest.location} onChange={(e) => setNewDest({ ...newDest, location: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Recommended Stay</label>
                <input type="text" className={styles.input} placeholder="e.g., 2–3 days" value={newDest.recommendedStay} onChange={(e) => setNewDest({ ...newDest, recommendedStay: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Best Season</label>
                <input type="text" className={styles.input} placeholder="e.g., Spring, Autumn" value={newDest.bestSeason} onChange={(e) => setNewDest({ ...newDest, bestSeason: e.target.value })} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Average Cost</label>
                <input type="text" className={styles.input} placeholder="e.g., $50–$100/day" value={newDest.averageCost} onChange={(e) => setNewDest({ ...newDest, averageCost: e.target.value })} />
              </div>

              {/* Activities */}
              <h3 className={styles.sectionTitle}>Activities</h3>
              <div className={styles.activitiesList}>
                {newDest.activities.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <input type="text" className={styles.activityInput} placeholder="e.g., Guided tour" value={activity} onChange={(e) => handleActivityChange(index, e.target.value)} />
                    <button className={styles.removeActivityBtn} onClick={() => handleRemoveActivity(index)} type="button">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
                <button className={styles.addActivityBtn} onClick={handleAddActivity} type="button">
                  <span className="material-symbols-outlined">add</span>
                  Add Activity
                </button>
              </div>

              {/* Travel Guide */}
              <h3 className={styles.sectionTitle}>Travel Guide</h3>
              {[
                { field: "howToGetThere", label: "How to Get There" },
                { field: "bestTimeToVisit", label: "Best Time to Visit" },
                { field: "whatToBring", label: "What to Bring" },
              ].map(({ field, label }) => (
                <div className={styles.travelGuideGroup} key={field}>
                  <label className={styles.label}>{label}</label>
                  <textarea className={styles.textarea} rows={3} value={newDest.travelGuide[field]} onChange={(e) => handleTravelGuideChange(field, e.target.value)} />
                </div>
              ))}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingDestination ? "Update Destination" : "Save Destination"}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button key={page} className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`} onClick={() => handlePageChange(page)}>
              {page}
            </button>
          ))}
          <button className={styles.pageBtn} onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestinationsManagement;