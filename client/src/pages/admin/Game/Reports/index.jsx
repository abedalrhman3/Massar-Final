import { useState, useEffect } from "react";
import styles from "./Reports.module.css";
import { getReportedPhotos, deletePhoto, reviewPhoto } from "@/api/admin";

function Reports() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPhotos = async () => {
    try {
      const res = await getReportedPhotos();
      const data = res.data?.data ?? res.data ?? [];
      setPhotos(Array.isArray(data) ? data : []);
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const confirmDelete = async () => {
    try {
      await deletePhoto(deleteTarget);
      setPhotos(prev => prev.filter(p => p._id !== deleteTarget));
    } catch {
      alert("Failed to delete photo.");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleApprove = async (id) => {
    try {
      await reviewPhoto(id, 'approve');
      setPhotos(prev => prev.filter(p => p._id !== id));
    } catch {
      alert('Failed to approve photo.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleReject = async (id) => {
    try {
      await reviewPhoto(id, 'reject');
      setPhotos(prev => prev.filter(p => p._id !== id));
    } catch {
      alert('Failed to reject photo.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Reported Photos</h2>
          <p className={styles.subtitle}>Review and remove community photos flagged by users.</p>
        </div>
        <div className={styles.countBadge}>
          <span className="material-symbols-outlined">flag</span>
          {photos.length} Reports
        </div>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading reported photos...</div>
      ) : photos.length === 0 ? (
        <div className={styles.emptyState}>
          <span className="material-symbols-outlined">check_circle</span>
          <h3>No reported photos</h3>
          <p>All clear! No community content has been flagged.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {photos.map(photo => (
            <div key={photo._id} className={styles.card}>
              <div className={styles.imgWrapper}>
                <img
                  src={photo.photo_url}
                  alt="Reported"
                  className={styles.img}
                  onError={e => { e.target.src = "https://via.placeholder.com/300x200?text=Image+Error"; }}
                />
                <div className={styles.reportBadge}>
                  <span className="material-symbols-outlined">flag</span>
                  Reported
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.userRow}>
                  <span className="material-symbols-outlined">person</span>
                  <span className={styles.username}>{photo.user_id?.username || photo.user_id?.name || "Unknown User"}</span>
                </div>
                {photo.location_id && (
                  <div className={styles.locRow}>
                    <span className="material-symbols-outlined">location_on</span>
                    <span className={styles.locName}>
                      {typeof photo.location_id === "object"
                        ? (photo.location_id.name_en || photo.location_id.name)
                        : photo.location_id}
                    </span>
                  </div>
                )}
                {photo.createdAt && (
                  <p className={styles.date}>{new Date(photo.createdAt).toLocaleDateString()}</p>
                )}
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget(photo._id)}>
                  <span className="material-symbols-outlined">delete</span>
                  Delete Photo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.deleteModal} onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined" style={{ fontSize: "2.5rem", color: "#dc2626" }}>delete_forever</span>
            <h3 className={styles.modalTitle}>Review reported photo</h3>
            <p className={styles.deleteBody}>Choose an action for this reported photo.</p>
            <div className={styles.deleteActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleApprove(deleteTarget)}>Approve</button>
              <button className={styles.confirmDeleteBtn} onClick={() => handleReject(deleteTarget)}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
