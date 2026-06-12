import { useState } from "react";
import styles from "./Support.module.css";
import { ADMIN_AVATARS } from "../../admin/AdminChat";
import emailjs from "@emailjs/browser";

import HussamImage from "/team/hussam.jpeg";

const team = [

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
    name: "Hussam Azzam",
    phone: "0781090881",
    img: HussamImage,
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
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmail = (name) => {
    window.location.href = `mailto:?subject=Contact ${name}&body=Hello,`;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) return;

    setLoading(true);
    setError(false);

    try {
      const result = await emailjs.send(
        "service_ul4p4wa",
        "template_99n9soa",
        {
          title: form.subject,
          from_name: form.name,
          report_type: "Support Request",
          description: form.message,
          user_email: form.email,
          timestamp: new Date().toLocaleString(),
          url: window.location.href,
          user_agent: navigator.userAgent,
        },
        "rbo-ghwiPkjXWIrvu"
      );
      console.log("EmailJS success:", result);
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("EmailJS error:", err);
      setError(true);
      setTimeout(() => setError(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Contact Support</h1>
        <p className={styles.subtitle}>
          Our dedicated editorial support team is here to assist with any
          technical inquiries, archive management, or platform assistance. We
          aim to respond to all inquiries within two business hours.
        </p>
      </div>

      <div className={styles.container}>
        <div className={styles.mainGrid}>
          {/* Form */}
          <div className={styles.formCard}>
            {sent && (
              <div className={styles.successBanner}>
                <span className="material-symbols-outlined">check_circle</span>
                Message sent! We'll get back to you shortly.
              </div>
            )}
            {error && (
              <div className={styles.errorBanner}>
                <span className="material-symbols-outlined">error</span>
                Something went wrong. Please try again.
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
                  Email
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

            <button
              className={styles.sendBtn}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined"></span>
                  Sending...
                </>
              ) : (
                <>
                  <span className={`${styles.sendIcon} material-symbols-outlined`}></span>

                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>

          {/* Sidebar */}
          <div className={styles.infoCol}>
            <div className={styles.immediateCard}>
              <h3 className={styles.immediateTitle}>Immediate Assistance</h3>
              <p className={styles.immediateText}>
                For urgent server-side issues or critical access failures, please
                use the direct hotline below.
              </p>
              <div className={styles.contactItem}>
                <span className="material-symbols-outlined">call</span>
                <span>+962781668565</span>
              </div>
              <div className={styles.contactItem}>
                <span className="material-symbols-outlined">mail</span>
                <span>abedalrhmanabood12@gmail.com</span>
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
                  <img src={member.img} alt={member.name} />
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
      </div>
    </div>
  );
}

export default Support;