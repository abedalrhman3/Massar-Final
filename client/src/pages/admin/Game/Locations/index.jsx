import { useState, useEffect } from "react";
import styles from "./Locations.module.css";
import { getLocations, createLocation, deleteLocation } from "@/api/locations";

const emptyForm = {
  name: "",
  name_en: "",
  description: "",
  description_en: "",
  budget_category: "Medium",
  average_cost: "",
  xp_reward: 100,
  coordinatesInput: "",
};

const emptyTask = { description: "", description_en: "", xp: 50 };

function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tasks, setTasks] = useState([{ ...emptyTask }]);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState("");

  const fetchLocations = async () => {
    try {
      const res = await getLocations();
      setLocations(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch {
      setError("Failed to load locations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  const openModal = () => {
    setForm(emptyForm);
    setTasks([{ ...emptyTask }]);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setError(""); };

  const handleTaskChange = (i, field, value) => {
    const updated = [...tasks];
    updated[i] = { ...updated[i], [field]: value };
    setTasks(updated);
  };

  const addTask = () => setTasks([...tasks, { ...emptyTask }]);
  const removeTask = (i) => setTasks(tasks.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name || !form.name_en) { setError("Arabic and English names are required."); return; }
    if (!form.coordinatesInput) { setError("Coordinates are required."); return; }

    const [latStr, lngStr] = form.coordinatesInput.split(",");
    const lat = Number(latStr?.trim());
    const lng = Number(lngStr?.trim());
    if (isNaN(lat) || isNaN(lng)) { setError("Invalid coordinates. Use: 31.9522, 35.2332"); return; }

    setSaving(true);
    try {
      const res = await createLocation({
        name: form.name,
        name_en: form.name_en,
        description: form.description,
        description_en: form.description_en,
        budget_category: form.budget_category,
        average_cost: Number(form.average_cost),
        xp_reward: Number(form.xp_reward),
        coordinates: { lat, lng },
        tasks: tasks.filter(t => t.description.trim()),
      });
      const newLoc = res.data?.data ?? res.data;
      setLocations(prev => [...prev, newLoc]);
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save location.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteLocation(deleteTarget);
      setLocations(prev => prev.filter(l => l._id !== deleteTarget));
    } catch {
      alert("Failed to delete location.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const budgetColor = (cat) => {
    if (cat === "Low") return styles.tagLow;
    if (cat === "High") return styles.tagHigh;
    return styles.tagMedium;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Game Locations</h2>
          <p className={styles.subtitle}>Add and manage explorable game locations with tasks.</p>
        </div>
        <button className={styles.addBtn} onClick={openModal}>
          <span className="material-symbols-outlined">add_location_alt</span>
          Add Location
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined">location_on</span>
          <div>
            <p className={styles.statVal}>{locations.length}</p>
            <p className={styles.statLabel}>Total Locations</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined">monetization_on</span>
          <div>
            <p className={styles.statVal}>{locations.filter(l => l.budget_category === "Low").length}</p>
            <p className={styles.statLabel}>Low Budget</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined">star</span>
          <div>
            <p className={styles.statVal}>{locations.filter(l => l.budget_category === "Medium").length}</p>
            <p className={styles.statLabel}>Medium Budget</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <span className="material-symbols-outlined">diamond</span>
          <div>
            <p className={styles.statVal}>{locations.filter(l => l.budget_category === "High").length}</p>
            <p className={styles.statLabel}>High Budget</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.empty}>Loading locations...</div>
      ) : locations.length === 0 ? (
        <div className={styles.empty}>No locations yet. Add your first one!</div>
      ) : (
        <div className={styles.grid}>
          {locations.map(loc => (
            <div key={loc._id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.locName}>{loc.name_en || loc.name}</h3>
                  <p className={styles.locNameAr}>{loc.name}</p>
                </div>
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget(loc._id)} title="Delete">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
              <div className={styles.cardMeta}>
                <span className={`${styles.tag} ${budgetColor(loc.budget_category)}`}>{loc.budget_category}</span>
                <span className={styles.metaItem}>
                  <span className="material-symbols-outlined">payments</span>
                  {loc.average_cost} JD
                </span>
                <span className={styles.metaItem}>
                  <span className="material-symbols-outlined">add_diamond</span>
                  {loc.xp_reward ?? 0} XP
                </span>
              </div>
              {loc.tasks?.length > 0 && (
                <div className={styles.tasksList}>
                  <p className={styles.tasksTitle}>Tasks ({loc.tasks.length})</p>
                  {loc.tasks.slice(0, 2).map((t, i) => (
                    <div key={i} className={styles.taskRow}>
                      <span className="material-symbols-outlined">task_alt</span>
                      <span>{t.description_en || t.description}</span>
                      <span className={styles.taskXp}>+{t.xp} XP</span>
                    </div>
                  ))}
                  {loc.tasks.length > 2 && <p className={styles.moreTasks}>+{loc.tasks.length - 2} more</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <div className={`${styles.overlay} ${showModal ? styles.overlayVisible : ""}`} onClick={closeModal}>
        <div className={`${styles.modal} ${showModal ? styles.modalVisible : ""}`} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Add New Location</h3>
            <button className={styles.closeBtn} onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles.modalBody}>
            <div className={styles.row2}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Arabic Name *</label>
                <input className={styles.input} placeholder="اسم الموقع" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>English Name *</label>
                <input className={styles.input} placeholder="Location Name" value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Arabic Description</label>
              <textarea className={styles.textarea} rows={2} placeholder="وصف الموقع..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>English Description</label>
              <textarea className={styles.textarea} rows={2} placeholder="Describe this location..." value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} />
            </div>

            <div className={styles.row3}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Budget Category</label>
                <select className={styles.input} value={form.budget_category} onChange={e => setForm({ ...form, budget_category: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Average Cost (JD)</label>
                <input type="number" className={styles.input} placeholder="e.g. 35" value={form.average_cost} onChange={e => setForm({ ...form, average_cost: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>XP Reward</label>
                <input type="number" className={styles.input} placeholder="e.g. 100" value={form.xp_reward} onChange={e => setForm({ ...form, xp_reward: e.target.value })} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Coordinates *</label>
              <input className={styles.input} placeholder="e.g. 30.3285, 35.4444" value={form.coordinatesInput} onChange={e => setForm({ ...form, coordinatesInput: e.target.value })} />
            </div>

            {/* Tasks */}
            <div className={styles.tasksSection}>
              <div className={styles.tasksSectionHeader}>
                <h4 className={styles.sectionTitle}>Tasks</h4>
                <button className={styles.addTaskBtn} type="button" onClick={addTask}>
                  <span className="material-symbols-outlined">add</span> Add Task
                </button>
              </div>
              {tasks.map((task, i) => (
                <div key={i} className={styles.taskCard}>
                  <div className={styles.taskCardHeader}>
                    <span className={styles.taskNum}>Task {i + 1}</span>
                    {tasks.length > 1 && (
                      <button className={styles.removeTaskBtn} type="button" onClick={() => removeTask(i)}>
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    )}
                  </div>
                  <div className={styles.row2}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Arabic Description</label>
                      <input className={styles.input} placeholder="وصف المهمة" value={task.description} onChange={e => handleTaskChange(i, "description", e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>English Description</label>
                      <input className={styles.input} placeholder="Task description" value={task.description_en} onChange={e => handleTaskChange(i, "description_en", e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>XP Reward</label>
                    <input type="number" className={styles.input} value={task.xp} onChange={e => handleTaskChange(i, "xp", e.target.value)} style={{ maxWidth: "140px" }} />
                  </div>
                </div>
              ))}
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Location"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className={`${styles.overlay} ${styles.overlayVisible}`} onClick={() => setDeleteTarget(null)}>
          <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#dc2626" }}>delete_forever</span>
            <h3 className={styles.modalTitle}>Delete this location?</h3>
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

export default Locations;
