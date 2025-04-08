// 3D 地图网格生成（球形投影）
const createGrid3D = (minLng, minLat, maxLng, maxLat, gridSizeKm) => {
  const grid = { type: "FeatureCollection", features: [] };
  const latStep = gridSizeKm / 111.32;
  const lngStep = gridSizeKm / (111.32 * Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180)));

  for (let lat = minLat; lat < maxLat; lat += latStep) {
    for (let lng = minLng; lng < maxLng; lng += lngStep) {
      grid.features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [lng, lat],
            [lng + lngStep, lat],
            [lng + lngStep, lat + latStep],
            [lng, lat + latStep],
            [lng, lat]
          ]],
        },
        properties: { hasInterference: Math.random() > 0.995 } // 假設 10% 概率有干擾
      });
    }
  }
  return grid;
};

const createGrid2D = (minLng, minLat, maxLng, maxLat, gridSizeKm) => {
  const grid = { type: "FeatureCollection", features: [] };

  // 1 度緯度 ≈ 111.32 km，確保網格單位為度數
  const latStep = gridSizeKm / 111.32;
  const lngStep = gridSizeKm / (111.32 * Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180)));

  for (let lat = minLat; lat < maxLat; lat += latStep) {
    for (let lng = minLng; lng < maxLng; lng += lngStep) {
      grid.features.push({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [lng, lat],
            [lng + lngStep, lat],
            [lng + lngStep, lat + latStep],
            [lng, lat + latStep],
            [lng, lat]
          ]],
        },
        properties: { hasInterference: Math.random() > 0.995 }
      });
    }
  }
  return grid;
};

// 统一网格生成
const generateGrid = (mapStyle, minLng, minLat, maxLng, maxLat, gridSizeKm) => {
  return mapStyle === "hex"
    ? createGrid3D(minLng, minLat, maxLng, maxLat, gridSizeKm)
    : createGrid2D(minLng, minLat, maxLng, maxLat, gridSizeKm);
};

export { generateGrid };
