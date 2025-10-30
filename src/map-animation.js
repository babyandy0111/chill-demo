export const smoothAnimate = (map, targetCenter, duration, targetZoom = null) => {
    return new Promise((resolve) => {
        const startCenter = map.getCenter();
        const startZoom = map.getZoom();
        const startTime = Date.now();
        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = progress * progress * (3 - 2 * progress);
            const currentCenter = {
                lat: startCenter.lat() + (targetCenter.lat - startCenter.lat()) * easeProgress,
                lng: startCenter.lng() + (targetCenter.lng - startCenter.lng()) * easeProgress,
            };
            const currentZoom = targetZoom !== null ? startZoom + (targetZoom - startZoom) * easeProgress : startZoom;
            map.moveCamera({center: currentCenter, zoom: currentZoom});
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        animate();
    });
};
