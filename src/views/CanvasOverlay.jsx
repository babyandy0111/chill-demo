import { useEffect, useRef, useState } from 'react';
import cloudImageSrc from '../assets/cloud.png';

// --- Inject CSS Keyframes for the claim animation ---
const keyframes = `
  @keyframes chill-claim {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = keyframes;
document.head.appendChild(styleSheet);


const GRID_SIZE = 0.0005;
const cloudImage = new Image();
cloudImage.src = cloudImageSrc;

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

const CanvasOverlay = ({ map, zoom, claimedCells, exploredCells, hoveredCell, isAnimating }) => {
    const overlayRef = useRef(null);
    const workerRef = useRef(null);
    const [drawableClaimedCells, setDrawableClaimedCells] = useState([]);
    const [drawableExploredCells, setDrawableExploredCells] = useState([]);
    const claimedCellsRef = useRef(claimedCells);
    const exploredCellsRef = useRef(exploredCells);
    const noisePatternRef = useRef(null);
    const animatedCells = useRef(new Set()); // Track cells that have been animated

    useEffect(() => {
        // When claimedCells changes, check for new cells to animate
        const newCells = Object.keys(claimedCells).filter(key => !claimedCellsRef.current[key]);
        newCells.forEach(key => animatedCells.current.add(key));
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
        };
    }, []);

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
                this.cloudElements = new Map(); // Store references to cloud elements for animation

                this.fogCanvas = document.createElement('canvas');
                this.fogCtx = this.fogCanvas.getContext('2d');
                this.fogCanvas.style.position = 'absolute';
                this.fogCanvas.style.pointerEvents = 'none';
                this.fogCanvas.style.transition = 'opacity 0.3s ease-in-out'; // Smooth transition for opacity

                this.cloudsContainer = document.createElement('div'); // Use a div container for clouds
                this.cloudsContainer.style.position = 'absolute';
                this.cloudsContainer.style.pointerEvents = 'none';

                this.dynamicCanvas = document.createElement('canvas');
                this.dynamicCtx = this.dynamicCanvas.getContext('2d');
                this.dynamicCanvas.style.position = 'absolute';
                this.dynamicCanvas.style.pointerEvents = 'none';

                cloudImage.onload = () => this.drawClouds();
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
                panes.overlayMouseTarget.appendChild(this.cloudsContainer);
                panes.overlayMouseTarget.appendChild(this.dynamicCanvas);
            }

            onRemove() {
                [this.fogCanvas, this.cloudsContainer, this.dynamicCanvas].forEach(canvas => {
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

                this.fogCanvas.style.left = `${swPixelOriginal.x - overscanWidth}px`;
                this.fogCanvas.style.top = `${nePixelOriginal.y - overscanHeight}px`;
                this.fogCanvas.width = canvasWidth;
                this.fogCanvas.height = canvasHeight;

                this.cloudsContainer.style.left = `${swPixelOriginal.x - overscanWidth}px`;
                this.cloudsContainer.style.top = `${nePixelOriginal.y - overscanHeight}px`;
                this.cloudsContainer.style.width = `${canvasWidth}px`;
                this.cloudsContainer.style.height = `${canvasHeight}px`;

                this.dynamicCanvas.style.left = `${swPixelOriginal.x - overscanWidth}px`;
                this.dynamicCanvas.style.top = `${nePixelOriginal.y - overscanHeight}px`;
                this.dynamicCanvas.width = canvasWidth;
                this.dynamicCanvas.height = canvasHeight;

                this.drawFog();
                this.drawClouds();
                this.drawDynamic();
            }

            drawFog() {
                const projection = this.getProjection();
                if (!projection || !this.swPixel) return;

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
                    const radiusX = rectWidth * 1.5;
                    const radiusY = rectHeight * 1.5;

                    const gradient = this.fogCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(radiusX, radiusY));
                    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
                    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.fogCtx.fillStyle = gradient;
                    this.fogCtx.beginPath();
                    this.fogCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
                    this.fogCtx.fill();
                });

                this.fogCtx.globalCompositeOperation = 'source-over';
            }

            drawClouds() {
                const projection = this.getProjection();
                if (!projection || !cloudImage.complete || !this.swPixel) return;

                const currentKeys = new Set();
                this.drawableClaimed.forEach(cell => {
                    const key = `${cell.south}_${cell.west}`;
                    currentKeys.add(key);

                    let img = this.cloudElements.get(key);
                    if (!img) {
                        img = cloudImage.cloneNode();
                        img.style.position = 'absolute';
                        this.cloudElements.set(key, img);
                        this.cloudsContainer.appendChild(img);
                    }

                    const pixelSW = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(cell.south, cell.west));
                    const pixelNE = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(cell.south + GRID_SIZE, cell.west + GRID_SIZE));
                    if (!pixelSW || !pixelNE) return;

                    img.style.left = `${pixelSW.x - this.swPixel.x}px`;
                    img.style.top = `${pixelNE.y - this.nePixel.y}px`;
                    img.style.width = `${pixelNE.x - pixelSW.x}px`;
                    img.style.height = `${pixelSW.y - pixelNE.y}px`;

                    if (animatedCells.current.has(key)) {
                        img.style.animation = `chill-claim 1s ease-out forwards`;
                        animatedCells.current.delete(key); // Animate only once
                    }
                });

                // Garbage collect old cloud elements
                this.cloudElements.forEach((img, key) => {
                    if (!currentKeys.has(key)) {
                        img.remove();
                        this.cloudElements.delete(key);
                    }
                });
            }

            drawDynamic() {
                const projection = this.getProjection();
                if (!projection || !this.swPixel) return;

                const { hoveredCell } = this.props;
                this.dynamicCtx.clearRect(0, 0, this.dynamicCanvas.width, this.dynamicCanvas.height);

                if (!hoveredCell) return;

                const [iy, ix] = hoveredCell.split('_').map(Number);
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
        overlayRef.current.setProps({ zoom, hoveredCell, isAnimating });
        overlayRef.current.drawDynamic();
        overlayRef.current.drawFog();
    }, [zoom, hoveredCell, isAnimating]);

    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setDrawableCells(drawableClaimedCells, drawableExploredCells);
        overlayRef.current.drawFog();
        overlayRef.current.drawClouds();
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