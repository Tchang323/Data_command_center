import React from "react";
import "../styles/index.css";

const FooterBar = ({zoomIn, zoomOut}) => {
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
        <p>對話框，未來可顯示 AI 解析結果</p>
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
