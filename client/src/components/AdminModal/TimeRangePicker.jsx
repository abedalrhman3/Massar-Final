import styles from "./AdminModal.module.css";

function TimeRangePicker({ value = { start: "", end: "" }, onChange }) {
  const handleStartChange = (e) => {
    onChange({ ...value, start: e.target.value });
  };

  const handleEndChange = (e) => {
    onChange({ ...value, end: e.target.value });
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>Operating Hours</label>
      <div className={styles.timeRangeRow}>
        <input
          type="time"
          className={styles.timeInput}
          value={value.start}
          onChange={handleStartChange}
        />
        <span className={styles.timeSeparator}>–</span>
        <input
          type="time"
          className={styles.timeInput}
          value={value.end}
          onChange={handleEndChange}
        />
      </div>
    </div>
  );
}

export default TimeRangePicker;