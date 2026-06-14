import { useState, useEffect } from "react";
import styles from "./AdminModal.module.css";
import ImageUpload from "./ImageUpload";
import CoordinatesInput from "./CoordinatesInput";
import ContactList from "./ContactList";

const getInitialFormData = (destinationName, editData = null) => ({
  image: editData?.image || null,
  name: editData?.name || "",
  description: editData?.description || "",
  coordinates: editData?.coordinates || "",
  location: destinationName || "",
  startingFromPrice: editData?.startingFromPrice || "",
  durationText: editData?.durationText || "",
  startDate: editData?.startDate ? new Date(editData.startDate).toISOString().split("T")[0] : "",
  endDate: editData?.endDate ? new Date(editData.endDate).toISOString().split("T")[0] : "",
  startTimeFrom: editData?.startTimeFrom || "",  // maps to Event.startTime
  endTimeFrom:   editData?.endTimeFrom   || "",  // maps to Event.endTime
  bookingUrl: editData?.bookingUrl || "",
  photos: editData?.photos || [],
  contacts: editData?.contacts || [],
});

function EventsModal({ isOpen, onClose, onSave, destinationName, editData = null, saving = false }) {
  const [formData, setFormData] = useState(() => getInitialFormData(destinationName, editData));
  const [errors, setErrors] = useState({});

  // Reset form when modal opens for new entry (no editData)
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(getInitialFormData(destinationName, editData));
      } else {
        setFormData(getInitialFormData(destinationName, null));
      }
      setErrors({});
    }
  }, [isOpen, editData, destinationName]);

  const validate = () => {
    const newErrors = {};
    if (!formData.image) newErrors.image = "Image is required";
    if (!formData.name.trim()) newErrors.name = "Event name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.coordinates.trim()) newErrors.coordinates = "Coordinates are required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.startTimeFrom) newErrors.startTimeFrom = "Start time is required";
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
          <h2 className={styles.modalTitle}>{editData ? "Edit Event" : "Add New Event"}</h2>
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
            <label className={styles.label}>Event Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter event name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              placeholder="Describe the event..."
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

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Start Date</label>
              <input
                type="date"
                className={styles.input}
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
              {errors.startDate && <span className={styles.errorText}>{errors.startDate}</span>}
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>End Date</label>
              <input
                type="date"
                className={styles.input}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
              {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Start Time</label>
              <input
                type="time"
                className={styles.input}
                value={formData.startTimeFrom}
                onChange={(e) => setFormData({ ...formData, startTimeFrom: e.target.value })}
              />
              {errors.startTimeFrom && <span className={styles.errorText}>{errors.startTimeFrom}</span>}
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>End Time</label>
              <input
                type="time"
                className={styles.input}
                value={formData.endTimeFrom}
                onChange={(e) => setFormData({ ...formData, endTimeFrom: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Starting Ticket Price ($)</label>
              <input
                type="number"
                className={styles.input}
                placeholder="e.g., 45"
                value={formData.startingFromPrice}
                onChange={(e) => setFormData({ ...formData, startingFromPrice: e.target.value })}
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label className={styles.label}>Duration Text</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., 3 Days"
                value={formData.durationText}
                onChange={(e) => setFormData({ ...formData, durationText: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Booking Link / URL</label>
            <input
              type="text"
              className={styles.input}
              placeholder="https://..."
              value={formData.bookingUrl}
              onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
            />
          </div>

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
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : (editData ? "Update Event" : "Save Event")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventsModal;