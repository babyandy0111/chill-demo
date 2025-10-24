import { useEffect, useRef } from 'react';
import cloudImageSrc from './assets/cloud.png';

const GRID_SIZE = 0.0005;

const cloudImage = new Image();
cloudImage.src = cloudImageSrc;

const CanvasOverlay = ({ map, zoom, claimedCells, hoveredCell }) => {
    const overlayRef = useRef(null);

    // Effect for creating, managing, and cleaning up the overlay
    useEffect(() => {
        if (!map) return;

        class FinalCanvasOverlay extends window.google.maps.OverlayView {
            constructor() {
                super();
                this.props = {};
                this.swPixel = null;
                this.nePixel = null;

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

                const { zoom, claimedCells } = this.props;
                this.staticCtx.clearRect(0, 0, this.staticCanvas.width, this.staticCanvas.height);

                if (zoom < 15) return;

                const bounds = this.getMap().getBounds();
                const sw = bounds.getSouthWest();
                const ne = bounds.getNorthEast();

                const startIY = Math.floor(sw.lat() / GRID_SIZE);
                const startIX = Math.floor(sw.lng() / GRID_SIZE);
                const endIY = Math.floor(ne.lat() / GRID_SIZE);
                const endIX = Math.floor(ne.lng() / GRID_SIZE);

                for (let iy = startIY; iy <= endIY; iy++) {
                    for (let ix = startIX; ix <= endIX; ix++) {
                        const key = `${iy}_${ix}`;
                        if (claimedCells && claimedCells[key]) {
                            const south = iy * GRID_SIZE;
                            const west = ix * GRID_SIZE;
                            const cellSW = new window.google.maps.LatLng(south, west);
                            const cellNE = new window.google.maps.LatLng(south + GRID_SIZE, west + GRID_SIZE);
                            const pixelSW = projection.fromLatLngToDivPixel(cellSW);
                            const pixelNE = projection.fromLatLngToDivPixel(cellNE);

                            if (!pixelSW || !pixelNE) continue;

                            const rectX = pixelSW.x - this.swPixel.x;
                            const rectY = pixelNE.y - this.nePixel.y;
                            const rectWidth = pixelNE.x - pixelSW.x;
                            const rectHeight = pixelSW.y - pixelNE.y;

                            this.staticCtx.drawImage(cloudImage, rectX, rectY, rectWidth, rectHeight);
                        }
                    }
                }
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

        overlayRef.current = new FinalCanvasOverlay();
        overlayRef.current.setMap(map);
        overlayRef.current.setProps({ zoom, claimedCells, hoveredCell });

        return () => {
            if (overlayRef.current) {
                overlayRef.current.setMap(null);
            }
        };
    }, [map]);

    // Effect for redrawing static content (clouds)
    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setProps({ zoom, claimedCells });
        overlayRef.current.drawStatic();
    }, [zoom, claimedCells]);

    // Effect for redrawing dynamic content (hover)
    useEffect(() => {
        if (!overlayRef.current) return;
        overlayRef.current.setProps({ hoveredCell });
        overlayRef.current.drawDynamic();
    }, [hoveredCell]);

    return null;
};

export default CanvasOverlay;