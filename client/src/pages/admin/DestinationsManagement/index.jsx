import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { destinations as initialDestinations } from "@/data/destinations";
import styles from "./DestinationsManagement.module.css";
import * as destinationService from "@/services/destinationService";

const STORAGE_KEY = "massar_destinations";

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
    location: "",
    description: "",
    image: null,
    imageUrl: ""
  });
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
        console.log('Using local destinations (API not available)');
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
    setNewDest({ name: "", location: "", description: "", image: null, imageUrl: "" });
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

  const handleSaveNew = async () => {
    if (newDest.name && newDest.location && newDest.description) {
      const finalImage = newDest.imageUrl || newDest.image || "/destinations/Petra.jpg";

      if (editingDestination) {
        // Update existing destination
        try {
          await destinationService.updateDestination(editingDestination.id, {
            name: newDest.name,
            location: newDest.location,
            description: newDest.description,
            image: finalImage,
            rating: editingDestination.rating,
            likes: editingDestination.likes
          });
          setDestinations(destinations.map(dest =>
            dest.id === editingDestination.id
              ? { ...dest, name: newDest.name, location: newDest.location, description: newDest.description, image: finalImage }
              : dest
          ));
        } catch (err) {
          // Fallback to local update
          setDestinations(destinations.map(dest =>
            dest.id === editingDestination.id
              ? { ...dest, name: newDest.name, location: newDest.location, description: newDest.description, image: finalImage }
              : dest
          ));
        }
      } else {
        // Add new destination
        const newId = Math.max(...destinations.map(d => d.id), 0) + 1;
        const newDestination = {
          id: newId,
          name: newDest.name,
          location: newDest.location,
          description: newDest.description,
          image: finalImage,
          rating: (4.3 + Math.random() * 0.6).toFixed(1),
          likes: Math.floor(300 + Math.random() * 1000)
        };

        try {
          await destinationService.addDestination(newDestination);
        } catch (err) {
          console.log('API not available, using local storage');
        }

        setDestinations([...destinations, newDestination]);
      }
      setShowModal(false);
      setNewDest({ name: "", location: "", description: "", image: null, imageUrl: "" });
      setEditingDestination(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewDest({ name: "", location: "", description: "", image: null, imageUrl: "" });
    setEditingDestination(null);
  };

  const handleEdit = (id) => {
    const dest = destinations.find(d => d.id === id);
    if (dest) {
      setEditingDestination(dest);
      setNewDest({
        name: dest.name,
        location: dest.location,
        description: dest.description,
        image: dest.image,
        imageUrl: ""
      });
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
      console.log('API not available, using local storage');
    }
    setDestinations(destinations.filter(dest => dest.id !== showDeleteConfirm));
    setShowDeleteConfirm(null);
  };

  const handleViewDetails = (id) => {
    navigate(`/destination/${id}`);
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
            Curate and manage your global portfolio of featured travel locations.
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
            4.7 <span className="material-symbols-outlined" style={{ color: "#f59e0b", fontSize: "1.2rem", verticalAlign: "middle" }}>star</span>
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
          <div key={dest.id} className={`${styles.card} ${openMenu === dest.id ? styles.cardMenuOpen : ""}`}>
            <div className={styles.imgWrapper}>
              <img src={dest.image} alt={dest.name} className={styles.img} />
              <div className={styles.imgOverlay}></div>
              <button
                className={styles.menuBtn}
                onClick={() => setOpenMenu(openMenu === dest.id ? null : dest.id)}
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
              {openMenu === dest.id && (
                <div className={styles.dropdown}>
                  <button onClick={() => handleEdit(dest.id)}>Edit</button>
                  <button onClick={() => handleFeature(dest.id)}>Feature</button>
                  <button className={styles.dropDanger} onClick={() => handleRemove(dest.id)}>Remove</button>
                </div>
              )}
              <div className={styles.imgMeta}>
                <span className={styles.ratingBadge}>
                  <span className="material-symbols-outlined" style={{ fontSize: "0.85rem", color: "#f59e0b" }}>star</span>
                  {dest.rating}
                </span>
                <span className={styles.likesBadge}>
                  <span className="material-symbols-outlined" style={{ fontSize: "0.85rem", color: "#f472b6" }}>favorite</span>
                  {dest.likes}
                </span>
              </div>
              <div className={styles.cardHoverDesc}>
                <div className={styles.hoverDescContent}>
                  <p className={styles.hoverDescText}>{dest.description}</p>
                </div>
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.destName}>{dest.name}</h3>
              <p className={styles.destLoc}>
                <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>location_on</span>
                {dest.location}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <p className={styles.paginationLabel}>Showing {startIndex + 1}–{endIndex} of {totalDestinations} destinations</p>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className={`${styles.modalOverlay} ${styles.modalOverlayVisible}`} onClick={() => setShowDeleteConfirm(null)}>
            <div className={`${styles.modalContent} ${styles.modalContentVisible}`} onClick={(e) => e.stopPropagation()}>
              <div className={styles.deleteConfirmContent}>
                <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#dc2626" }}>delete</span>
                <h3 className={styles.deleteConfirmTitle}>Remove this destination?</h3>
                <p className={styles.deleteConfirmBody}>
                  This destination will be permanently removed from your listings. This action cannot be undone.
                </p>
                <div className={styles.deleteConfirmActions}>
                  <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                  <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>Remove Destination</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Destination Modal */}
        <div className={`${styles.modalOverlay} ${showModal ? styles.modalOverlayVisible : ""}`} onClick={handleCloseModal}>
          <div className={`${styles.modalContent} ${showModal ? styles.modalContentVisible : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingDestination ? 'Edit Destination' : 'Add New Destination'}</h2>
              <button className={styles.modalClose} onClick={handleCloseModal}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.imageUpload}>
                {newDest.image || newDest.imageUrl ? (
                  <div className={styles.imagePreview}>
                    <img src={newDest.imageUrl || newDest.image} alt="Preview" />
                    <button className={styles.removeImage} onClick={() => setNewDest({ ...newDest, image: null, imageUrl: "" })}>
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

              {/* Photo URL Option */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Or enter photo URL</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="https://example.com/image.jpg"
                  value={newDest.imageUrl}
                  onChange={handleImageUrlChange}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Destination Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Petra, Wadi Rum"
                  value={newDest.name}
                  onChange={(e) => setNewDest({ ...newDest, name: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Location</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g., Ma'an, Jordan"
                  value={newDest.location}
                  onChange={(e) => setNewDest({ ...newDest, location: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Describe the destination..."
                  rows={4}
                  value={newDest.description}
                  onChange={(e) => setNewDest({ ...newDest, description: e.target.value })}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Cancel</button>
              <button className={styles.saveBtn} onClick={handleSaveNew}>{editingDestination ? 'Update Destination' : 'Save Destination'}</button>
            </div>
          </div>
        </div>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
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
          <button className={styles.pageBtn} onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DestinationsManagement;