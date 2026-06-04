import { useState, useEffect } from "react";
import styles from "./AdminModal.module.css";
import ImageUpload from "./ImageUpload";
import CoordinatesInput from "./CoordinatesInput";
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
  scheduleType: editData?.scheduleType || "weekly",
  scheduleDays: editData?.scheduleDays || [],
  scheduleMonthlyDay: editData?.scheduleMonthlyDay || null,
  scheduleYearly: editData?.scheduleYearly || "",
  photos: editData?.photos || [],
  contacts: editData?.contacts || [],
});

function EventsModal({ isOpen, onClose, onSave, destinationName, editData = null }) {
  const [scheduleType, setScheduleType] = useState(editData?.scheduleType || "weekly");
  const [formData, setFormData] = useState(() => getInitialFormData(destinationName, editData));
  const [errors, setErrors] = useState({});

  // Reset form when modal opens for new entry (no editData)
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // Editing - use editData
        setFormData(getInitialFormData(destinationName, editData));
        setScheduleType(editData.scheduleType || "weekly");
      } else {
        // Adding new - reset all fields
        setFormData(getInitialFormData(destinationName, null));
        setScheduleType("weekly");
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
    if (formData.contacts.length === 0) newErrors.contacts = "At least one contact is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const toggleScheduleDay = (day) => {
    const days = formData.scheduleDays.includes(day)
      ? formData.scheduleDays.filter((d) => d !== day)
      : [...formData.scheduleDays, day];
    setFormData({ ...formData, scheduleDays: days });
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
              placeholder="e.g., Free or $50"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            />
          </div>

          <TimeRangePicker
            value={formData.operatingHours}
            onChange={(operatingHours) => setFormData({ ...formData, operatingHours })}
          />

          {/* Event Schedule */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Event Schedule</label>
            <div className={styles.scheduleOptions}>
              <button
                type="button"
                className={`${styles.scheduleOptionBtn} ${scheduleType === "weekly" ? styles.scheduleOptionActive : ""}`}
                onClick={() => {
                  setScheduleType("weekly");
                  setFormData({ ...formData, scheduleType: "weekly" });
                }}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`${styles.scheduleOptionBtn} ${scheduleType === "monthly" ? styles.scheduleOptionActive : ""}`}
                onClick={() => {
                  setScheduleType("monthly");
                  setFormData({ ...formData, scheduleType: "monthly" });
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`${styles.scheduleOptionBtn} ${scheduleType === "yearly" ? styles.scheduleOptionActive : ""}`}
                onClick={() => {
                  setScheduleType("yearly");
                  setFormData({ ...formData, scheduleType: "yearly" });
                }}
              >
                Yearly
              </button>
            </div>

            {scheduleType === "weekly" && (
              <div className={styles.workingDaysRow}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`${styles.dayToggle} ${formData.scheduleDays.includes(day) ? styles.dayToggleActive : ""}`}
                    onClick={() => toggleScheduleDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            {scheduleType === "monthly" && (
              <div className={styles.calendarPicker}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`${styles.calendarDay} ${formData.scheduleMonthlyDay === day ? styles.calendarDayActive : ""}`}
                    onClick={() => setFormData({ ...formData, scheduleMonthlyDay: day })}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}

            {scheduleType === "yearly" && (
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., Every spring or January 15"
                value={formData.scheduleYearly}
                onChange={(e) => setFormData({ ...formData, scheduleYearly: e.target.value })}
              />
            )}
          </div>

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

          {/* Contact - Required */}
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
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveBtn} onClick={handleSave}>
            {editData ? "Update Event" : "Save Event"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventsModal;