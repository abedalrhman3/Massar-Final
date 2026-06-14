import { useState, useEffect } from "react";
import styles from "./Quests.module.css";
import { getAllQuests, createQuest, deleteQuest } from "@/api/quests";
import { getLocations } from "@/api/locations";
import { uploadAsset } from "@/api/admin";

const emptyForm = {
  title: "",
  title_en: "",
  description: "",
  description_en: "",
  bonus_xp: 200,
  title_reward: "",
  coordinatesInput: "",
};

function Quests() {
  const [quests, setQuests] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [badgeFile, setBadgeFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [badgePreview, setBadgePreview] = useState("");
  const [iconPreview, setIconPreview] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [questsRes, locsRes] = await Promise.all([getAllQuests(), getLocations()]);
      setQuests(questsRes.data?.data ?? questsRes.data ?? []);
      const locs = Array.isArray(locsRes.data) ? locsRes.data : (locsRes.data?.data ?? []);
      setAllLocations(locs);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = () => {
    setForm(emptyForm);
    setSelectedLocations([]);
    setBadgeFile(null); setIconFile(null);
    setBadgePreview(""); setIconPreview("");
    setError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setError(""); };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "badge") { setBadgeFile(file); setBadgePreview(reader.result); }
      else { setIconFile(file); setIconPreview(reader.result); }
    };
    reader.readAsDataURL(file);
  };

  const toggleLocation = (id) => {
    setSelectedLocations(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!form.title) { setError("Arabic title is required."); return; }

    setSaving(true);
    try {
      let badge_url = "", icon_url = "";
      if (badgeFile) {
        const res = await uploadAsset(badgeFile);
        badge_url = res.data?.fileUrl ?? "";
      }
      if (iconFile) {
        const res = await uploadAsset(iconFile);
        icon_url = res.data?.fileUrl ?? "";
      }

      let start_coordinates;
      if (form.coordinatesInput) {
        const [latStr, lngStr] = form.coordinatesInput.split(",");
        start_coordinates = { lat: Number(latStr?.trim()), lng: Number(lngStr?.trim()) };
      }

      const res = await createQuest({
        title: form.title,
        title_en: form.title_en,
        description: form.description,
        description_en: form.description_en,
        bonus_xp: Number(form.bonus_xp),
        title_reward: form.title_reward,
        locations: selectedLocations,
        badge_url,
        icon_url,
        ...(start_coordinates && { start_coordinates }),
      });

      const newQuest = res.data?.data ?? res.data;
      setQuests(prev => [...prev, newQuest]);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save quest.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteQuest(deleteTarget);
      setQuests(prev => prev.filter(q => q._id !== deleteTarget));
    } catch {
      alert("Failed to delete quest.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Game Quests</h2>
          <p className={styles.subtitle}>Create multi-location quests with XP rewards and badges.</p>
        </div>
        <button className={styles.addBtn} onClick={openModal}>
          <span className="material-symbols-outlined">add_task</span>
          Add Quest
        </button>
      </div>

      {}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined">map</span>
          <div>
            <p className={styles.statVal}>{quests.length}</p>
            <p className={styles.statLabel}>Total Quests</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined">add_diamond</span>
          <div>
            <p className={styles.statVal}>
              {quests.reduce((sum, q) => sum + (q.bonus_xp ?? 0), 0)}
            </p>
            <p className={styles.statLabel}>Total XP Pool</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined">location_on</span>
          <div>
            <p className={styles.statVal}>
              {quests.reduce((sum, q) => sum + (q.locations?.length ?? 0), 0)}
            </p>
            <p className={styles.statLabel}>Locations Linked</p>
          </div>
        </div>
      </div>

      {}
      {loading ? (
        <div className={styles.empty}>Loading quests...</div>
      ) : quests.length === 0 ? (
        <div className={styles.empty}>No quests yet. Create your first one!</div>
      ) : (
        <div className={styles.grid}>
          {quests.map(quest => (
            <div key={quest._id} className={styles.card}>
              <div className={styles.cardHeader}>
                {quest.badge_url && (
                  <img src={quest.badge_url} alt="badge" className={styles.badge} />
                )}
                <div className={styles.cardTitles}>
                  <h3 className={styles.questTitle}>{quest.title_en || quest.title}</h3>
                  <p className={styles.questTitleAr}>{quest.title}</p>
                </div>
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget(quest._id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>

              {quest.description_en && (
                <p className={styles.questDesc}>{quest.description_en}</p>
              )}

              <div className={styles.cardMeta}>
                <span className={styles.xpBadge}>
                  <span className="material-symbols-outlined">add_diamond</span>
                  {quest.bonus_xp} XP
                </span>
                {quest.title_reward && (
                  <span className={styles.rewardBadge}>
                    <span className="material-symbols-outlined">emoji_events</span>
                    {quest.title_reward}
                  </span>
                )}
              </div>

              {quest.locations?.length > 0 && (
                <div className={styles.locChips}>
                  <p className={styles.chipsLabel}>Locations</p>
                  <div className={styles.chips}>
                    {quest.locations.slice(0, 3).map((loc, i) => (
                      <span key={i} className={styles.chip}>
                        {typeof loc === "object" ? (loc.name_en || loc.name) : loc}
                      </span>
                    ))}
                    {quest.locations.length > 3 && (
                      <span className={styles.chip}>+{quest.locations.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {}
      <div className={`${styles.overlay} ${showModal ? styles.overlayVisible : ""}`} onClick={closeModal}>
        <div className={`${styles.modal} ${showModal ? styles.modalVisible : ""}`} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Add New Quest</h3>
            <button className={styles.closeBtn} onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.row2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Arabic Title *</label>
                <input className={styles.input} placeholder="عنوان المهمة" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>English Title</label>
                <input className={styles.input} placeholder="Quest Title" value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Arabic Description</label>
              <textarea className={styles.textarea} rows={2} placeholder="وصف المهمة..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>English Description</label>
              <textarea className={styles.textarea} rows={2} placeholder="Describe this quest..." value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} />
            </div>

            <div className={styles.row3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Bonus XP</label>
                <input type="number" className={styles.input} placeholder="200" value={form.bonus_xp} onChange={e => setForm({ ...form, bonus_xp: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Title Reward</label>
                <input className={styles.input} placeholder="e.g. Explorer" value={form.title_reward} onChange={e => setForm({ ...form, title_reward: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Start Coordinates</label>
                <input className={styles.input} placeholder="31.9, 35.9" value={form.coordinatesInput} onChange={e => setForm({ ...form, coordinatesInput: e.target.value })} />
              </div>
            </div>

            {}
            <div className={styles.formGroup}>
              <label className={styles.label}>Linked Locations</label>
              {allLocations.length === 0 ? (
                <p className={styles.noLocText}>No locations available.</p>
              ) : (
                <div className={styles.locPicker}>
                  {allLocations.map(loc => (
                    <label key={loc._id} className={`${styles.locOption} ${selectedLocations.includes(loc._id) ? styles.locSelected : ""}`}>
                      <input type="checkbox" checked={selectedLocations.includes(loc._id)} onChange={() => toggleLocation(loc._id)} style={{ display: "none" }} />
                      <span className="material-symbols-outlined">{selectedLocations.includes(loc._id) ? "check_circle" : "radio_button_unchecked"}</span>
                      {loc.name_en || loc.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {}
            <div className={styles.row2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Completion Badge</label>
                <label className={styles.uploadLabel}>
                  {badgePreview
                    ? <img src={badgePreview} alt="badge" className={styles.assetPreview} />
                    : <><span className="material-symbols-outlined">military_tech</span><span>Upload Badge</span></>
                  }
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, "badge")} hidden />
                </label>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Map Icon</label>
                <label className={styles.uploadLabel}>
                  {iconPreview
                    ? <img src={iconPreview} alt="icon" className={styles.assetPreview} />
                    : <><span className="material-symbols-outlined">pin_drop</span><span>Upload Icon</span></>
                  }
                  <input type="file" accept="image/*" onChange={e => handleFileChange(e, "icon")} hidden />
                </label>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Quest"}
            </button>
          </div>
        </div>
      </div>

      {}
      {deleteTarget && (
        <div className={`${styles.overlay} ${styles.overlayVisible}`} onClick={() => setDeleteTarget(null)}>
          <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#dc2626" }}>delete_forever</span>
            <h3 className={styles.modalTitle}>Delete this quest?</h3>
            <p className={styles.deleteBody}>This action cannot be undone.</p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quests;
