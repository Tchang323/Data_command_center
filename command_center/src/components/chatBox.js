import React, { useState, useRef, useEffect } from "react";
import "../styles/index.css";

// 過濾 <think> 標籤
const removeThinkBlock = (text) => {
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

// 轉換 LaTeX 語法為純文字
const convertLaTeXToPlain = (text) => {
  return text
    .replace(/\\times/g, "*")  // 轉換 \times 為 *
    .replace(/\\\(/g, "")       // 移除 \( \)
    .replace(/\\\)/g, "")
    .replace(/\\\[/g, "")       // 移除 \[ \]
    .replace(/\\\]/g, "")
    .replace(/\\boxed{([^}]*)}/g, "$1")  // 移除 \boxed{} 框住的部分
    .trim();
};

// 綜合處理訊息過濾與轉換
const formatResponse = (rawText) => {
  const noThink = removeThinkBlock(rawText);
  const converted = convertLaTeXToPlain(noThink);
  return converted;
};

const ChatBox = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "歡迎使用AI助手", sender: "ai" },
    { id: 2, text: "我可以幫您解析數據或回答問題", sender: "ai" },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "") return;  // 如果輸入訊息為空，則不處理
  
    const userMessage = { id: Date.now(), text: inputMessage, sender: "user" }; // 將使用者的訊息加入訊息列表
    setMessages((prev) => [...prev, userMessage]);
  
    try {
      // 呼叫後端的 API，並將使用者的訊息發送過去
      const res = await fetch("http://localhost:8000/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: inputMessage }),
      });
      
      // 清空使用者輸入框
      setInputMessage("");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullMessage = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
      
        const chunk = decoder.decode(value);
        fullMessage += chunk;
      }
      
      // 過濾 <think> 標籤並轉換 LaTeX 語法
      const cleanMessage = formatResponse(fullMessage);

      // 更新訊息列表，將 LLM 回應顯示出來
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now() + 1, text: cleanMessage, sender: "ai" },
      ]);
      
      // 清空使用者輸入框
      //setInputMessage("");
    } catch (error) {
      console.error("⚠️ 發送訊息錯誤：", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now() + 1, text: "⚠️ 無法取得 AI 回應", sender: "ai" },
      ]);
    }
  };

  return (
    <div className="footer-section chat-box">
      <div className="chat-messages-container">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="輸入您的訊息..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button className="chat-send-btn" onClick={handleSendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
