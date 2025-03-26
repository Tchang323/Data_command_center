import React, { useRef } from "react";
import "./styles/App.css";
import HexGridMap from "./components/GridMap";
import FooterBar from "./components/FooterBar";

function App() {
  const mapRef = useRef(null);

  const handleMapReady = (map) => {
    mapRef.current = map; // 儲存地圖實例
  };

  const zoomIn = () => {
    if (mapRef.current) {
      let currentZoom = mapRef.current.getZoom();
      mapRef.current.zoomTo(currentZoom + 1); // 放大1級
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      let currentZoom = mapRef.current.getZoom();
      mapRef.current.zoomTo(currentZoom - 1); // 縮小1級
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <HexGridMap onMapReady={handleMapReady} />
        <FooterBar zoomIn={zoomIn} zoomOut={zoomOut} />
      </header>
    </div>
  );
}

export default App;
