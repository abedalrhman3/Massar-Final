import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Support.module.css";
import { ADMIN_AVATARS } from "../../admin/AdminChat";

const team = [
  {
    name: "Hussam Azzam",
    phone: "+1(555)902-1143",
    img: ADMIN_AVATARS["Hussam Azzam"],
  },
  {
    name: "Osama Alazab",
    phone: "+1(555)438-2910",
    img: ADMIN_AVATARS["Osama Alazab"],
  },
  {
    name: "Mr. Shelby",
    phone: "+1(555)762-8812",
    img: ADMIN_AVATARS["Mr. Shelby"],
  },
  {
    name: "Mr. Cash",
    phone: "+1(555)321-0094",
    img: ADMIN_AVATARS["Mr. Cash"],
  },
  {
    name: "Mohammad Alrawadyah",
    phone: "+1(555)554-1290",
    img: ADMIN_AVATARS["Mohammad Alrawadyah"],
  },
];
function Support() {
  const handleEmail = (name) => {
    window.location.href = `mailto:?subject=Contact ${name}&body=Hello,`;
  };

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (form.name && form.email && form.subject && form.message) {
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setForm({ name: "", email: "", subject: "", message: "" });
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Contact Support</h1>
      <p className={styles.subtitle}>
        Our dedicated editorial support team is here to assist with any
        technical inquiries, archive management, or platform assistance. We aim
        to respond to all inquiries within two business hours.
      </p>

      <div className={styles.mainGrid}>
        {/* Form */}
        <div className={styles.formCard}>
          {sent && (
            <div className={styles.successBanner}>
              <span className="material-symbols-outlined">check_circle</span>
              Message sent! We'll get back to you shortly.
            </div>
          )}

          <div className={styles.formRow}>
            {/* Name */}
            <div className={styles.inputWrapper}>
              <input
                type="text"
                id="field-name"
                name="name"
                autoComplete="off"
                placeholder=" "
                className={styles.inputField}
                value={form.name}
                onChange={handleChange}
              />
              <label htmlFor="field-name" className={styles.inputLabel}>
                Your Full Name
              </label>
            </div>

            {/* Email */}
            <div className={styles.inputWrapper}>
              <input
                type="email"
                id="field-email"
                name="email"
                autoComplete="off"
                placeholder=" "
                className={styles.inputField}
                value={form.email}
                onChange={handleChange}
              />
              <label htmlFor="field-email" className={styles.inputLabel}>
                Work Email
              </label>
            </div>
          </div>

          {/* Subject */}
          <div className={styles.inputWrapper}>
            <input
              type="text"
              id="field-subject"
              name="subject"
              autoComplete="off"
              placeholder=" "
              className={styles.inputField}
              value={form.subject}
              onChange={handleChange}
            />
            <label htmlFor="field-subject" className={styles.inputLabel}>
              Subject
            </label>
          </div>

          {/* Message */}
          <div className={styles.textareaWrapper}>
            <textarea
              id="field-message"
              name="message"
              placeholder=" "
              className={styles.textareaField}
              value={form.message}
              onChange={handleChange}
              rows={5}
            />
            <label htmlFor="field-message" className={styles.textareaLabel}>
              Detailed description of your request...
            </label>
          </div>

          <button className={styles.sendBtn} onClick={handleSubmit}>
            Send Message
          </button>
        </div>

        {/* Sidebar info */}
        <div className={styles.infoCol}>
          <div className={styles.immediateCard}>
            <h3 className={styles.immediateTitle}>Immediate Assistance</h3>
            <p className={styles.immediateText}>
              For urgent server-side issues or critical access failures, please
              use the direct hotline below.
            </p>
            <div className={styles.contactItem}>
              <span className="material-symbols-outlined">call</span>
              <span>+1 (888) 555-ARCHIVE</span>
            </div>
            <div className={styles.contactItem}>
              <span className="material-symbols-outlined">mail</span>
              <span>concierge@editorialarchive.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className={styles.teamSection}>
        <h2 className={styles.teamTitle}>Our Support Team</h2>
        <div className={styles.teamGrid}>
          {team.map((member, i) => (
            <div key={i} className={styles.teamCard}>
              <div className={styles.memberAvatar}>
                <img src={member.img} alt={member.name} />{" "}
              </div>
              <h4 className={styles.memberName}>{member.name}</h4>
              <p className={styles.memberPhone}>{member.phone}</p>
              <div className={styles.memberActions}>
                <button
                  className={styles.memberBtn}
                  title="Email"
                  onClick={() => handleEmail(member.name)}
                >
                  <span className="material-symbols-outlined">
                    alternate_email
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© 2024 The Editorial Archive. All Rights Reserved.</span>
        <div className={styles.footerLinks}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Privacy Policy");
            }}
          >
            Privacy Policy
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Service Status: All systems operational");
            }}
          >
            Service Status
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Opening Documentation...");
            }}
          >
            Documentation
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Support;
