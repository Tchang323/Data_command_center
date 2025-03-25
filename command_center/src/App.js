import React from 'react';
import './App.css';
import HexGridMap from './components/GridMap'; // 引入 OpenStreetMap 版本的 HexGridMap 組件

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* 使用 HexGridMap 組件來顯示地圖 */}
        <HexGridMap />
      </header>
    </div>
  );
}

export default App;
