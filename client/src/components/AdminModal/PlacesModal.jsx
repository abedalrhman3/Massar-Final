import { useState, useEffect } from "react";
import styles from "./AdminModal.module.css";
import ImageUpload from "./ImageUpload";
import CoordinatesInput from "./CoordinatesInput";
import WorkingDays from "./WorkingDays";
import TimeRangePicker from "./TimeRangePicker";
import ContactList from "./ContactList";

const getInitialFormData = (destinationName, editData = null) => ({
  image: editData?.image || null,
  name: editData?.name || "",
  description: editData?.description || "",
  coordinates: editData?.coordinates || "",
  location: destinationName || "",
  budget: editData?.budget || "",
  operatingHours: editData?.operatingHours || { start: "", end: "" },
  workingDays: editData?.workingDays || [],
  photos: editData?.photos || [],
  contacts: editData?.contacts || [],
});

function PlacesModal({ isOpen, onClose, onSave, destinationName, editData = null }) {
  const [formData, setFormData] = useState(() => getInitialFormData(destinationName, editData));
  const [errors, setErrors] = useState({});

  // Reset form when modal opens for new entry (no editData)
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Editing - use editData
        setFormData(getInitialFormData(destinationName, editData));
      } else {
        // Adding new - reset all fields
        setFormData(getInitialFormData(destinationName, null));
      }
      setErrors({});
    }
  }, [isOpen, editData, destinationName]);

  const validate = () => {
    const newErrors = {};
    if (!formData.image) newErrors.image = "Image is required";
    if (!formData.name.trim()) newErrors.name = "Place name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.coordinates.trim()) newErrors.coordinates = "Coordinates are required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${styles.modalOverlayVisible}`}
      onClick={onClose}
    >
      <div
        className={`${styles.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editData ? "Edit Place" : "Add New Place"}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Overview - Required */}
          <h3 className={styles.sectionTitle}>Overview</h3>
          <ImageUpload
            value={formData.image}
            onChange={(image) => setFormData({ ...formData, image })}
            label="Cover Image"
          />
          {errors.image && <span className={styles.errorText}>{errors.image}</span>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Place Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter place name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Describe the place..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            {errors.description && <span className={styles.errorText}>{errors.description}</span>}
          </div>

          <CoordinatesInput
            value={formData.coordinates}
            onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
            error={errors.coordinates}
          />

          {/* About - Required */}
          <h3 className={styles.sectionTitle}>About</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Location</label>
            <input
              type="text"
              className={styles.readOnlyInput}
              value={formData.location}
              readOnly
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Budget</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., $50–$100"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <TimeRangePicker
            value={formData.operatingHours}
            onChange={(operatingHours) => setFormData({ ...formData, operatingHours })}
          />

          <WorkingDays
            value={formData.workingDays}
            onChange={(workingDays) => setFormData({ ...formData, workingDays })}
          />

          {/* Photos - Optional */}
          <h3 className={styles.sectionTitle}>
            Photos <span className={styles.optionalLabel}>(Optional)</span>
          </h3>
          <ImageUpload
            value={formData.photos}
            onChange={(photos) => setFormData({ ...formData, photos })}
            multiple
            label="Additional Photos"
          />

          {/* Contact - Optional */}
          <h3 className={styles.sectionTitle}>
            Contact <span className={styles.optionalLabel}>(Optional)</span>
          </h3>
          <ContactList
            value={formData.contacts}
            onChange={(contacts) => setFormData({ ...formData, contacts })}
            label="Contact"
          />
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            {editData ? "Update Place" : "Save Place"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PlacesModal;