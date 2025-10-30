import {useEffect, useRef, useState} from 'react';
import cloudImageSrc from './assets/cloud.png';

const GRID_SIZE = 0.0005;
const cloudImage = new Image();
cloudImage.src = cloudImageSrc;

const CanvasOverlay = ({map, zoom, claimedCells, exploredCells, hoveredCell}) => {
    const overlayRef = useRef(null);
    const workerRef = useRef(null);
    const [drawableClaimedCells, setDrawableClaimedCells] = useState([]);
    const [drawableExploredCells, setDrawableExploredCells] = useState([]);
    const claimedCellsRef = useRef(claimedCells);
    const exploredCellsRef = useRef(exploredCells);

    useEffect(() => {
        claimedCellsRef.current = claimedCells;
    }, [claimedCells]);

    useEffect(() => {
        exploredCellsRef.current = exploredCells;
    }, [exploredCells]);

    useEffect(() => {
        const worker = new Worker(new URL('./grid.worker.js', import.meta.url), {type: 'module'});
        workerRef.current = worker;

        worker.onmessage = (e) => {
            const {claimedCellsToDraw, exploredCellsToDraw} = e.data;
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

                this.fogCanvas = document.createElement('canvas');
                this.fogCtx = this.fogCanvas.getContext('2d');
                this.fogCanvas.style.position = 'absolute';
                this.fogCanvas.style.pointerEvents = 'none';

                this.cloudsCanvas = document.createElement('canvas');
                this.cloudsCtx = this.cloudsCanvas.getContext('2d');
                this.cloudsCanvas.style.position = 'absolute';
                this.cloudsCanvas.style.pointerEvents = 'none';

                this.dynamicCanvas = document.createElement('canvas');
                this.dynamicCtx = this.dynamicCanvas.getContext('2d');
                this.dynamicCanvas.style.position = 'absolute';
                this.dynamicCanvas.style.pointerEvents = 'none';

                cloudImage.onload = () => this.drawClouds();
            }

            setProps(props) {
                this.props = {...this.props, ...props};
            }

            setDrawableCells(claimed, explored) {
                this.drawableClaimed = claimed;
                this.drawableExplored = explored;
            }

            onAdd() {
                const panes = this.getPanes();
                panes.overlayLayer.appendChild(this.fogCanvas);
                panes.overlayMouseTarget.appendChild(this.cloudsCanvas);
                panes.overlayMouseTarget.appendChild(this.dynamicCanvas);
            }

            onRemove() {
                [this.fogCanvas, this.cloudsCanvas, this.dynamicCanvas].forEach(canvas => {
                    if (canvas.parentElement) {
                        canvas.parentElement.removeChild(canvas);
                    }
                });
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

                [this.fogCanvas, this.cloudsCanvas, this.dynamicCanvas].forEach(canvas => {
                    canvas.style.left = `${swPixel.x}px`;
                    canvas.style.top = `${nePixel.y}px`;
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                });

                this.drawFog();
                this.drawClouds();
                this.drawDynamic();
            }

            drawFog() {
                const projection = this.getProjection();
                if (!projection || !this.swPixel) return;
                const {zoom} = this.props;

                this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
                if (zoom < 15) return;

                this.fogCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
                this.fogCtx.globalCompositeOperation = 'destination-out';

                this.drawableExplored.forEach(cell => {
                    const {south, west} = cell;
                    const pixelSW = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(south, west));
                    const pixelNE = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(south + GRID_SIZE, west + GRID_SIZE));
                    if (!pixelSW || !pixelNE) return;
                    this.fogCtx.fillRect(
                        pixelSW.x - this.swPixel.x,
                        pixelNE.y - this.nePixel.y,
                        pixelNE.x - pixelSW.x,
                        pixelSW.y - pixelNE.y
                    );
                });
                this.fogCtx.globalCompositeOperation = 'source-over';
            }

            drawClouds() {
                const projection = this.getProjection();
                if (!projection || !cloudImage.complete || !this.swPixel) return;
                const {zoom} = this.props;

                this.cloudsCtx.clearRect(0, 0, this.cloudsCanvas.width, this.cloudsCanvas.height);
                if (zoom < 15) return;

                this.drawableClaimed.forEach(cell => {
                    const {south, west} = cell;
                    const pixelSW = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(south, west));
                    const pixelNE = projection.fromLatLngToDivPixel(new window.google.maps.LatLng(south + GRID_SIZE, west + GRID_SIZE));
                    if (!pixelSW || !pixelNE) return;
                    this.cloudsCtx.drawImage(cloudImage,
                        pixelSW.x - this.swPixel.x,
                        pixelNE.y - this.nePixel.y,
                        pixelNE.x - pixelSW.x,
                        pixelSW.y - pixelNE.y
                    );
                });
            }

            drawDynamic() {
                const projection = this.getProjection();
                if (!projection || !this.swPixel) return;

                const {zoom, hoveredCell} = this.props;
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
                            southwest: {lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng()},
                            northeast: {lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng()}
                        },
                        zoom: map.getZoom(),
                        claimedCells: claimedCellsRef.current,
                        exploredCells: exploredCellsRef.current
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

    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setProps({zoom, hoveredCell});
        overlayRef.current.drawDynamic();
    }, [zoom, hoveredCell]);

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
                    southwest: {lat: bounds.getSouthWest().lat(), lng: bounds.getSouthWest().lng()},
                    northeast: {lat: bounds.getNorthEast().lat(), lng: bounds.getNorthEast().lng()}
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