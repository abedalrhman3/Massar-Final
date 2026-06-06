import styles from "./AdminModal.module.css";

function ContactList({ value = [], onChange, label = "Contact", required = false }) {
  const CONTACT_TYPES = [
    { id: "phone", label: "Phone" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "email", label: "Email" },
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
    { id: "x", label: "X (Twitter)" },
    { id: "website", label: "Website" },
  ];

  const addContact = () => {
    onChange([...value, { type: "phone", value: "" }]);
  };

  const updateContactType = (index, newType) => {
    const updated = [...value];
    updated[index].type = newType;
    onChange(updated);
  };

  const updateContactValue = (index, newValue) => {
    const updated = [...value];
    updated[index].value = newValue;
    onChange(updated);
  };

  const removeContact = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      <div className={styles.contactList}>
        {value.map((contact, index) => (
          <div key={index} className={styles.contactItem} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <select
              className={styles.input}
              style={{ width: "35%" }}
              value={contact.type}
              onChange={(e) => updateContactType(index, e.target.value)}
            >
              {CONTACT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <input
              type="text"
              className={styles.input}
              style={{ width: "65%" }}
              placeholder="Enter contact info"
              value={contact.value}
              onChange={(e) => updateContactValue(index, e.target.value)}
            />
            <button
              type="button"
              className={styles.removeContactBtn}
              onClick={() => removeContact(index)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem" }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addContactBtn}
          onClick={addContact}
          style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", fontWeight: "500", marginTop: "0.5rem" }}
        >
          <span className="material-symbols-outlined">add</span>
          Add Contact
        </button>
      </div>
      {required && value.length === 0 && (
        <span className={styles.errorText} style={{ color: "#ef4444", fontSize: "0.875rem", marginTop: "0.25rem", display: "block" }}>At least one contact is required</span>
      )}
    </div>
  );
}

export default ContactList;