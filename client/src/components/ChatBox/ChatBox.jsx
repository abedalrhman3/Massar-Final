import { useState, useEffect, useRef } from "react";
import styles from "./ChatBox.module.css";

const mockMessages = [
  { id: 1, sender: "system", text: "Welcome to Massar Support! How can we help you today?", time: "10:30 AM" },
  { id: 2, sender: "user", text: "Hi, I need help with updating a destination.", time: "10:31 AM" },
  { id: 3, sender: "system", text: "Of course! You can edit destinations from the Destinations Management page. Click on any destination card and use the edit option in the menu.", time: "10:32 AM" },
];

function ChatBox({ isOpen, onClose }) {
  const [messages, setMessages] = useState(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: inputValue,
      time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "system",
          text: "Thanks for your message! Our team will get back to you shortly.",
          time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.chatBox} ${isMinimized ? styles.minimized : ""}`}
      style={{ viewTransitionName: "chat-panel" }}
    >
      <div className={styles.header} onClick={() => setIsMinimized(!isMinimized)}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <div className={styles.headerInfo}>
            <h4>Massar Support</h4>
            <span className={styles.status}>
              <span className={styles.statusDot}></span>
              Online
            </span>
          </div>
        </div>
        <button className={styles.headerBtn} onClick={(e) => { e.stopPropagation(); onClose(); }}>
          <span className="material-symbols-outlined">{isMinimized ? "add" : "close"}</span>
        </button>
      </div>

      {!isMinimized && (
        <>
          <div className={styles.messages}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.sender === "user" ? styles.userMsg : styles.systemMsg}`}
              >
                <div className={styles.messageBubble}>
                  <p>{msg.text}</p>
                  <span className={styles.messageTime}>{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              className={styles.input}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!inputValue.trim()}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatBox;