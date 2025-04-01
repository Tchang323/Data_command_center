import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// 設定你的 Mapbox Token
mapboxgl.accessToken =
  "pk.eyJ1IjoidHRjaGFuZzMyMyIsImEiOiJjbThvNDRlZXkwN29pMmtvc2pmcDYzeWRsIn0.MtakkAA8xSCgC67p2S1KRg";

const HexGridMap = ({ onMapReady }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 初始化地圖
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/ttchang323/cm8o8u964004g01rc7blv6mwh",
      center: [0, 0],
      zoom: 4,
    });

    map.on("load", () => {
      const gridLines = createGrid(-180, -90, 180, 90, 50); // 50km x 50km 網格

      // 添加網格層到地圖
      map.addSource("grid", {
        type: "geojson",
        data: gridLines,
      });

      map.addLayer({
        id: "grid-lines",
        type: "line",
        source: "grid",
        paint: {
          "line-color": "#3A3737", // 深灰色
          "line-width": 0.8,
          "line-opacity": 0.8,
        },
      });
    });

    mapRef.current = map;
    if (onMapReady) onMapReady(map);

    return () => map.remove();
  }, [onMapReady]);

  return <div ref={mapContainerRef} style={{ height: "98.5vh", width: "100%" }} />;
};

// `createGrid` 函數用於生成 50km x 50km 的網格邊框
const createGrid = (minLng, minLat, maxLng, maxLat, gridSizeKm) => {
  const grid = { type: "FeatureCollection", features: [] };

  // 每 1 度緯度大約 111.32 公里
  const latStep = gridSizeKm / 111.32; // 每 50km 對應的緯度步長
  const lngStep = gridSizeKm / (111.32 * Math.cos((minLat + maxLat) / 2 * (Math.PI / 180))); // 每公里在經度上的度數，取中間緯度來計算

  // 生成 50km x 50km 的網格邊框
  for (let lat = minLat; lat < maxLat; lat += latStep) {
    for (let lng = minLng; lng < maxLng; lng += lngStep) {
      grid.features.push({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [lng, lat], // 左下角
            [lng + lngStep, lat], // 右下角
            [lng + lngStep, lat + latStep], // 右上角
            [lng, lat + latStep], // 左上角
            [lng, lat], // 閉合
          ],
        },
      });
    }
  }

  return grid;
};

export default HexGridMap;
