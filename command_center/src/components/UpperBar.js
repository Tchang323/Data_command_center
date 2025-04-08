import React, { useEffect } from "react";
import "../styles/index.css";
import vleoLogo from "../assets/VLEO_logo.png"; // 確保路徑正確


function UpperBar() {
  // 新增時間更新功能
  useEffect(() => {
    const updateTime = () => {
      const timeElement = document.getElementById("current-time");
      if (timeElement) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
      }
    };

    // 初始更新時間
    updateTime();
    
    // 設定每秒更新一次
    const intervalId = setInterval(updateTime, 1000);
    
    // 清理函數
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="upper-bar">
      <div className="logo-container">
        <img src={vleoLogo} alt="VLEO Logo" className="vleo-logo" />
      </div>
    </div>
  );
}

export default UpperBar;