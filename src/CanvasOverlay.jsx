import { useEffect, useRef, useState } from 'react';
import cloudImageSrc from './assets/cloud.png';

const GRID_SIZE = 0.0005;
const cloudImage = new Image();
cloudImage.src = cloudImageSrc;

const CanvasOverlay = ({ map, zoom, claimedCells, hoveredCell }) => {
    const overlayRef = useRef(null);
    const workerRef = useRef(null);
    const [drawableCells, setDrawableCells] = useState([]);
    const claimedCellsRef = useRef(claimedCells);

    // This effect ensures the ref is always up-to-date
    useEffect(() => {
        claimedCellsRef.current = claimedCells;
    }, [claimedCells]);

    // Setup and terminate worker
    useEffect(() => {
        const worker = new Worker(new URL('./grid.worker.js', import.meta.url), { type: 'module' });
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const { cellsToDraw } = e.data;
            setDrawableCells(cellsToDraw);
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
                this.drawableCells = [];

                this.staticCanvas = document.createElement('canvas');
                this.staticCtx = this.staticCanvas.getContext('2d');
                this.staticCanvas.style.position = 'absolute';
                this.staticCanvas.style.pointerEvents = 'none';

                this.dynamicCanvas = document.createElement('canvas');
                this.dynamicCtx = this.dynamicCanvas.getContext('2d');
                this.dynamicCanvas.style.position = 'absolute';
                this.dynamicCanvas.style.pointerEvents = 'none';

                cloudImage.onload = () => this.drawStatic();
            }

            setProps(props) {
                this.props = { ...this.props, ...props };
            }

            setDrawableCells(cells) {
                this.drawableCells = cells;
            }

            onAdd() {
                const panes = this.getPanes();
                panes.overlayMouseTarget.appendChild(this.staticCanvas);
                panes.overlayMouseTarget.appendChild(this.dynamicCanvas);
            }

            onRemove() {
                if (this.staticCanvas.parentElement) {
                    this.staticCanvas.parentElement.removeChild(this.staticCanvas);
                }
                if (this.dynamicCanvas.parentElement) {
                    this.dynamicCanvas.parentElement.removeChild(this.dynamicCanvas);
                }
            }

            draw() {
                const projection = this.getProjection();
                if (!projection) return;

                const bounds = this.getMap().getBounds();
                const sw = bounds.getSouthWest();
                const ne = bounds.getNorthEast();
                const swPixel = projection.fromLatLngToDivPixel(sw);
                const nePixel = projection.fromLatLngToDivPixel(ne);

                if (!swPixel || !nePixel) return;

                this.swPixel = swPixel;
                this.nePixel = nePixel;

                const canvasWidth = nePixel.x - swPixel.x;
                const canvasHeight = swPixel.y - nePixel.y;

                this.staticCanvas.style.left = `${swPixel.x}px`;
                this.staticCanvas.style.top = `${nePixel.y}px`;
                this.staticCanvas.width = canvasWidth;
                this.staticCanvas.height = canvasHeight;

                this.dynamicCanvas.style.left = `${swPixel.x}px`;
                this.dynamicCanvas.style.top = `${nePixel.y}px`;
                this.dynamicCanvas.width = canvasWidth;
                this.dynamicCanvas.height = canvasHeight;

                this.drawStatic();
                this.drawDynamic();
            }

            drawStatic() {
                const projection = this.getProjection();
                if (!projection || !cloudImage.complete || !this.swPixel) return;

                this.staticCtx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);

                const { zoom } = this.props;
                if (zoom < 15) return;

                this.drawableCells.forEach(cell => {
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

                    this.staticCtx.drawImage(cloudImage, rectX, rectY, rectWidth, rectHeight);
                });
            }

            drawDynamic() {
                const projection = this.getProjection();
                if (!projection || !this.swPixel) return;

                const { zoom, hoveredCell } = this.props;
                this.dynamicCtx.clearRect(0, 0, this.dynamicCanvas.width, this.dynamicCanvas.height);

                if (zoom < 15 || !hoveredCell) return;

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

        const idleListener = map.addListener('idle', () => {
            if (workerRef.current) {
                const bounds = map.getBounds();
                if (bounds) {
                    workerRef.current.postMessage({
                        bounds: {
                            southwest: { lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng() },
                            northeast: { lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng() }
                        },
                        zoom: map.getZoom(),
                        claimedCells: claimedCellsRef.current // Always use the ref here
                    });
                }
            }
        });

        return () => {
            if (overlayRef.current) {
                overlayRef.current.setMap(null);
            }
            window.google.maps.event.removeListener(idleListener);
        };
    }, [map]);

    // This effect handles updates for dynamic properties like zoom and hover
    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setProps({ zoom, hoveredCell });
        overlayRef.current.drawDynamic();
    }, [zoom, hoveredCell]);

    // This effect redraws the static canvas when worker provides new cell data
    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setDrawableCells(drawableCells);
        overlayRef.current.drawStatic();
    }, [drawableCells]);

    // This effect explicitly tells the worker to re-calculate when claimedCells change
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
                claimedCells: claimedCells // Use the direct prop here is fine
            });
        }
    }, [claimedCells, map]);

    return null;
};

export default CanvasOverlay;