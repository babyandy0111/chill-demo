// MapWithClouds.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { particlesOptions } from "./cloud-particles-config.jsx";
import { mapStyles } from "./map-styles.js";
import cloudImage from "./assets/cloud.png";
import CloudCounter from "./CloudCounter.jsx";
import RegistrationModal from "./RegistrationModal.jsx";
import Compass from "./Compass.jsx";
import Leaderboard from "./Leaderboard.jsx"; // 引入排行榜元件

// --- 地圖設定 ---
const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

const center = {
    lat: 25.0330,
    lng: 121.5654,
};

// --- 粒子設定 ---
const particlesStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 10,
    pointerEvents: "none",
};

function MapWithClouds() {
    const [clouds, setClouds] = useState([]);
    const [cloudCount, setCloudCount] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [zoom, setZoom] = useState(10); // 追蹤縮放層級的狀態
    const mapRef = useRef(null);

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const onMapClick = useCallback((event) => {
        if (cloudCount > 0) {
            const newCloud = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
                time: new Date(),
            };
            setClouds((currentClouds) => [...currentClouds, newCloud]);
            setCloudCount((currentCount) => currentCount - 1);
        }
    }, [cloudCount]);

    // 監聽縮放層級變化
    const handleZoomChanged = () => {
        if (mapRef.current) {
            setZoom(mapRef.current.getZoom());
        }
    };

    useEffect(() => {
        if (cloudCount === 0) {
            setIsModalOpen(true);
        }
    }, [cloudCount]);

    const handleRegister = () => {
        console.log("註冊成功！");
        setCloudCount(10);
        setIsModalOpen(false);
    };

    const handleCompassClick = () => {
        if (mapRef.current) {
            mapRef.current.panTo(center);
        }
    };

    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
            <Leaderboard zoom={zoom} /> {/* 渲染排行榜 */}
            <CloudCounter count={cloudCount} />
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={particlesOptions}
                style={particlesStyle}
            />
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={10}
                    options={{
                        styles: mapStyles,
                        disableDefaultUI: true,
                    }}
                    onLoad={onMapLoad}
                    onClick={onMapClick}
                    onZoomChanged={handleZoomChanged} // 綁定縮放事件
                >
                    {clouds.map((cloud, index) => (
                        <Marker
                            key={index}
                            position={{ lat: cloud.lat, lng: cloud.lng }}
                            icon={{
                                url: cloudImage,
                                scaledSize: new window.google.maps.Size(50, 50),
                            }}
                            animation={window.google.maps.Animation.DROP} // 加上掉落動畫
                        />
                    ))}
                </GoogleMap>
            </LoadScript>

            <Compass onClick={handleCompassClick} />
            {isModalOpen && <RegistrationModal onRegister={handleRegister} />}
        </div>
    );
}

export default MapWithClouds;