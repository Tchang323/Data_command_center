import React, { useState, useRef, useEffect } from "react";
import "../styles/index.css";

const FooterBar = ({zoomIn, zoomOut}) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "歡迎使用AI助手", sender: 'ai' },
    { id: 2, text: "我可以幫您解析數據或回答問題", sender: 'ai' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // 自動滾動到最底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // 用戶消息
    const userMessage = {
      id: Date.now(), // 使用 Date.now() 確保唯一 ID
      text: inputMessage,
      sender: 'user'
    };
    
    const aiResponse = {
      id: Date.now() + 1, // 保持唯一 ID
      text: `您說的是：${inputMessage}。我正在處理您的請求...`,
      sender: 'ai'
    };    

    setMessages((prevMessages) => [...prevMessages, userMessage, aiResponse]);
    setInputMessage('');
  };

  return (
    <div className="footer-bar">
      {/* (1) Minimap 區域 */}
      <div className="footer-section minimap">
        <div className="minimap-container">
          <p>Minimap</p>
        </div>
      </div>

      {/* (2) 即時數據區域 */}
      <div className="footer-section data-info">
        <h4>即時數據</h4>
        <div className="data-item">
          <span>X-Band</span>
          <span>3k</span>
        </div>
        <div className="data-item">
          <span>VHF</span>
          <span>2k</span>
        </div>
        <div className="data-item">
          <span>L-Band</span>
          <span>567</span>
        </div>
      </div>

      {/* (3) 文字對話框 */}
      <div className="footer-section chat-box">
        <div className="chat-messages-container">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`chat-message ${msg.sender}`}
              >
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
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            className="chat-send-btn"
            onClick={handleSendMessage}
          >
            ➤
          </button>
        </div>
      </div>

      {/* (4) Toolbar 工具欄 */}
      <div className="footer-section toolbar">
        {/* 放大與縮小功能的按鈕 */}
        <div className="toolbar-row">
          <button className="toolbar-btn" onClick={zoomIn}>+</button>
          <button className="toolbar-btn" onClick={zoomOut}>-</button>
          <button className="toolbar-btn" onClick={() => console.log("功能3")}>?</button>
        </div>
        <div className="toolbar-row">
          <button className="toolbar-btn" onClick={() => console.log("功能4")}>?</button>
          <button className="toolbar-btn" onClick={() => console.log("功能5")}>?</button>
          <button className="toolbar-btn" onClick={() => console.log("功能6")}>?</button>
        </div>
      </div>
    </div>
  );
};

export default FooterBar;