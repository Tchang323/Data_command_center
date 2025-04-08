import React, { useState, useRef }from "react";
import "./styles/App.css";
import HexGridMap from "./components/GridMap";
import FooterBar from "./components/FooterBar";

function App() {
  const mapRef = useRef(null);
  const [mapStyle, setMapStyle] = useState("hex"); 

  const handleMapReady = (map) => {
    mapRef.current = map; // 儲存地圖實例
  };

  return (
    <div className="App">
      <header className="App-header">
        <HexGridMap onMapReady={handleMapReady} mapStyle={mapStyle} 
        setMapStyle={setMapStyle} />
        <FooterBar mapRef={mapRef} mapStyle={mapStyle} setMapStyle={setMapStyle}/> {/* 把 mapRef 傳遞給 FooterBar */}
      </header>
    </div>
  );
}

export default App;
