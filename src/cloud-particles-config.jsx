// cloud-particles-config.jsx

// 這是一個 base64 data-uri 的 SVG 雲朵圖案 (白色)
// 這樣您就不需要額外引入 .png 檔案
const cloudSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M41.1 12.1C38.4 7.8 33.3 5 27.5 5c-7.3 0-13.5 4.8-15.4 11.4C5.4 18.2 1 23.9 1 30.5c0 8.3 6.7 15 15 15h29.5c6.9 0 12.5-5.6 12.5-12.5C58 25.4 50.5 18 41.1 12.1z' fill='%23ffffff'/%3E%3C/svg%3E";

export const particlesOptions = {
    background: {
        color: {
            value: "transparent", // 必須是透明背景
        },
    },
    fpsLimit: 60,
    interactivity: {
        events: {
            onClick: {
                enable: false, // 關閉點擊
            },
            onHover: {
                enable: false, // 關閉滑過
            },
            resize: true,
        },
    },
    particles: {
        color: {
            value: "#ffffff",
        },
        move: {
            direction: "right", // 統一向右移動
            enable: true,
            outModes: {
                default: "out", // 粒子移出畫布後消失
            },
            random: false,
            speed: {min: 0.5, max: 1.5}, // 移動速度有快有慢
            straight: true, // 直線移動
        },
        number: {
            density: {
                enable: true,
                area: 1200, // 粒子密度
            },
            value: 15, // 粒子數量
        },
        opacity: {
            value: {min: 0.3, max: 0.7}, // 透明度
            animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.1,
            },
        },
        shape: {
            type: "image", // 使用圖片
            image: {
                src: cloudSvg, // 填入我們的 SVG
                width: 100,
                height: 100,
            },
        },
        size: {
            value: {min: 60, max: 120}, // 粒子大小
            animation: {
                enable: true,
                speed: 3,
                minimumValue: 40,
            },
        },
    },
    detectRetina: true,
};