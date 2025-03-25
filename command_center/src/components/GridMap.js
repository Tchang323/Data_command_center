import React from "react";

const HexGridMap = () => {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* 使用 Mapbox 的 iframe 嵌入地圖 */}
      <iframe
        width="100%" 
        height="100%"  // 使用 100% 高度，使其佔滿整個視窗
        src="https://api.mapbox.com/styles/v1/ttchang323/cm8o8u964004g01rc7blv6mwh.html?title=copy&access_token=pk.eyJ1IjoidHRjaGFuZzMyMyIsImEiOiJjbThvNDRlZXkwN29pMmtvc2pmcDYzeWRsIn0.MtakkAA8xSCgC67p2S1KRg&zoomwheel=true&fresh=true#11/40.73/-74"
        title="Monochrome"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default HexGridMap;
