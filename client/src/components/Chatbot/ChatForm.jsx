
import { useRef, useState } from "react";
import styles from "./Chatbot.module.css";

function ChatForm({ chatHistory, setChatHistory, generateBotResponse, isLoading, setIsLoading, isRateLimited, handleSafetyViolation }) {
  
  const inputRef = useRef();
  const fileInputRef = useRef();

  
  const [uploadedFile, setUploadedFile] = useState(null);

  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    const userMessage = inputRef.current.value.trim();
    if (!userMessage && !uploadedFile) return;

    
    setIsLoading(true);

    const messageText = userMessage || `📎 ${uploadedFile?.name}`;
    inputRef.current.value = "";
    inputRef.current.style.height = "47px";

    
    setChatHistory((history) => [
      ...history,
      { role: "user", text: messageText, file: uploadedFile || null },
    ]);

    
    setTimeout(() => {
      setChatHistory((history) => [
        ...history,
        { role: "model", text: "Thinking..." },
      ]);

      
      setTimeout(() => {
        generateBotResponse([
          ...chatHistory,
          { role: "user", text: messageText, file: uploadedFile || null },
          { role: "model", text: "Thinking..." },
        ]);
      }, 100);
    }, 600);

    
    setUploadedFile(null);
  };

  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      
      try {
        const backendUrl = `${import.meta.env.VITE_API_URL || "http://127.0.0.1:5002"}/api/chat/scan-image`;
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file_data: base64, mime_type: file.type }),
        });

        if (response.status === 403) {
           fileInputRef.current.value = "";
           handleSafetyViolation();
           setIsLoading(false);
           return;
        }

        if (!response.ok) {
           console.error("Image scan failed");
        }

        setUploadedFile({
          data: base64,
          mime_type: file.type,
          previewUrl: ev.target.result,
          name: file.name,
        });
      } catch (error) {
        console.error("Scan error", error);
      } finally {
        fileInputRef.current.value = "";
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submits form on Enter key (desktop only, Shift+Enter adds new line)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 768) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  
  const handleInput = () => {
    const input = inputRef.current;
    input.style.height = "47px";
    if (input.scrollHeight > 47) {
      input.style.height = `${input.scrollHeight}px`;
      input.style.overflowY = "auto";
    }
  };

  return (
    <form action="#" className={styles.chatForm} onSubmit={handleFormSubmit}>
      {}
      <textarea
        ref={inputRef}
        placeholder={isRateLimited ? "Rate limited" : isLoading ? "Thinking" : "type something"}
        className={styles.messageInput}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        rows={1}
        disabled={isLoading}
      />

      <div className={styles.chatControls}>
        {}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {}
        <div className={styles.fileUploadWrapper}>
          {uploadedFile && (
            <>
              {}
              <img src={uploadedFile.previewUrl} alt="attachment" />

              {}
              <button
                type="button"
                className={`${styles.fileCancelBtn} ${styles.materialSymbolsRounded}`}
                onClick={() => setUploadedFile(null)}
                disabled={isLoading}
              >
                close
              </button>
            </>
          )}

          {}
          <button
            type="button"
            className={`${styles.attachBtn} ${styles.materialSymbolsRounded}`}
            onClick={() => fileInputRef.current.click()}
            style={{ display: uploadedFile ? "none" : "flex" }}
            disabled={isLoading}
          >
            attach_file
          </button>
        </div>

        {}
        <button
          type="submit"
          className={`${styles.sendBtn} ${styles.materialSymbolsRounded}`}
          disabled={isLoading || (!inputRef.current?.value.trim() && !uploadedFile)}
        >
          arrow_upward
        </button>
      </div>
    </form>
  );
}

export default ChatForm;
