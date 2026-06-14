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
  briefDescription: editData?.briefDescription || "",
  coordinates: editData?.coordinates || "",
  location: destinationName || "",
  budget: editData?.budget || "",
  operatingHours: editData?.operatingHours || { start: "", end: "" },
  workingDays: editData?.workingDays || [],
  photos: editData?.photos || [],
  contacts: editData?.contacts || [],
  bookingLink: editData?.bookingLink || "",
});

function HotelsModal({ isOpen, onClose, onSave, destinationName, editData = null, saving = false }) {
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
    if (!formData.name.trim()) newErrors.name = "Hotel name is required";
    if (!formData.briefDescription.trim()) newErrors.briefDescription = "Brief description is required";
    if (!formData.coordinates.trim()) newErrors.coordinates = "Coordinates are required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (formData.contacts.length === 0) newErrors.contacts = "At least one contact is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
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
          <h2 className={styles.modalTitle}>{editData ? "Edit Hotel" : "Add New Hotel"}</h2>
          <button className={styles.modalClose} onClick={onClose} disabled={saving}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className={styles.modalBody}>
          {}
          <h3 className={styles.sectionTitle}>Overview</h3>
          <ImageUpload
            value={formData.image}
            onChange={(image) => setFormData({ ...formData, image })}
            label="Cover Image"
          />
          {errors.image && <span className={styles.errorText}>{errors.image}</span>}

          <div className={styles.formGroup}>
            <label className={styles.label}>Hotel Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter hotel name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Brief Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Brief description of the hotel..."
              rows={4}
              value={formData.briefDescription}
              onChange={(e) => setFormData({ ...formData, briefDescription: e.target.value })}
            />
            {errors.briefDescription && <span className={styles.errorText}>{errors.briefDescription}</span>}
          </div>

          <CoordinatesInput
            value={formData.coordinates}
            onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
            error={errors.coordinates}
          />

          {}
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
              placeholder="e.g., $100–$300/night"
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

          {}
          <h3 className={styles.sectionTitle}>
            Photos <span className={styles.optionalLabel}>(Optional)</span>
          </h3>
          <ImageUpload
            value={formData.photos}
            onChange={(photos) => setFormData({ ...formData, photos })}
            multiple
            label="Additional Photos"
          />

          {}
          <h3 className={styles.sectionTitle}>
            Contact <span className={styles.required}>*</span>
          </h3>
          <ContactList
            value={formData.contacts}
            onChange={(contacts) => setFormData({ ...formData, contacts })}
            label="Contact"
            required
          />
          {errors.contacts && <span className={styles.errorText}>{errors.contacts}</span>}

          {}
          <h3 className={styles.sectionTitle}>
            Book <span className={styles.optionalLabel}>(Optional)</span>
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Booking Link</label>
            <input
              type="text"
              className={styles.input}
              placeholder="https://booking.com/hotel/..."
              value={formData.bookingLink}
              onChange={(e) => setFormData({ ...formData, bookingLink: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : (editData ? "Update Hotel" : "Save Hotel")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default HotelsModal;