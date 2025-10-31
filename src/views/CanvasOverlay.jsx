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

    const [drawableClaimedCells, setDrawableClaimedCells] = useState([]);

    const [drawableExploredCells, setDrawableExploredCells] = useState([]);

    const claimedCellsRef = useRef(claimedCells);

    const exploredCellsRef = useRef(exploredCells);

    const noisePatternRef = useRef(null);

    const animationFrameRef = useRef();



    useEffect(() => {

        claimedCellsRef.current = claimedCells;

    }, [claimedCells]);



    useEffect(() => {

        exploredCellsRef.current = exploredCells;

    }, [exploredCells]);



    useEffect(() => {

        noisePatternRef.current = createNoisePattern(); // Create pattern once



        const worker = new Worker(new URL('./grid.worker.js', import.meta.url), { type: 'module' });

        workerRef.current = worker;



        worker.onmessage = (e) => {

            const { claimedCellsToDraw, exploredCellsToDraw } = e.data;

            setDrawableClaimedCells(claimedCellsToDraw);

            setDrawableExploredCells(exploredCellsToDraw);

        };



        return () => {

            worker.terminate();

            if (animationFrameRef.current) {

                cancelAnimationFrame(animationFrameRef.current);

            }

        };

    }, []);



        // Animation loop for effects



        useEffect(() => {



            const overlay = overlayRef.current;



            if (!overlay) return;



    



            // A map to track which effects have had their onComplete callback triggered



            const completedEffects = new Map();



    



            const animate = () => {



                const projection = overlay.getProjection();



                if (!projection || !overlay.swPixel) {



                    animationFrameRef.current = requestAnimationFrame(animate);



                    return;



                }



    



                // Clear the particle canvas for this frame



                overlay.effectsCtx.clearRect(0, 0, overlay.effectsCanvas.width, overlay.effectsCanvas.height);



                



                // Redraw the static fog before drawing animated reveals



                overlay.drawFog();



    



                let hasActiveAnimations = false;



                const now = Date.now();



    



                effects.forEach(effect => {



                    const elapsedTime = now - effect.startTime;



                    



                    // --- Particle Animation ---



                    if (elapsedTime < effect.particleDuration) {



                        hasActiveAnimations = true;



                        const particleProgress = elapsedTime / effect.particleDuration;



                        overlay.drawParticleEffect(effect, particleProgress, projection);



                    }



    



                    // --- Reveal Animation ---



                    if (elapsedTime < effect.revealDuration) {



                        hasActiveAnimations = true;



                        const revealProgress = elapsedTime / effect.revealDuration;



                        overlay.drawRevealEffect(effect, revealProgress, projection);



                    }



    



                    // --- Completion Callback ---



                    if (elapsedTime >= effect.revealDuration && !completedEffects.has(effect.id)) {



                        if (effect.onComplete) {



                            effect.onComplete();



                        }



                        completedEffects.set(effect.id, true);



                    }



                });



    



                if (hasActiveAnimations) {



                    animationFrameRef.current = requestAnimationFrame(animate);



                } else {



                    // If no more animations, ensure the fog is in its final state



                    overlay.drawFog();



                }



            };



    



            animationFrameRef.current = requestAnimationFrame(animate);



    



            return () => {



                if (animationFrameRef.current) {



                    cancelAnimationFrame(animationFrameRef.current);



                }



                // Final redraw to ensure state is clean



                if (overlay) {



                    overlay.clearEffects();



                    overlay.drawFog();



                }



            };



        }, [effects]);



    



    



        // The OverlayView implementation



        useEffect(() => {



            if (!map) return;



    



            class FinalCanvasOverlay extends window.google.maps.OverlayView {



                constructor() {



                    super();



                    this.props = {};



                    this.swPixel = null;



                    this.nePixel = null;



                    this.drawableClaimed = [];



                    this.drawableExplored = [];



    



                    this.fogCanvas = document.createElement('canvas');



                    this.fogCtx = this.fogCanvas.getContext('2d');



                    this.fogCanvas.style.position = 'absolute';



                    this.fogCanvas.style.pointerEvents = 'none';



                    // Remove transition, as animation is now handled by JS



                    // this.fogCanvas.style.transition = 'opacity 0.3s ease-in-out';



    



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



    



                // drawFog now only draws the permanent, explored areas



                drawFog() {



                    if (!this.swPixel) return;



    



                    this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);



                    this.fogCanvas.style.opacity = this.props.isAnimating ? '0.7' : '1';



                    this.fogCtx.fillStyle = 'rgba(26, 26, 26, 0.9)';



                    this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);



    



                    if (noisePatternRef.current) {



                        this.fogCtx.fillStyle = noisePatternRef.current;



                        this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);



                    }



                    



                    this.fogCtx.globalCompositeOperation = 'destination-out';



    



                    this.drawableExplored.forEach(cell => {



                        this.drawStaticReveal(cell);



                    });



    



                    this.fogCtx.globalCompositeOperation = 'source-over';



                }



    



                // Helper for drawing a static revealed area



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



    



                // New method for drawing the animated reveal effect



                drawRevealEffect(effect, progress, projection) {



                    const centerLatLng = new window.google.maps.LatLng(effect.position.lat, effect.position.lng);



                    const centerPixel = projection.fromLatLngToDivPixel(centerLatLng);



                    if (!centerPixel || !this.swPixel) return;



    



                    const x = centerPixel.x - this.swPixel.x;



                    const y = centerPixel.y - this.nePixel.y;



    



                    // Use a dummy grid cell to calculate pixel width for sizing



                    const dummySW = new window.google.maps.LatLng(effect.position.lat, effect.position.lng);



                    const dummyNE = new window.google.maps.LatLng(effect.position.lat + GRID_SIZE, effect.position.lng + GRID_SIZE);



                    const pixelSW = projection.fromLatLngToDivPixel(dummySW);



                    const pixelNE = projection.fromLatLngToDivPixel(dummyNE);



                    if (!pixelSW || !pixelNE) return;



                    const rectWidth = pixelNE.x - pixelSW.x;



    



                    const maxRadius = rectWidth * 2.5;



                    const currentRadius = maxRadius * progress; // Radius grows with progress



    



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



    



                // Renamed from drawEffects to be more specific



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



    



                drawDynamic() {



                    const projection = this.getProjection();



                    if (!projection || !this.swPixel) return;



    



                    const { hoveredCell, selectedCell } = this.props;



                    this.dynamicCtx.clearRect(0, 0, this.dynamicCanvas.width, this.dynamicCanvas.height);



    



                    const cellToHighlight = selectedCell ? selectedCell.key : hoveredCell;



    



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



    



                    this.dynamicCtx.fillStyle = 'rgba(59, 130, 246, 0.4)';



                    this.dynamicCtx.fillRect(rectX, rectY, rectWidth, rectHeight);



                }



            }



    



            const overlay = new FinalCanvasOverlay();



            overlay.setMap(map);



            overlayRef.current = overlay;



    



            let throttleTimeout = null;



            const THROTTLE_MS = 100;



    



            const updateGrid = () => {



                if (workerRef.current) {



                    const bounds = map.getBounds();



                    if (bounds) {



                        workerRef.current.postMessage({



                            bounds: {



                                southwest: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() },



                                northeast: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() }



                            },



                            zoom: map.getZoom(),



                            claimedCells: claimedCellsRef.current,



                            exploredCells: exploredCellsRef.current



                        });



                    }



                }



            };



    



            const boundsListener = map.addListener('bounds_changed', () => {



                if (throttleTimeout) return;



                throttleTimeout = setTimeout(() => {



                    updateGrid();



                    throttleTimeout = null;



                }, THROTTLE_MS);



            });



    



            const idleListener = map.addListener('idle', updateGrid);



    



            return () => {



                if (overlayRef.current) {



                    overlayRef.current.setMap(null);



                }



                window.google.maps.event.removeListener(boundsListener);



                window.google.maps.event.removeListener(idleListener);



                if (throttleTimeout) {



                    clearTimeout(throttleTimeout);



                }



            };



        }, [map]);



    



        useEffect(() => {



            if (!overlayRef.current) return;



            overlayRef.current.setProps({ zoom, hoveredCell, isAnimating, selectedCell });



            overlayRef.current.drawDynamic();



            // drawFog is now called inside the animation loop to composite correctly



        }, [zoom, hoveredCell, isAnimating, selectedCell]);



    



        useEffect(() => {



            if (!overlayRef.current) return;



            overlayRef.current.setDrawableCells(drawableClaimedCells, drawableExploredCells);



            overlayRef.current.drawFog(); // Initial draw



        }, [drawableClaimedCells, drawableExploredCells]);



    



        useEffect(() => {



            if (!map || !workerRef.current) return;



            const bounds = map.getBounds();



            if (bounds) {



                workerRef.current.postMessage({



                    bounds: {



                        southwest: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() },



                        northeast: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() }



                    },



                    zoom: map.getZoom(),



                    claimedCells: claimedCells,



                    exploredCells: exploredCells



                });



            }



        }, [claimedCells, exploredCells, map]);



    



        return null;



    };

export default CanvasOverlay;
