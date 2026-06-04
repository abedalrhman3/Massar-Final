import styles from "./AdminModal.module.css";

function ContactList({ value = [], onChange, label = "Contact", required = false }) {
  const addContact = () => {
    onChange([...value, ""]);
  };

  const updateContact = (index, newValue) => {
    const updated = [...value];
    updated[index] = newValue;
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
          <div key={index} className={styles.contactItem}>
            <input
              type="text"
              className={styles.input}
              placeholder="Enter contact info"
              value={contact}
              onChange={(e) => updateContact(index, e.target.value)}
            />
            <button
              type="button"
              className={styles.removeContactBtn}
              onClick={() => removeContact(index)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.addContactBtn}
          onClick={addContact}
        >
          <span className="material-symbols-outlined">add</span>
          Add Contact
        </button>
      </div>
      {required && value.length === 0 && (
        <span className={styles.errorText}>At least one contact is required</span>
      )}
    </div>
  );
}

export default ContactList;