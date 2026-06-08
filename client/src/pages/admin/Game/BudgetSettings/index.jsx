import { useState, useEffect } from "react";
import styles from "./BudgetSettings.module.css";
import { getBudgetSettings, updateBudgetSettings } from "@/api/admin";

function BudgetSettings() {
  const [settings, setSettings] = useState({ low_max: 50, mid_max: 150 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getBudgetSettings()
      .then(res => {
        const data = res.data?.budget_ranges ?? res.data;
        if (data?.low_max !== undefined) setSettings(data);
      })
      .catch(() => setError("Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (Number(settings.low_max) >= Number(settings.mid_max)) {
      setError("Low max must be less than Medium max.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateBudgetSettings({
        low_max: Number(settings.low_max),
        mid_max: Number(settings.mid_max),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const lowMax = Number(settings.low_max);
  const midMax = Number(settings.mid_max);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Budget Settings</h2>
          <p className={styles.subtitle}>Configure the cost thresholds that determine budget tiers for game locations.</p>
        </div>
      </div>

      {/* Visual tier preview */}
      <div className={styles.preview}>
        <h3 className={styles.previewTitle}>Current Budget Tiers</h3>
        <div className={styles.tiers}>
          <div className={`${styles.tier} ${styles.tierLow}`}>
            <span className="material-symbols-outlined">monetization_on</span>
            <div>
              <p className={styles.tierName}>Low Budget</p>
              <p className={styles.tierRange}>0 – {lowMax} JD</p>
            </div>
          </div>
          <div className={styles.tierArrow}>
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
          <div className={`${styles.tier} ${styles.tierMed}`}>
            <span className="material-symbols-outlined">star</span>
            <div>
              <p className={styles.tierName}>Medium Budget</p>
              <p className={styles.tierRange}>{lowMax + 1} – {midMax} JD</p>
            </div>
          </div>
          <div className={styles.tierArrow}>
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
          <div className={`${styles.tier} ${styles.tierHigh}`}>
            <span className="material-symbols-outlined">diamond</span>
            <div>
              <p className={styles.tierName}>High Budget</p>
              <p className={styles.tierRange}>{midMax + 1}+ JD</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className={styles.formCard}>
        <h3 className={styles.formTitle}>Adjust Thresholds</h3>
        <p className={styles.formDesc}>
          Locations with cost ≤ Low Max are <strong>Low Budget</strong>. Between Low Max and Medium Max is <strong>Medium</strong>. Above Medium Max is <strong>High Budget</strong>.
        </p>

        {loading ? (
          <div className={styles.loadingText}>Loading settings...</div>
        ) : (
          <form className={styles.form} onSubmit={handleSave}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <span className={`${styles.dot} ${styles.dotLow}`} />
                  Low Budget Max (JD)
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    className={styles.input}
                    min={1}
                    value={settings.low_max}
                    onChange={e => setSettings({ ...settings, low_max: e.target.value })}
                  />
                  <span className={styles.unit}>JD</span>
                </div>
                <p className={styles.fieldHint}>Costs ≤ this value → Low Budget</p>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>
                  <span className={`${styles.dot} ${styles.dotMed}`} />
                  Medium Budget Max (JD)
                </label>
                <div className={styles.inputWrapper}>
                  <input
                    type="number"
                    className={styles.input}
                    min={1}
                    value={settings.mid_max}
                    onChange={e => setSettings({ ...settings, mid_max: e.target.value })}
                  />
                  <span className={styles.unit}>JD</span>
                </div>
                <p className={styles.fieldHint}>Costs between Low Max and this → Medium Budget</p>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            {saved && (
              <div className={styles.successBanner}>
                <span className="material-symbols-outlined">check_circle</span>
                Settings saved successfully!
              </div>
            )}

            <div className={styles.actions}>
              <button type="submit" className={styles.saveBtn} disabled={saving || loading}>
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default BudgetSettings;
