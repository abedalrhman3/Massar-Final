// Imports: child components, styles, React hooks, and company info for the system prompt
import ChatbotIcon from "./ChatbotIcon";
import styles from "./Chatbot.module.css";
import ChatForm from "./ChatForm";
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import { companyInfo } from "./ChatbotData";
const chatbot = "images/homepage/chatbot.png";

function Chatbot() {
  // Chat history state — initialized with a hidden system prompt (companyInfo)
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  // Controls whether the chatbot popup is visible
  const [showChatbot, setShowChatbot] = useState(false);

  // Ref to the chat body for auto-scrolling
  const chatBodyRef = useRef();

  // Sends chat history to our Python Backend safely
  const generateBotResponse = async (history) => {
    // Replaces "Thinking..." with the actual bot response or error message
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    // FIX: Filter out the temporary "Thinking..." message so the backend never sees it
    const cleanHistory = history.filter((msg) => msg.text !== "Thinking...");

    // Format the clean history into standard format for our Backend
    const formattedHistory = cleanHistory.map(({ role, text, file }) => ({
      role: role === "model" ? "assistant" : "user",
      content: text,
      ...(file?.data
        ? { file_data: file.data, mime_type: file.mime_type }
        : {}),
    }));

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: formattedHistory, // Send only the true chat conversation
      }),
    };

    try {
      const backendUrl =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api/chat";
      const response = await fetch(backendUrl, requestOptions);

      const textData = await response.text();

      if (!response.ok) {
        throw new Error(textData || "Server returned an error status.");
      }

      const data = JSON.parse(textData);
      updateHistory(data.reply.trim());
    } catch (error) {
      console.error("Chatbot Fetch Error:", error);
      updateHistory(
        "Couldn't connect to Masar Server. Make sure your Python backend is running on port 5000!",
        true,
      );
    }
  };

  // Auto-scroll to bottom whenever chat history updates
  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  return (
    // Add showChatbot class to container to trigger CSS visibility
    <div
      className={`${styles.container} ${showChatbot ? styles.showChatbot : ""}`}
    >
      {/* Floating avatar toggle button — opens/closes the chatbot */}
      <div className={styles.avatarWrapper}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarTooltip}>
            <span>How can I help you?</span>
          </div>
          <img
            className={`${styles.avatarImg} ${showChatbot ? styles.avatarOpen : ""}`}
            src={chatbot}
            alt="avatar"
            onClick={() => setShowChatbot((prev) => !prev)}
          />
        </div>
      </div>

      <div className={styles.chatbotPopup}>
        {/* Header — shows bot icon, name, and close button */}
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <ChatbotIcon />
            <h2 className={styles.logoText}>Chatbot</h2>
          </div>
          <button
            onClick={() => setShowChatbot((prev) => !prev)}
            className={`${styles.materialSymbolsRounded} ${styles.closeBtn}`}
          >
            keyboard_arrow_down
          </button>
        </div>

        {/* Body — displays welcome message and dynamic chat history */}
        <div ref={chatBodyRef} className={styles.chatBody}>
          {/* Static welcome message */}
          <div className={`${styles.message} ${styles.botMessage}`}>
            <ChatbotIcon />
            <p className={styles.messageText}>
              Welcome to Masar! Your journey through Jordan's beauty starts
              here.
              <br />
              Whether you're looking for hidden gems, historical landmarks, or
              cultural experiences — I'm here to guide you.
              <br />
              Where would you like to explore today?
            </p>
          </div>

          {/* Render each message in chat history */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Footer — contains the chat input form */}
        <div className={styles.chatFooter}>
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
