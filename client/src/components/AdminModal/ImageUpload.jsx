import { useState, useRef } from "react";
import styles from "./AdminModal.module.css";

function ImageUpload({ value, onChange, multiple = false, label = "Upload Image" }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (multiple) {
      // For multiple files, convert to base64
      const readers = files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then((results) => {
        const existingImages = value || [];
        onChange([...existingImages, ...results]);
      });
    } else {
      // For single file
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          onChange(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index) => {
    if (multiple) {
      onChange(value.filter((_, i) => i !== index));
    } else {
      onChange(null);
    }
  };

  if (multiple) {
    return (
      <div className={styles.formGroup}>
        <label className={styles.label}>{label}</label>
        <div className={styles.multiImageUpload}>
          {value && value.length > 0 && (
            <div className={styles.imagePreviewGrid}>
              {value.map((img, index) => (
                <div key={index} className={styles.multiImagePreview}>
                  <img src={img} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => removeImage(index)}
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className={styles.uploadLabelSmall}>
            <span className="material-symbols-outlined">add_photo_alternate</span>
            <span>Add Photos</span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>
      </div>
    );
  }

  // Single image upload
  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.imageUpload}>
        {value ? (
          <div className={styles.imagePreview}>
            <img src={value} alt="Preview" />
            <button
              type="button"
              className={styles.removeImageBtn}
              onClick={() => onChange(null)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ) : (
          <label className={styles.uploadLabel}>
            <span className="material-symbols-outlined">
              add_photo_alternate
            </span>
            <span>Upload Photo</span>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </label>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;