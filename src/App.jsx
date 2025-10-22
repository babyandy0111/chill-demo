// App.js
import React from "react";
import MapWithClouds from "./MapWithClouds.jsx";

function App() {
    return (
        <div className="App">
            <MapWithClouds/>
        </div>
    );
}

// 別忘了在 index.css 或 App.css 中移除 body 的 margin
/* body, html, #root, .App {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
*/

export default App;