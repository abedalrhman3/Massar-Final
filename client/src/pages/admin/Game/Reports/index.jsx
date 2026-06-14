import { useState, useEffect } from "react";
import styles from "./Reports.module.css";
import { getReportedPhotos, deletePhoto, reviewPhoto } from "@/api/admin";

function Reports() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [deletePhotoOpt, setDeletePhotoOpt] = useState(false);
  const [banUserOpt, setBanUserOpt] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

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

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await reviewPhoto(id, 'approve');
      setPhotos(prev => prev.filter(p => p._id !== id));
    } catch {
      alert('Failed to approve photo.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id, reason, deletePhoto, banUser) => {
    setProcessingId(id);
    setConfirmAction(null);
    try {
      await reviewPhoto(id, 'reject', reason, deletePhoto, banUser);
      setPhotos(prev => prev.filter(p => p._id !== id));
    } catch {
      alert('Failed to reject photo.');
    } finally {
      setProcessingId(null);
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
              <div
                className={styles.imgWrapper}
                onClick={() => setLightboxPhoto(photo.photo_url)}
                style={{ cursor: "pointer" }}
                title="Click to view full size"
              >
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
                <div className={styles.actionButtons}>
                  <button
                    className={styles.acceptBtn}
                    onClick={() => handleApprove(photo._id)}
                    disabled={processingId !== null}
                  >
                    <span className="material-symbols-outlined">
                      {processingId === photo._id ? "hourglass_empty" : "check_circle"}
                    </span>
                    {processingId === photo._id ? "..." : "Accept"}
                  </button>
                  <button
                    className={styles.rejectBtn}
                    onClick={() => {
                      setRejectionReason("");
                      setDeletePhotoOpt(false);
                      setBanUserOpt(false);
                      setConfirmAction({
                        photoId: photo._id,
                        action: 'reject_step1',
                        username: photo.user_id?.username || photo.user_id?.name || "Unknown User"
                      });
                    }}
                    disabled={processingId !== null}
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {}
      {confirmAction && (
        <div className={styles.overlay} onClick={() => setConfirmAction(null)}>
          <div className={styles.confirmModal} onClick={e => e.stopPropagation()}>
            {confirmAction.action === 'reject_step1' ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "2.8rem", color: "#ea580c" }}>cancel</span>
                <h3 className={styles.modalTitle}>Reject Photo (Step 1 of 2)</h3>
                <p className={styles.modalBody}>
                  Please specify the reason for rejecting this photo. This message will be shown to the user in their gallery.
                </p>
                <textarea
                  className={styles.reasonInput}
                  placeholder="e.g. This photo does not depict the requested quest landmark."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
                <div className={styles.modalActions}>
                  <button className={styles.cancelBtn} onClick={() => setConfirmAction(null)}>Cancel</button>
                  <button
                    className={styles.confirmRejectBtn}
                    disabled={!rejectionReason.trim()}
                    onClick={() => setConfirmAction(prev => ({ ...prev, action: 'reject_step2' }))}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : confirmAction.action === 'reject_step2' ? (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: "2.8rem", color: "#dc2626" }}>settings</span>
                <h3 className={styles.modalTitle}>Optional Actions (Step 2 of 2)</h3>
                <p className={styles.modalBody}>
                  Select additional actions to apply to this rejected photo or user.
                </p>
                <div className={styles.optionsList}>
                  {






}
                  <label className={styles.optionLabel}>
                    <input
                      type="checkbox"
                      checked={banUserOpt}
                      onChange={(e) => setBanUserOpt(e.target.checked)}
                    />
                    <span style={{ color: banUserOpt ? '#dc2626' : 'inherit', fontWeight: banUserOpt ? '600' : 'normal' }}>
                      Ban user: {confirmAction.username}
                    </span>
                  </label>
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setConfirmAction(prev => ({ ...prev, action: 'reject_step1' }))}
                  >
                    Back
                  </button>
                  <button
                    className={styles.confirmRejectBtn}
                    onClick={() => handleReject(confirmAction.photoId, rejectionReason, deletePhotoOpt, banUserOpt)}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {}
      {lightboxPhoto && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxPhoto(null)}>
          <button className={styles.lightboxCloseBtn} onClick={() => setLightboxPhoto(null)}>
            <span className="material-symbols-outlined">close</span>
          </button>
          <img
            src={lightboxPhoto}
            alt="Full-size reported item"
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default Reports;
