import styles from "./AdminModal.module.css";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function WorkingDays({ value = [], onChange }) {
  const toggleDay = (day) => {
    if (value.includes(day)) {
      onChange(value.filter((d) => d !== day));
    } else {
      onChange([...value, day]);
    }
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>Working Days</label>
      <div className={styles.workingDaysRow}>
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            className={`${styles.dayToggle} ${value.includes(day) ? styles.dayToggleActive : ""}`}
            onClick={() => toggleDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

export default WorkingDays;