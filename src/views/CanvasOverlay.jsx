import { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 0.0005;

// --- Helper function to create a noise pattern ---
const createNoisePattern = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 100;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 5; // Low alpha for subtlety
    }
    ctx.putImageData(imageData, 0, 0);
    return ctx.createPattern(canvas, 'repeat');
};


const CanvasOverlay = ({ map, zoom, claimedCells, exploredCells, hoveredCell, isAnimating, selectedCell, effects }) => {
    const overlayRef = useRef(null);
    const workerRef = useRef(null);
    const [drawableCells, setDrawableCells] = useState({ claimed: [], explored: [] });
    const animationFrameRef = useRef();
    const noisePatternRef = useRef(null);
    const hoveredCellRef = useRef(null); // New ref for tracking hovered cell

    // Effect to notify worker when external data has changed
    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'DATA_UPDATED' });
        }
    }, [claimedCells, exploredCells]);

    // Effect for Initialization: Runs only when the map instance is ready.
    useEffect(() => {
        if (!map) return;

        // --- Google Maps OverlayView Class ---
        // This class is defined inside useEffect to ensure window.google.maps is loaded before trying to extend OverlayView.
        class GoogleMapsCustomOverlay extends window.google.maps.OverlayView {
            constructor(noisePattern, hoveredCellRef) {
                super();
                this.props = {};
                this.swPixel = null;
                this.nePixel = null;
                this.drawableClaimed = [];
                this.drawableExplored = [];
                this.noisePattern = noisePattern;
                this.hoveredCellRef = hoveredCellRef; // Store the ref

                // Create canvases
                this.fogCanvas = document.createElement('canvas');
                this.fogCtx = this.fogCanvas.getContext('2d');
                this.fogCanvas.style.position = 'absolute';
                this.fogCanvas.style.pointerEvents = 'none';

                this.effectsCanvas = document.createElement('canvas');
                this.effectsCtx = this.effectsCanvas.getContext('2d');
                this.effectsCanvas.style.position = 'absolute';
                this.effectsCanvas.style.pointerEvents = 'none';

                this.dynamicCanvas = document.createElement('canvas');
                this.dynamicCtx = this.dynamicCanvas.getContext('2d');
                this.dynamicCanvas.style.position = 'absolute';
                this.dynamicCanvas.style.pointerEvents = 'none';
            }

            setProps(props) {
                this.props = { ...this.props, ...props };
            }

            setDrawableCells(claimed, explored) {
                this.drawableClaimed = claimed;
                this.drawableExplored = explored;
            }

            onAdd() {
                const panes = this.getPanes();
                panes.overlayLayer.appendChild(this.fogCanvas);
                panes.overlayMouseTarget.appendChild(this.effectsCanvas);
                panes.overlayMouseTarget.appendChild(this.dynamicCanvas);
            }

            onRemove() {
                [this.fogCanvas, this.effectsCanvas, this.dynamicCanvas].forEach(canvas => {
                    if (canvas.parentElement) {
                        canvas.parentElement.removeChild(canvas);
                    }
                });
            }

            draw() {
                const projection = this.getProjection();
                if (!projection) return;

                const OVERSCAN_FACTOR = 0.5;
                const bounds = this.getMap().getBounds();
                const sw = bounds.getSouthWest();
                const ne = bounds.getNorthEast();
                const swPixelOriginal = projection.fromLatLngToDivPixel(sw);
                const nePixelOriginal = projection.fromLatLngToDivPixel(ne);

                if (!swPixelOriginal || !nePixelOriginal) return;

                const width = nePixelOriginal.x - swPixelOriginal.x;
                const height = swPixelOriginal.y - nePixelOriginal.y;
                const overscanWidth = Math.round(width * OVERSCAN_FACTOR);
                const overscanHeight = Math.round(height * OVERSCAN_FACTOR);
                const canvasWidth = width + 2 * overscanWidth;
                const canvasHeight = height + 2 * overscanHeight;

                this.swPixel = { x: swPixelOriginal.x - overscanWidth, y: swPixelOriginal.y + overscanHeight };
                this.nePixel = { x: nePixelOriginal.x + overscanWidth, y: nePixelOriginal.y - overscanHeight };

                [this.fogCanvas, this.effectsCanvas, this.dynamicCanvas].forEach(canvas => {
                    canvas.style.left = `${swPixelOriginal.x - overscanWidth}px`;
                    canvas.style.top = `${nePixelOriginal.y - overscanHeight}px`;
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                });

                this.drawFog();
                this.drawDynamic();
            }

            drawFog() {
                if (!this.swPixel) return;

                this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
                this.fogCanvas.style.opacity = this.props.isAnimating ? '0.7' : '1';
                this.fogCtx.fillStyle = 'rgba(26, 26, 26, 0.9)';
                this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

                if (this.noisePattern) {
                    this.fogCtx.fillStyle = this.noisePattern;
                    this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
                }

                this.fogCtx.globalCompositeOperation = 'destination-out';
                this.drawableExplored.forEach(cell => this.drawStaticReveal(cell));
                this.fogCtx.globalCompositeOperation = 'source-over';
            }

            drawStaticReveal(cell) {
                const projection = this.getProjection();
                if (!projection || !this.swPixel) return;

                const { south, west } = cell;
                const cellSW = new window.google.maps.LatLng(south, west);
                const cellNE = new window.google.maps.LatLng(south + GRID_SIZE, west + GRID_SIZE);
                const pixelSW = projection.fromLatLngToDivPixel(cellSW);
                const pixelNE = projection.fromLatLngToDivPixel(cellNE);

                if (!pixelSW || !pixelNE) return;

                const rectX = pixelSW.x - this.swPixel.x;
                const rectY = pixelNE.y - this.nePixel.y;
                const rectWidth = pixelNE.x - pixelSW.x;
                const rectHeight = pixelSW.y - pixelNE.y;

                // --- Level of Detail (LOD) Implementation ---
                if (this.props.zoom < 14) {
                    // Low zoom: Draw a simple, fast square
                    this.fogCtx.fillStyle = 'rgba(0, 0, 0, 1)';
                    this.fogCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
                } else {
                    // High zoom: Draw the detailed, feathered circle
                    const centerX = rectX + rectWidth / 2;
                    const centerY = rectY + rectHeight / 2;
                    const radiusX = rectWidth * 2.5;
                    const radiusY = rectHeight * 2.5;

                    const gradient = this.fogCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(radiusX, radiusY));
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.fogCtx.fillStyle = gradient;
                    this.fogCtx.beginPath();
                    this.fogCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    this.fogCtx.fill();
                }
            }

            drawRevealEffect(effect, progress, projection) {
                const centerLatLng = new window.google.maps.LatLng(effect.position.lat, effect.position.lng);
                const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);
                if (!centerPixel || !this.swPixel) return;

                const x = centerPixel.x - this.swPixel.x;
                const y = centerPixel.y - this.nePixel.y;

                const dummySW = new window.google.maps.LatLng(effect.position.lat, effect.position.lng);
                const dummyNE = new window.google.maps.LatLng(effect.position.lat + GRID_SIZE, effect.position.lng + GRID_SIZE);
                const pixelSW = projection.fromLatLngToDivPixel(dummySW);
                const pixelNE = projection.fromLatLngToDivPixel(dummyNE);
                if (!pixelSW || !pixelNE) return;
                const rectWidth = pixelNE.x - pixelSW.x;

                const maxRadius = rectWidth * 2.5;
                const currentRadius = maxRadius * progress;

                const gradient = this.fogCtx.createRadialGradient(x, y, 0, x, y, currentRadius);
                gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                this.fogCtx.globalCompositeOperation = 'destination-out';
                this.fogCtx.fillStyle = gradient;
                this.fogCtx.beginPath();
                this.fogCtx.arc(x, y, currentRadius, 0, 2 * Math.PI);
                this.fogCtx.fill();
                this.fogCtx.globalCompositeOperation = 'source-over';
            }

            drawParticleEffect(effect, progress, projection) {
                const centerLatLng = new window.google.maps.LatLng(effect.position.lat, effect.position.lng);
                const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);
                if (!centerPixel || !this.swPixel) return;

                const x = centerPixel.x - this.swPixel.x;
                const y = centerPixel.y - this.nePixel.y;

                const baseRadius = 80;
                const currentRadius = baseRadius * (0.1 + 1.4 * progress);
                const opacity = 0.6 * (1 - progress);

                const gradient = this.effectsCtx.createRadialGradient(x, y, 0, x, y, currentRadius);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.5})`);
                gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.5})`);
                gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                this.effectsCtx.fillStyle = gradient;
                this.effectsCtx.filter = 'blur(20px)';
                this.effectsCtx.beginPath();
                this.effectsCtx.arc(x, y, currentRadius, 0, 2 * Math.PI);
                this.effectsCtx.fill();
                this.effectsCtx.filter = 'none';
            }

            clearEffects() {
                if (this.effectsCtx) {
                    this.effectsCtx.clearRect(0, 0, this.effectsCanvas.width, this.effectsCanvas.height);
                }
            }

            drawClaimedCells(projection) {
                this.drawableClaimed.forEach(cell => {
                    const { south, west } = cell;
                    const cellSW = new window.google.maps.LatLng(south, west);
                    const cellNE = new window.google.maps.LatLng(south + GRID_SIZE, west + GRID_SIZE);
                    const pixelSW = projection.fromLatLngToDivPixel(cellSW);
                    const pixelNE = projection.fromLatLngToDivPixel(cellNE);

                    if (!pixelSW || !pixelNE) return;

                    const rectX = pixelSW.x - this.swPixel.x;
                    const rectY = pixelNE.y - this.nePixel.y;
                    const rectWidth = pixelNE.x - pixelSW.x;
                    const rectHeight = pixelSW.y - pixelNE.y;

                    this.dynamicCtx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Semi-transparent blue for claimed cells
                    this.dynamicCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
                });
            }

            drawDynamic() {
                const projection = this.getProjection();
                if (!projection || !this.swPixel) return;

                const { selectedCell } = this.props; // Removed hoveredCell from props
                this.dynamicCtx.clearRect(0, 0, this.dynamicCanvas.width, this.dynamicCanvas.height);

                // --- Draw claimed cells first ---
                this.drawClaimedCells(projection);

                // --- Draw hovered cell (from ref) or selected cell ---
                const cellToHighlight = selectedCell ? selectedCell.key : this.hoveredCellRef.current;
                if (!cellToHighlight) return;

                const [iy, ix] = cellToHighlight.split('_').map(Number);
                const south = iy * GRID_SIZE;
                const west = ix * GRID_SIZE;
                const cellSW = new window.google.maps.LatLng(south, west);
                const cellNE = new window.google.maps.LatLng(south + GRID_SIZE, west + GRID_SIZE);
                const pixelSW = projection.fromLatLngToDivPixel(cellSW);
                const pixelNE = projection.fromLatLngToDivPixel(cellNE);

                if (!pixelSW || !pixelNE) return;

                const rectX = pixelSW.x - this.swPixel.x;
                const rectY = pixelNE.y - this.nePixel.y;
                const rectWidth = pixelNE.x - pixelSW.x;
                const rectHeight = pixelSW.y - pixelNE.y;

                this.dynamicCtx.fillStyle = 'rgba(59, 130, 246, 0.4)'; // A slightly stronger blue for hover/selection
                this.dynamicCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
            }
        }

        // 1. Initialize Overlay and Worker
        noisePatternRef.current = createNoisePattern();
        const overlay = new GoogleMapsCustomOverlay(noisePatternRef.current, hoveredCellRef); // Pass hoveredCellRef
        overlay.setMap(map);
        overlayRef.current = overlay;

        const worker = new Worker(new URL('./grid.worker.js', import.meta.url), { type: 'module' });
        workerRef.current = worker;

        // 2. Setup Worker Message Handling
        worker.onmessage = (e) => {
            const { claimedCellsToDraw, exploredCellsToDraw } = e.data;
            setDrawableCells({ claimed: claimedCellsToDraw, explored: exploredCellsToDraw });
        };

        // 3. Setup Map Event Listeners
        // The 'idle' event will handle both the initial load and subsequent moves.
        const idleListener = map.addListener('idle', () => {
            if (workerRef.current) {
                const bounds = map.getBounds();
                if (bounds) {
                    workerRef.current.postMessage({
                        type: 'BOUNDS_CHANGED',
                        payload: {
                            bounds: {
                                southwest: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() },
                                northeast: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() }
                            }
                        }
                    });
                }
            }
        });

        // --- New: Mouse event listeners for hover effect ---
        const handleMouseMove = (e) => {
            if (map.getZoom() < 15) {
                if (hoveredCellRef.current) {
                    hoveredCellRef.current = null;
                }
                return;
            }
            const key = `${Math.floor(e.latLng.lat() / GRID_SIZE)}_${Math.floor(e.latLng.lng() / GRID_SIZE)}`;
            if (key !== hoveredCellRef.current) {
                hoveredCellRef.current = key;
            }
        };

        const handleMouseOut = () => {
            if (hoveredCellRef.current) {
                hoveredCellRef.current = null;
            }
        };

        map.addListener('mousemove', handleMouseMove);
        map.addListener('mouseout', handleMouseOut);
        
        // 4. Cleanup
        return () => {
            worker.terminate();
            overlay.setMap(null);
            window.google.maps.event.removeListener(idleListener);
            window.google.maps.event.removeListener(handleMouseMove);
            window.google.maps.event.removeListener(handleMouseOut);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [map]); // Dependency on map ensures this runs once when map is ready

    // Effect for managing the hover animation loop
    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay) return;

        let lastHoveredCell = null;
        const animateHover = () => {
            if (hoveredCellRef.current !== lastHoveredCell) {
                overlay.drawDynamic();
                lastHoveredCell = hoveredCellRef.current;
            }
            animationFrameRef.current = requestAnimationFrame(animateHover);
        };

        animationFrameRef.current = requestAnimationFrame(animateHover);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []); // Empty dependency array ensures this runs once

    // Effect for Drawing Updates: Passes drawable cells from state to the overlay instance.
    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setDrawableCells(drawableCells.claimed, drawableCells.explored);
        overlayRef.current.drawFog();
    }, [drawableCells]);

    // Effect for Dynamic Props: Updates props for hover/selection without recalculating grid.
    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setProps({ zoom, hoveredCell, isAnimating, selectedCell });
        overlayRef.current.drawDynamic();
    }, [zoom, hoveredCell, isAnimating, selectedCell]);

    // Effect for Animations: Manages the animation loop for special effects.
    useEffect(() => {
        const overlay = overlayRef.current;
        if (!overlay || effects.length === 0) return;

        const completedEffects = new Map();
        const animate = () => {
            const projection = overlay.getProjection();
            if (!projection || !overlay.swPixel) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }

            overlay.effectsCtx.clearRect(0, 0, overlay.effectsCanvas.width, overlay.effectsCanvas.height);
            overlay.drawFog(); // Redraw base fog

            let hasActiveAnimations = false;
            const now = Date.now();

            effects.forEach(effect => {
                const elapsedTime = now - effect.startTime;

                if (elapsedTime < effect.particleDuration) {
                    hasActiveAnimations = true;
                    overlay.drawParticleEffect(effect, elapsedTime / effect.particleDuration, projection);
                }

                if (elapsedTime < effect.revealDuration) {
                    hasActiveAnimations = true;
                    overlay.drawRevealEffect(effect, elapsedTime / effect.revealDuration, projection);
                }

                if (elapsedTime >= effect.revealDuration && !completedEffects.has(effect.id)) {
                    effect.onComplete?.();
                    completedEffects.set(effect.id, true);
                }
            });

            if (hasActiveAnimations) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                overlay.drawFog(); // Ensure final state
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (overlay) {
                overlay.clearEffects();
                overlay.drawFog();
            }
        };
    }, [effects]);

    return null;
};

export default CanvasOverlay;
