// Imports: markdown renderer, bot icon, and styles
import ReactMarkdown from "react-markdown";
import ChatbotIcon from "./ChatbotIcon";
import styles from "./Chatbot.module.css";

// Renders a single chat message — either bot or user
function ChatMessage({ chat }) {
  return (
    // Skip rendering if the message is marked as hidden (e.g. system prompt)
    !chat.hideInChat && (
      <div
        // Apply base message class + role-based class (botMessage/userMessage) + error class if needed
        className={`${styles.message} ${chat.role === "model" ? styles.botMessage : styles.userMessage} ${chat.isError ? styles.error : ""}`}
      >
        {/* Show bot icon only for model messages */}
        {chat.role === "model" && <ChatbotIcon />}

        <div className={styles.messageText}>
          {chat.text === "Thinking..." ? (
            // Show animated thinking dots while waiting for bot response
            <div className={styles.thinkingIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          ) : (
            // Render bot/user message text as markdown
            <ReactMarkdown>{chat.text}</ReactMarkdown>
          )}
        </div>

        {/* Show attached image if the message has a file */}
        {chat.file && (
          <img
            src={chat.file.previewUrl}
            alt="attachment"
            className={styles.attachment}
          />
        )}
      </div>
    )
  );
}

export default ChatMessage;
