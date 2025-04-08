import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { generateGrid } from "./createGrid";
import FooterBar from "./FooterBar";

mapboxgl.accessToken = "pk.eyJ1IjoidHRjaGFuZzMyMyIsImEiOiJjbThvNDRlZXkwN29pMmtvc2pmcDYzeWRsIn0.MtakkAA8xSCgC67p2S1KRg";

const HexGridMap = ({ onMapReady, mapStyle, setMapStyle }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [interferenceSummary, setInterferenceSummary] = useState({});

  // 計算干擾數據
  const calculateInterferenceSummary = (gridData) => {
    const interferenceZones = gridData.features.filter((f) => f.properties.hasInterference);
    return { interference: interferenceZones.length };
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styles = {
      hex: "mapbox://styles/ttchang323/cm8o8u964004g01rc7blv6mwh",
      dark: "mapbox://styles/mapbox/dark-v10",
    };

    // Define map options based on the current style
    const mapOptions = {
      container: mapContainerRef.current,
      style: styles[mapStyle],
      center: [0, 0],
      zoom: mapStyle === "dark" ? 2 : 4,
    };
    
    // Only apply bounds restrictions to the dark 2D map
    if (mapStyle === "dark") {
      // Define the max bounds for the map (slightly larger than the world)
      const worldBounds = [
        [-190, -85], // Southwest coordinates
        [190, 85]    // Northeast coordinates
      ];
      
      mapOptions.maxBounds = worldBounds;
      mapOptions.renderWorldCopies = false;
    }

    const map = new mapboxgl.Map(mapOptions);

    map.on("load", () => {
      const gridData = generateGrid(mapStyle, -180, -90, 180, 90, 50);
      const summary = calculateInterferenceSummary(gridData);
      setInterferenceSummary(summary);

      map.addSource("grid", {
        type: "geojson",
        data: gridData,
      });

      map.addLayer({
        id: "grid-lines",
        type: "line",
        source: "grid",
        paint: { "line-color": "#3A3737", "line-width": 0.8, "line-opacity": 0.8 },
      });

      map.addLayer({
        id: "interference-zones",
        type: "fill",
        source: "grid",
        paint: {
          "fill-color": ["case", ["get", "hasInterference"], "#FFD700", "transparent"],
          "fill-opacity": 0.6,
        },
      });

      if (onMapReady) onMapReady(map);
    });

    mapRef.current = map;
    return () => map.remove();
  }, [mapStyle, onMapReady]);

  return (
    <div className="map-container">
      <div ref={mapContainerRef} className="mapbox-map" />
      <FooterBar 
        interferenceData={interferenceSummary} 
        mapStyle={mapStyle} 
        setMapStyle={setMapStyle} 
      />
    </div>
  );
};

export default HexGridMap;