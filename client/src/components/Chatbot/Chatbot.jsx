
import ChatbotIcon from "./ChatbotIcon";
import styles from "./Chatbot.module.css";
import ChatForm from "./ChatForm";
import { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import { companyInfo } from "./ChatbotData";
const chatbot = "/images/homepage/chatbot.png";

function Chatbot() {
  
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);

  
  const [showChatbot, setShowChatbot] = useState(false);

  
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(0);
  const msgCountRef = useRef(0); 

  
  const chatBodyRef = useRef();

  
  useEffect(() => {
    if (rateLimitRemaining <= 0) return;

    const timer = setInterval(() => {
      setRateLimitRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          msgCountRef.current = 0; 
          setIsLoading(false); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [rateLimitRemaining]);

  
  const generateBotResponse = async (history) => {
    
    if (rateLimitRemaining === 0) {
      setRateLimitRemaining(60); 
      msgCountRef.current = 1;
    } else {
      msgCountRef.current += 1;
    }

    const isLimitHit = msgCountRef.current >= 5;

    
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text, isError },
      ]);
    };

    
    const cleanHistory = history.filter((msg) => msg.text !== "Thinking...");

    
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
        messages: formattedHistory, 
      }),
    };

    try {
      setIsLoading(true);
      const backendUrl = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5002"}/api/chat`;
      const response = await fetch(backendUrl, requestOptions);

      const textData = await response.text();
      console.log("[DEBUG RATE LIMIT] Status:", response.status);
      console.log("[DEBUG RATE LIMIT] Body:", textData);
      console.log("SCAN RESPONSE RECEIVED:", textData);

      if (response.status === 429) {
        let data;
        try {
          data = JSON.parse(textData);
        } catch (e) {
          data = { reply: "Too many requests. Please try again later.", unblockTime: Math.floor(Date.now() / 1000) + 60 };
        }
        const remaining = Math.max(0, Math.ceil(data.unblockTime - (Date.now() / 1000)));
        setRateLimitRemaining(remaining);
        msgCountRef.current = 5; 
        updateHistory(data.reply, true);
        return;
      }

      if (!response.ok) {
        throw new Error(textData || "Server returned an error status.");
      }

      const data = JSON.parse(textData);
      updateHistory(data.reply.trim());
      
      
      if (!isLimitHit) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Chatbot Fetch Error:", error);
      
      let isRateLimit = false;
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.rateLimited) {
          isRateLimit = true;
          const remaining = Math.max(0, Math.ceil(parsed.unblockTime - (Date.now() / 1000)));
          setRateLimitRemaining(remaining);
          msgCountRef.current = 5; 
          updateHistory(parsed.reply, true);
        }
      } catch (e) {
        
      }

      if (!isRateLimit) {
        
        const errorMessage = error.message && !error.message.includes('Server returned')
          ? error.message
          : "Couldn't connect to Massar Server. Please make sure the backend is running on port 5000!";
        updateHistory(errorMessage, true);
        
        if (!isLimitHit) {
          setIsLoading(false);
        }
      }
    }
  };

  
  useEffect(() => {
    chatBodyRef.current.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatHistory]);

  const handleSafetyViolation = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: "model", text: "Inappropriate content was detected in your image. This incident has been flagged.", isError: true },
    ]);
  };

  return (
    
    <div

      className={`${styles.container} ${showChatbot ? styles.showChatbot : ""}`}
    >
      {}
      <div className={styles.avatarWrapper}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarTooltip}>
            <span>How can I help you?</span>
          </div>
          <img
            id="nav-chatbot"
            className={`${styles.avatarImg} ${showChatbot ? styles.avatarOpen : ""}`}
            src={chatbot}
            alt="avatar"
            onClick={() => setShowChatbot((prev) => !prev)}
          />
        </div>
      </div>

      <div className={styles.chatbotPopup}>
        {}
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

        {}
        <div ref={chatBodyRef} className={styles.chatBody}>
          {}
          <div className={`${styles.message} ${styles.botMessage}`}>
            <ChatbotIcon />
            <p className={styles.messageText}>
              Welcome to Massar! Your journey through Jordan's beauty starts
              here.
              <br />
              Whether you're looking for hidden gems, historical landmarks, or
              cultural experiences — I'm here to guide you.
              <br />
              Where would you like to explore today?
            </p>
          </div>

          {}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {}
        <div className={styles.chatFooter}>
          {(rateLimitRemaining > 0 && msgCountRef.current >= 5) && (
            <div className={styles.rateLimitWarning}>
              Please wait {rateLimitRemaining}s before sending another message.
            </div>
          )}
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            isRateLimited={rateLimitRemaining > 0 && msgCountRef.current >= 5}
            handleSafetyViolation={handleSafetyViolation}
          />
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
