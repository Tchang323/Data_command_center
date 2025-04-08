import "../styles/index.css";
import ChatBox from "./chatBox";

const FooterBar = ({ mapRef, interferenceData = {Interference:1608}, mapStyle, setMapStyle}) => {
  console.log("🔍 Interference Data in FooterBar: ", interferenceData);

  // Zoom In Function
  const zoomIn = () => {
    if (mapRef.current) {
      let currentZoom = mapRef.current.getZoom();
      mapRef.current.zoomTo(currentZoom + 1); // 放大1級
    }
  };

  // Zoom Out Function
  const zoomOut = () => {
    if (mapRef.current) {
      let currentZoom = mapRef.current.getZoom();
      mapRef.current.zoomTo(currentZoom - 1); // 縮小1級
    }
  };

return (
  <div className="footer-bar">
    {/* Minimap 區域 */}
    <div className="footer-section minimap">
      <div className="minimap-container">
        <p>Minimap</p>
      </div>
    </div>

    {/* 即時數據區域 */}
    <div className="footer-section data-info">
      <h4>即時數據</h4>

      {/* 確保 interferenceData 是有效物件 */}
      {interferenceData && Object.keys(interferenceData).length > 0 ? (
        <>
          {Object.entries(interferenceData).map(([band, count]) => (
            <div className="data-item" key={band}>
              <span>{band}</span>
              <span>{count}</span>
            </div>
          ))}
        </>
      ) : (
        <div className="data-item">無干擾</div>
      )}
    </div>

    {/* 文字對話框 */}
    <ChatBox />


    {/* Toolbar 工具欄 */}
    <div className="footer-section toolbar">
      <div className="toolbar-row">
        <button className="toolbar-btn" onClick={zoomIn}>
          +
        </button>
        <button className="toolbar-btn" onClick={zoomOut}>
          -
        </button>
        <button 
          onClick={() => setMapStyle((prev) => (prev === "hex" ? "dark" : "hex"))} 
          className="toolbar-btn"
        >
          {mapStyle === "hex" ? "2D" : "3D"}
        </button>
      </div>
      <div className="toolbar-row">
        <button className="toolbar-btn">?</button>
        <button className="toolbar-btn">?</button>
        <button className="toolbar-btn">?</button>
      </div>
    </div>
  </div>
);
};

export default FooterBar;
