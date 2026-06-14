import { useEffect, useRef, useState } from "react";
import styles from "./SharePopup.module.css";
import { X, Copy, Check } from "lucide-react";
import WhatsappImage from "/icons/share/whatsapp.png";
import FacebookImage from "/icons/share/facebook.png";
import InstagramImage from "/icons/share/instagram.png";
import TelegramImage from "/icons/share/telegram.png";
import XImage from "/icons/share/x.png";
import EmailImage from "/icons/share/email.png";

const PLATFORMS = [
  {
    label: "WhatsApp",
    icon: WhatsappImage,
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
  },
  {
    label: "Instagram",
    icon: InstagramImage,
    
    getUrl: (url, title) =>
      `https://www.instagram.com/`,
  },
  {
    label: "X",
    icon: XImage,
    getUrl: (url, title) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    label: "Facebook",
    icon: FacebookImage,
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    label: "Telegram",
    icon: TelegramImage,
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    label: "Email",
    icon: EmailImage,
    getUrl: (url, title) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
];

const SharePopup = ({ onClose, shareUrl, shareTitle = "Check this out!" }) => {
  const [copied, setCopied] = useState(false);
  const popupRef = useRef();

  
  useEffect(() => {
    function handler(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  
  useEffect(() => {
    function handler(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function openPlatform(platform) {
    window.open(platform.getUrl(shareUrl, shareTitle), "_blank", "noopener,noreferrer");
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.popup} ref={popupRef}>
        <div className={styles.header}>
          <span className={styles.title}>Share</span>
          <button className={styles["close-btn"]} onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className={styles.platforms}>
          {PLATFORMS.map((platform) => (
            <button
              key={platform.label}
              className={styles["platform-btn"]}
              onClick={() => openPlatform(platform)}
              aria-label={`Share on ${platform.label}`}
            >
              <div className={`${styles["platform-icon"]} ${platform.icon === InstagramImage ? styles.insta : ""}`}>
                <img src={platform.icon} alt={platform.label} />
              </div>
            </button>
          ))}
        </div>

        <div className={styles["copy-row"]}>
          <span className={styles["copy-url"]}>{shareUrl}</span>
          <button
            className={`${styles["copy-btn"]} ${copied ? styles.copied : ""}`}
            onClick={copyLink}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;