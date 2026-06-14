
import ReactMarkdown from "react-markdown";
import ChatbotIcon from "./ChatbotIcon";
import styles from "./Chatbot.module.css";


function ChatMessage({ chat }) {
  return (
    
    !chat.hideInChat && (
      <div
        
        className={`${styles.message} ${chat.role === "model" ? styles.botMessage : styles.userMessage} ${chat.isError ? styles.error : ""}`}
      >
        {}
        {chat.role === "model" && <ChatbotIcon />}

        <div className={styles.messageText}>
          {chat.text === "Thinking..." ? (
            
            <div className={styles.thinkingIndicator}>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
              <div className={styles.dot}></div>
            </div>
          ) : (
            
            <ReactMarkdown>{chat.text}</ReactMarkdown>
          )}
        </div>

        {}
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
