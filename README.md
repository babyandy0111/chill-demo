# Chill App

這是一個協作地圖應用程式，使用者可以在地球上探索並標記「Chill」的地點。

## 專案結構

以下是 `src` 目錄中主要元件和檔案的概觀：

```
src/
├── App.jsx
├── GlobeView.jsx
├── MapWithClouds.jsx
├── CanvasOverlay.jsx
├── CellInfoWindow.jsx
├── CloudCounter.jsx
├── Compass.jsx
├── CurrentUserLocationMarker.jsx
├── Leaderboard.jsx
├── InfoModal.jsx
├── RegistrationModal.jsx
├── audioPlayer.js
├── map-styles.js
├── main.jsx
└── assets/
```

### `main.jsx`

這是應用程式的進入點。它使用 `react-router-dom` 設定了路由：

-   `/`: 顯示 `GlobeView` 元件。
-   `/map`: 顯示 `App` 元件（地圖視圖）。
-   `/map/:lat/:lng`: 顯示 `App` 元件，並將地圖置中於指定的經緯度。

### `GlobeView.jsx`

這是應用程式的初始視圖，顯示一個互動式的 3D 地球。

-   **功能**:
    -   使用 `react-globe.gl` 渲染地球。
    -   顯示國家多邊形和主要城市。
    -   允許使用者點擊地球以平滑過渡到 `App` 元件中的 2D 地圖視圖。
    -   具有返回地球視圖的按鈕。

### `App.jsx`

這是應用程式的核心元件，整合了地圖、使用者互動和各種 UI 元素。

-   **狀態管理**:
    -   `center`: 地圖中心點的經緯度。
    -   `clouds`: 使用者剩餘的「雲」數量。
    -   `claimedCells`: 已被使用者佔領的網格單元。
    -   `selectedCell`: 使用者當前選擇的網格單元。
    -   `userLocation`: 使用者目前的地理位置。
-   **功能**:
    -   使用 `@react-google-maps/api` 載入 Google 地圖。
    -   處理網格單元的選擇和佔領邏輯。
    -   管理各種模態視窗（資訊、排行榜、註冊）的開關。
    -   提供縮放、回到地球和定位到目前位置的控制項。

### `MapWithClouds.jsx`

此元件負責渲染 Google 地圖以及與地圖相關的互動。

-   **功能**:
    -   顯示 Google 地圖。
    -   處理地圖上的滑鼠移動和點擊事件，以選擇網格單元。
    -   整合 `CanvasOverlay` 以繪製雲朵和懸停效果。
    -   顯示 `CurrentUserLocationMarker` 來標記使用者的位置。

### `CanvasOverlay.jsx`

此元件使用 HTML5 Canvas 在 Google 地圖上繪製自訂圖層。

-   **功能**:
    -   當地圖縮放等級足夠時，繪製網格線。
    -   在已被佔領的網格單元上繪製雲朵圖片。
    -   在滑鼠懸停的網格單元上顯示高亮效果。

### `CellInfoWindow.jsx`

這是一個 UI 元件，當使用者選擇一個網格單元時，會顯示該單元的資訊。

-   **功能**:
    -   顯示地點的國家/地區名稱和旗幟。
    -   顯示網格單元的座標。
    -   提供一個「佔領」按鈕，讓使用者可以佔領該單元。

### UI 元件

-   **`CloudCounter.jsx`**: 顯示使用者剩餘的雲朵數量。
-   **`Compass.jsx`**: 一個羅盤按鈕，點擊後會將地圖平移到使用者目前的位置。
-   **`CurrentUserLocationMarker.jsx`**: 在地圖上以動畫效果標示使用者目前的位置。
-   **`Leaderboard.jsx`**: 顯示排行榜的模態視窗，包含不同範圍（地區、國家等）和時間（日、週、月）的排名。
-   **`InfoModal.jsx`**: 顯示應用程式介紹和玩法說明的模態視窗。
-   **`RegistrationModal.jsx`**: 當使用者雲朵用完時，彈出此模態視窗提示註冊。

### 其他

-   **`audioPlayer.js`**: 提供一個共享的 `playClickSound` 函式，用於播放點擊音效。
-   **`map-styles.js`**: 定義了 Google 地圖的自訂樣式。
-   **`assets/`**: 存放所有靜態資源，如圖片、聲音檔案和 JSON 資料。