// MapWithClouds.jsx
import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { particlesOptions } from "./cloud-particles-config.jsx";
import { mapStyles } from "./map-styles.js";
import cloudImage from "./assets/cloud.png";
import CloudCounter from "./CloudCounter.jsx";
import RegistrationModal from "./RegistrationModal.jsx"; // 引入註冊彈窗

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
    const [isModalOpen, setIsModalOpen] = useState(false); // 控制彈窗顯示的狀態

    // 地圖點擊事件
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

    // 監聽 cloudCount 的變化，當它變為 0 時打開彈窗
    useEffect(() => {
        if (cloudCount === 0) {
            setIsModalOpen(true);
        }
    }, [cloudCount]);

    // 處理註冊邏輯
    const handleRegister = () => {
        // 在這裡可以加入實際的註冊 API 呼叫
        console.log("註冊成功！");
        setCloudCount(10); // 獎勵 10 朵雲
        setIsModalOpen(false); // 關閉彈窗
    };

    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
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
                    onClick={onMapClick}
                >
                    {clouds.map((cloud, index) => (
                        <Marker
                            key={index}
                            position={{ lat: cloud.lat, lng: cloud.lng }}
                            icon={{
                                url: cloudImage,
                                scaledSize: new window.google.maps.Size(50, 50),
                            }}
                        />
                    ))}
                </GoogleMap>
            </LoadScript>

            {/* 條件渲染註冊彈窗 */}
            {isModalOpen && <RegistrationModal onRegister={handleRegister} />}
        </div>
    );
}