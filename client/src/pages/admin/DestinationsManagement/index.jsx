import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { destinations as initialDestinations } from "@/data/destinations";
import styles from "./DestinationsManagement.module.css";
import * as destinationService from "@/services/destinationService";

const STORAGE_KEY = "massar_destinations";

// Convert destination name to kebab-case slug
const toSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces/hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single
};

function DestinationsManagement() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load from localStorage or use initial data (always use initial for fresh paths)
  const [destinations, setDestinations] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if paths need updating
      if (parsed[0]?.image?.startsWith("/src/")) {
        return initialDestinations;
      }
      return parsed;
    }
    return initialDestinations;
  });

  const [newDest, setNewDest] = useState({
    name: "",
    tagline: "",
    location: "",
    coordinates: "",
    recommendedStay: "",
    bestSeason: "",
    averageCost: "",
    description: "",
    image: null,
    imageUrl: "",
    activities: [],
    travelGuide: {
      howToGetThere: "",
      bestTimeToVisit: "",
      whatToBring: "",
    },
  });

  const [coordinatesError, setCoordinatesError] = useState("");
  const itemsPerPage = 16;

  // Save to localStorage whenever destinations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(destinations));
  }, [destinations]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal || showDeleteConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal, showDeleteConfirm]);

  // Fetch destinations from API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const data = await destinationService.getDestinations();
        if (data && data.length > 0) {
          setDestinations(data);
        }
        setLoading(false);
      } catch (err) {
        console.log("Using local destinations (API not available)");
        setLoading(false);
      }
    };
    fetchDestinations();
  }, []);

  const totalDestinations = destinations.length;
  const totalPages = Math.ceil(totalDestinations / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalDestinations);
  const currentDestinations = destinations.slice(startIndex, endIndex);

  const handleAddNew = () => {
    setEditingDestination(null);
    setNewDest({
      name: "",
      tagline: "",
      location: "",
      coordinates: "",
      recommendedStay: "",
      bestSeason: "",
      averageCost: "",
      description: "",
      image: null,
      imageUrl: "",
      activities: [],
      travelGuide: {
        howToGetThere: "",
        bestTimeToVisit: "",
        whatToBring: "",
      },
    });
    setCoordinatesError("");
    setShowModal(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDest({ ...newDest, image: reader.result, imageUrl: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    setNewDest({ ...newDest, imageUrl: e.target.value, image: null });
  };

  // Validate coordinates format (±DD.DDDD, ±DDD.DDDD)
  const validateCoordinates = (value) => {
    if (!value) return true; // Allow empty
    const coordRegex = /^[+-]?\d{1,3}\.\d{4,6},\s*[+-]?\d{1,3}\.\d{4,6}$/;
    return coordRegex.test(value.trim());
  };

  const handleCoordinatesBlur = (e) => {
    const value = e.target.value;
    if (value && !validateCoordinates(value)) {
      setCoordinatesError("Invalid coordinates. Use format: 31.9522, 35.2332");
    } else {
      setCoordinatesError("");
    }
  };

  const handleCoordinatesChange = (e) => {
    setNewDest({ ...newDest, coordinates: e.target.value });
    if (coordinatesError) {
      setCoordinatesError("");
    }
  };

  // Activity handlers
  const handleAddActivity = () => {
    setNewDest({
      ...newDest,
      activities: [...newDest.activities, ""],
    });
  };

  const handleActivityChange = (index, value) => {
    const updatedActivities = [...newDest.activities];
    updatedActivities[index] = value;
    setNewDest({ ...newDest, activities: updatedActivities });
  };

  const handleRemoveActivity = (index) => {
    const updatedActivities = newDest.activities.filter((_, i) => i !== index);
    setNewDest({ ...newDest, activities: updatedActivities });
  };

  // Travel guide handlers
  const handleTravelGuideChange = (field, value) => {
    setNewDest({
      ...newDest,
      travelGuide: {
        ...newDest.travelGuide,
        [field]: value,
      },
    });
  };

  const handleSaveNew = async () => {
    // Validate coordinates if provided
    if (newDest.coordinates && !validateCoordinates(newDest.coordinates)) {
      setCoordinatesError("Invalid coordinates. Use format: 31.9522, 35.2332");
      return;
    }

    if (newDest.name && newDest.location && newDest.description) {
      const finalImage =
        newDest.imageUrl || newDest.image || "/destinations/Petra.jpg";

      if (editingDestination) {
        // Update existing destination
        try {
          await destinationService.updateDestination(editingDestination.id, {
            name: newDest.name,
            tagline: newDest.tagline,
            location: newDest.location,
            coordinates: newDest.coordinates,
            recommendedStay: newDest.recommendedStay,
            bestSeason: newDest.bestSeason,
            averageCost: newDest.averageCost,
            description: newDest.description,
            image: finalImage,
            rating: editingDestination.rating,
            likes: editingDestination.likes,
            activities: newDest.activities,
            travelGuide: newDest.travelGuide,
          });
          setDestinations(
            destinations.map((dest) =>
              dest.id === editingDestination.id
                ? {
                  ...dest,
                  name: newDest.name,
                  tagline: newDest.tagline,
                  location: newDest.location,
                  coordinates: newDest.coordinates,
                  recommendedStay: newDest.recommendedStay,
                  bestSeason: newDest.bestSeason,
                  averageCost: newDest.averageCost,
                  description: newDest.description,
                  image: finalImage,
                  activities: newDest.activities,
                  travelGuide: newDest.travelGuide,
                }
                : dest,
            ),
          );
        } catch (err) {
          // Fallback to local update
          setDestinations(
            destinations.map((dest) =>
              dest.id === editingDestination.id
                ? {
                  ...dest,
                  name: newDest.name,
                  tagline: newDest.tagline,
                  location: newDest.location,
                  coordinates: newDest.coordinates,
                  recommendedStay: newDest.recommendedStay,
                  bestSeason: newDest.bestSeason,
                  averageCost: newDest.averageCost,
                  description: newDest.description,
                  image: finalImage,
                  activities: newDest.activities,
                  travelGuide: newDest.travelGuide,
                }
                : dest,
            ),
          );
        }
      } else {
        // Add new destination
        const newId = Math.max(...destinations.map((d) => d.id), 0) + 1;
        const newDestination = {
          id: newId,
          name: newDest.name,
          tagline: newDest.tagline,
          location: newDest.location,
          coordinates: newDest.coordinates,
          recommendedStay: newDest.recommendedStay,
          bestSeason: newDest.bestSeason,
          averageCost: newDest.averageCost,
          description: newDest.description,
          image: finalImage,
          rating: (4.3 + Math.random() * 0.6).toFixed(1),
          likes: Math.floor(300 + Math.random() * 1000),
          activities: newDest.activities,
          travelGuide: newDest.travelGuide,
        };

        try {
          await destinationService.addDestination(newDestination);
        } catch (err) {
          console.log("API not available, using local storage");
        }

        setDestinations([...destinations, newDestination]);
      }
      setShowModal(false);
      setNewDest({
        name: "",
        tagline: "",
        location: "",
        coordinates: "",
        recommendedStay: "",
        bestSeason: "",
        averageCost: "",
        description: "",
        image: null,
        imageUrl: "",
        activities: [],
        travelGuide: {
          howToGetThere: "",
          bestTimeToVisit: "",
          whatToBring: "",
        },
      });
      setCoordinatesError("");
      setEditingDestination(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewDest({
      name: "",
      tagline: "",
      location: "",
      coordinates: "",
      recommendedStay: "",
      bestSeason: "",
      averageCost: "",
      description: "",
      image: null,
      imageUrl: "",
      activities: [],
      travelGuide: {
        howToGetThere: "",
        bestTimeToVisit: "",
        whatToBring: "",
      },
    });
    setCoordinatesError("");
    setEditingDestination(null);
  };

  const handleEdit = (id) => {
    const dest = destinations.find((d) => d.id === id);
    if (dest) {
      setEditingDestination(dest);
      setNewDest({
        name: dest.name || "",
        tagline: dest.tagline || "",
        location: dest.location || "",
        coordinates: dest.coordinates || "",
        recommendedStay: dest.recommendedStay || "",
        bestSeason: dest.bestSeason || "",
        averageCost: dest.averageCost || "",
        description: dest.description || "",
        image: dest.image || null,
        imageUrl: "",
        activities: dest.activities || [],
        travelGuide: dest.travelGuide || {
          howToGetThere: "",
          bestTimeToVisit: "",
          whatToBring: "",
        },
      });
      setCoordinatesError("");
      setShowModal(true);
    }
    setOpenMenu(null);
  };

  const handleFeature = (id) => {
    alert(`Featured destination ${id}`);
    setOpenMenu(null);
  };

  const handleRemove = async (id) => {
    setShowDeleteConfirm(id);
    setOpenMenu(null);
  };

  const confirmDelete = async () => {
    try {
      await destinationService.deleteDestination(showDeleteConfirm);
    } catch (err) {
      console.log("API not available, using local storage");
    }
    setDestinations(
      destinations.filter((dest) => dest.id !== showDeleteConfirm),
    );
    setShowDeleteConfirm(null);
  };

  const handleViewDetails = (id) => {
    navigate(`/destination/${id}`);
  };

  const handleCardClick = (dest) => {
    const slug = toSlug(dest.name);
    navigate(`/admin/destinations/${slug}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading destinations...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Destination Management</h1>
          <p className={styles.subtitle}>
            Curate and manage your global portfolio of featured travel
            locations.
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleAddNew}>
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
            4.7{" "}
            <span
              className="material-symbols-outlined"
              style={{
                color: "#f59e0b",
                fontSize: "1.2rem",
                verticalAlign: "middle",
              }}
            >
              star
            </span>
          </p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Featured This Month</p>
          <p className={styles.statVal}>24</p>
        </div>
        <div className={styles.statItem}>
          <p className={styles.statLabel}>Pending Reviews</p>
          <p className={`${styles.statVal} ${styles.statRed}`}>12</p>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {currentDestinations.map((dest) => (
          <div
            key={dest.id}
            className={`${styles.card} ${openMenu === dest.id ? styles.cardMenuOpen : ""}`}
            onClick={() => handleCardClick(dest)}
          >
            <div className={styles.imgWrapper}>
              <img src={dest.image} alt={dest.name} className={styles.img} />
              <div className={styles.imgOverlay}></div>
              <button
                className={styles.menuBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === dest.id ? null : dest.id);
                }}
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
              {openMenu === dest.id && (
                <div className={styles.dropdown}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(dest.id);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeature(dest.id);
                    }}
                  >
                    Feature
                  </button>
                  <button
                    className={styles.dropDanger}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(dest.id);
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className={styles.imgMeta}>
                <span className={styles.ratingBadge}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "0.85rem", color: "#f59e0b" }}
                  >
                    star
                  </span>
                  {dest.rating}
                </span>
                <span className={styles.likesBadge}>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "0.85rem", color: "#f472b6" }}
                  >
                    favorite
                  </span>
                  {dest.likes}
                </span>
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.destName}>{dest.name}</h3>
              <p className={styles.destDesc}>{dest.description}</p>
              <p className={styles.destLoc}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "0.9rem" }}
                >
                  location_on
                </span>
                {dest.location}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <p className={styles.paginationLabel}>
          Showing {startIndex + 1}–{endIndex} of {totalDestinations}{" "}
          destinations
        </p>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div
            className={`${styles.modalOverlay} ${styles.modalOverlayVisible}`}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className={`${styles.modalContent} ${styles.modalContentVisible}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.deleteConfirmContent}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "3rem", color: "#dc2626" }}
                >
                  delete
                </span>
                <h3 className={styles.deleteConfirmTitle}>
                  Remove this destination?
                </h3>
                <p className={styles.deleteConfirmBody}>
                  This destination will be permanently removed from your
                  listings.
                  <br /> This action cannot be undone.
                </p>
                <div className={styles.deleteConfirmActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.confirmDeleteBtn}
                    onClick={confirmDelete}
                  >
                    Remove Destination
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Destination Modal */}
        <div
          className={`${styles.modalOverlay} ${showModal ? styles.modalOverlayVisible : ""}`}
          onClick={handleCloseModal}
        >
          <div
            className={`${styles.modalContent} ${showModal ? styles.modalContentVisible : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingDestination
                  ? "Edit Destination"
                  : "Add New Destination"}
              </h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.imageUpload}>
                {newDest.image || newDest.imageUrl ? (
                  <div className={styles.imagePreview}>
                    <img
                      src={newDest.imageUrl || newDest.image}
                      alt="Preview"
                    />
                    <button
                      className={styles.removeImage}
                      onClick={() =>
                        setNewDest({ ...newDest, image: null, imageUrl: "" })
                      }
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <span className="material-symbols-outlined">
                      add_photo_alternate
                    </span>
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      hidden
                    />
                  </label>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Destination Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Petra, Wadi Rum"
                  value={newDest.name}
                  onChange={(e) =>
                    setNewDest({ ...newDest, name: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Tagline</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., The Rose City, The Moon Valley"
                  value={newDest.tagline}
                  onChange={(e) =>
                    setNewDest({ ...newDest, tagline: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Location</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Ma'an, Jordan"
                  value={newDest.location}
                  onChange={(e) =>
                    setNewDest({ ...newDest, location: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Coordinates</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., 31.9522, 35.2332"
                  value={newDest.coordinates}
                  onChange={handleCoordinatesChange}
                  onBlur={handleCoordinatesBlur}
                />
                {coordinatesError && (
                  <span className={styles.errorText}>{coordinatesError}</span>
                )}
              </div>

              <h3 className={styles.sectionTitle}>Overview</h3>
              <div className={styles.formGroup}>
                <label className={styles.label}>Recommended Stay</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., 2–3 days"
                  value={newDest.recommendedStay}
                  onChange={(e) =>
                    setNewDest({ ...newDest, recommendedStay: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Best Season</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Spring, Autumn"
                  value={newDest.bestSeason}
                  onChange={(e) =>
                    setNewDest({ ...newDest, bestSeason: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Average Cost</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., $50–$100/day"
                  value={newDest.averageCost}
                  onChange={(e) =>
                    setNewDest({ ...newDest, averageCost: e.target.value })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Describe the destination..."
                  rows={4}
                  value={newDest.description}
                  onChange={(e) =>
                    setNewDest({ ...newDest, description: e.target.value })
                  }
                />
              </div>

              {/* Activities Section */}
              <h3 className={styles.sectionTitle}>Activities</h3>
              <div className={styles.activitiesList}>
                {newDest.activities.map((activity, index) => (
                  <div key={index} className={styles.activityItem}>
                    <input
                      type="text"
                      className={styles.activityInput}
                      placeholder="e.g., Guided tour of the Treasury"
                      value={activity}
                      onChange={(e) =>
                        handleActivityChange(index, e.target.value)
                      }
                    />
                    <button
                      className={styles.removeActivityBtn}
                      onClick={() => handleRemoveActivity(index)}
                      type="button"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                ))}
                <button
                  className={styles.addActivityBtn}
                  onClick={handleAddActivity}
                  type="button"
                >
                  <span className="material-symbols-outlined">add</span>
                  Add Activity
                </button>
              </div>

              {/* Travel Guide Section */}
              <h3 className={styles.sectionTitle}>Travel Guide</h3>
              <div className={styles.travelGuideGroup}>
                <label className={styles.label}>How to Get There</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Describe how to reach the destination..."
                  rows={3}
                  value={newDest.travelGuide.howToGetThere}
                  onChange={(e) =>
                    handleTravelGuideChange("howToGetThere", e.target.value)
                  }
                />
              </div>

              <div className={styles.travelGuideGroup}>
                <label className={styles.label}>Best Time to Visit</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Describe the best time to visit..."
                  rows={3}
                  value={newDest.travelGuide.bestTimeToVisit}
                  onChange={(e) =>
                    handleTravelGuideChange("bestTimeToVisit", e.target.value)
                  }
                />
              </div>

              <div className={styles.travelGuideGroup}>
                <label className={styles.label}>What to Bring</label>
                <textarea
                  className={styles.textarea}
                  placeholder="List items to bring..."
                  rows={3}
                  value={newDest.travelGuide.whatToBring}
                  onChange={(e) =>
                    handleTravelGuideChange("whatToBring", e.target.value)
                  }
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={handleSaveNew}>
                {editingDestination ? "Update Destination" : "Save Destination"}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.pageButtons}>
          <button
            className={styles.pageBtn}
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.pageBtnActive : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageBtn}
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestinationsManagement;
