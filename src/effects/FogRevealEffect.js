const GRID_SIZE = 0.0005;

/**
 * Creates a fog reveal effect object.
 * This object contains all data and drawing logic for the effect.
 * @param {object} options - The options for the effect.
 * @param {object} options.position - The lat/lng position to start the effect.
 * @param {function} options.onComplete - Callback function when the reveal animation finishes.
 * @returns {object} The effect strategy object.
 */
export function createFogRevealEffect({ position, onComplete }) {
    return {
        id: Date.now() + Math.random(),
        startTime: Date.now(),
        particleDuration: 2500,
        revealDuration: 1000,
        position,
        onComplete,

        /**
         * Draws the particle portion of the effect.
         * @param {CanvasRenderingContext2D} ctx - The context of the effects canvas.
         * @param {number} progress - The animation progress (0 to 1).
         * @param {object} projection - The Google Maps projection object.
         * @param {object} overlay - The overlay instance, containing swPixel/nePixel.
         */
        drawParticle(ctx, progress, projection, overlay) {
            const centerLatLng = new window.google.maps.LatLng(this.position.lat, this.position.lng);
            const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);
            if (!centerPixel || !overlay.swPixel) return;

            const x = centerPixel.x - overlay.swPixel.x;
            const y = centerPixel.y - overlay.nePixel.y;

            const baseRadius = 80;
            const currentRadius = baseRadius * (0.1 + 1.4 * progress);
            const opacity = 0.6 * (1 - progress);

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.5})`);
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            ctx.fillStyle = gradient;
            ctx.filter = 'blur(20px)';
            ctx.beginPath();
            ctx.arc(x, y, currentRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.filter = 'none';
        },

        /**
         * Draws the fog reveal portion of the effect.
         * @param {CanvasRenderingContext2D} ctx - The context of the fog canvas.
         * @param {number} progress - The animation progress (0 to 1).
         * @param {object} projection - The Google Maps projection object.
         * @param {object} overlay - The overlay instance, containing swPixel/nePixel.
         */
        drawReveal(ctx, progress, projection, overlay) {
            const centerLatLng = new window.google.maps.LatLng(this.position.lat, this.position.lng);
            const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);
            if (!centerPixel || !overlay.swPixel) return;

            const x = centerPixel.x - overlay.swPixel.x;
            const y = centerPixel.y - overlay.nePixel.y;

            // Use a dummy grid cell to calculate pixel width for sizing
            const dummySW = new window.google.maps.LatLng(this.position.lat, this.position.lng);
            const dummyNE = new window.google.maps.LatLng(this.position.lat + GRID_SIZE, this.position.lng + GRID_SIZE);
            const pixelSW = projection.fromLatLngToDivPixel(dummySW);
            const pixelNE = projection.fromLatLngToDivPixel(dummyNE);
            if (!pixelSW || !pixelNE) return;
            const rectWidth = pixelNE.x - pixelSW.x;

            const maxRadius = rectWidth * 2.5;
            const currentRadius = maxRadius * progress;

            const gradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, currentRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    };
}
