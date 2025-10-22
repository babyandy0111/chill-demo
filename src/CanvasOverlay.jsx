import { useEffect, useRef } from 'react';
import cloudImageSrc from './assets/cloud.png';

const GRID_SIZE = 0.0005;

const cloudImage = new Image();
cloudImage.src = cloudImageSrc;

const CanvasOverlay = ({ map, zoom, claimedCells, hoveredCell }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    class FinalCanvasOverlay extends window.google.maps.OverlayView {
      constructor() {
        super();
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.props = {};
        this.canvas.style.position = 'absolute';
        this.canvas.style.pointerEvents = 'none';

        // The visual debugging background has been removed.

        cloudImage.onload = () => this.draw();
      }

      setProps(props) {
        this.props = props;
      }

      onAdd() {
        const panes = this.getPanes();
        // We use overlayMouseTarget because it is designed for this kind of overlay
        // and sits correctly in the layer stack.
        panes.overlayMouseTarget.appendChild(this.canvas);
      }

      onRemove() {
        if (this.canvas.parentElement) {
          this.canvas.parentElement.removeChild(this.canvas);
        }
      }

      draw() {
        const projection = this.getProjection();
        if (!projection) return;

        const { zoom, claimedCells, hoveredCell } = this.props;

        // This is the robust method for sizing and positioning the overlay.
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const swPixel = projection.fromLatLngToDivPixel(sw);
        const nePixel = projection.fromLatLngToDivPixel(ne);

        if (!swPixel || !nePixel) return;

        // Position and size the canvas to perfectly match the map's viewport.
        this.canvas.style.left = `${swPixel.x}px`;
        this.canvas.style.top = `${nePixel.y}px`;
        this.canvas.width = nePixel.x - swPixel.x;
        this.canvas.height = swPixel.y - nePixel.y;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (zoom < 15) return;

        const startIY = Math.floor(sw.lat() / GRID_SIZE);
        const startIX = Math.floor(sw.lng() / GRID_SIZE);
        const endIY = Math.floor(ne.lat() / GRID_SIZE);
        const endIX = Math.floor(ne.lng() / GRID_SIZE);

        for (let iy = startIY; iy <= endIY; iy++) {
          for (let ix = startIX; ix <= endIX; ix++) {
            const key = `${iy}_${ix}`;
            const south = iy * GRID_SIZE;
            const west = ix * GRID_SIZE;
            
            const cellSW = new window.google.maps.LatLng(south, west);
            const cellNE = new window.google.maps.LatLng(south + GRID_SIZE, west + GRID_SIZE);
            
            const pixelSW = projection.fromLatLngToDivPixel(cellSW);
            const pixelNE = projection.fromLatLngToDivPixel(cellNE);

            if (!pixelSW || !pixelNE) continue;

            // Translate from world coordinates (DivPixel) to canvas-local coordinates.
            const rectX = pixelSW.x - swPixel.x;
            const rectY = pixelNE.y - nePixel.y;
            const rectWidth = pixelNE.x - pixelSW.x;
            const rectHeight = pixelSW.y - pixelNE.y;

            if (claimedCells && claimedCells[key]) {
              if (cloudImage.complete) {
                this.ctx.drawImage(cloudImage, rectX, rectY, rectWidth, rectHeight);
              }
            } else {
              if (key === hoveredCell) {
                this.ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
                this.ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
              }
            }
          }
        }
      }
    }

    if (!overlayRef.current) {
      overlayRef.current = new FinalCanvasOverlay();
      overlayRef.current.setMap(map);
    }

    overlayRef.current.setProps({ zoom, claimedCells, hoveredCell });
    overlayRef.current.draw();

  }, [map, zoom, claimedCells, hoveredCell]);

  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, []);

  return null;
};

export default CanvasOverlay;