import { useEffect, useRef, useCallback } from 'react';
import cloudImageSrc from './assets/cloud.png';

const GRID_SIZE = 0.0005;

const cloudImage = new Image();
cloudImage.src = cloudImageSrc;

// --- Debounce Utility ---
// This function delays the execution of `func` until after `wait` ms have elapsed
// since the last time it was invoked.
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const CanvasOverlay = ({ map, zoom, claimedCells, hoveredCell }) => {
  const overlayRef = useRef(null);
  const listenerRef = useRef(null);

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
        cloudImage.onload = () => this.draw();
      }

      setProps(props) {
        this.props = props;
        // We need to redraw if props that affect visuals (like hoveredCell) change.
        this.draw();
      }

      onAdd() {
        const panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(this.canvas);
      }

      onRemove() {
        if (this.canvas.parentElement) {
          this.canvas.parentElement.removeChild(this.canvas);
        }
      }

      draw() {
        const projection = this.getProjection();
        if (!projection || !map) return;

        const { zoom, claimedCells, hoveredCell } = this.props;

        const bounds = map.getBounds();
        if (!bounds) return;

        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const swPixel = projection.fromLatLngToDivPixel(sw);
        const nePixel = projection.fromLatLngToDivPixel(ne);

        if (!swPixel || !nePixel) return;

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

      // Create a debounced version of the draw function.
      const debouncedDraw = debounce(() => {
        if (overlayRef.current) {
          overlayRef.current.draw();
        }
      }, 100); // 100ms delay

      // Add the listener for map bounds changes.
      listenerRef.current = map.addListener('bounds_changed', debouncedDraw);
    }

    // Update props whenever they change, which will trigger a redraw for things like hovering.
    overlayRef.current.setProps({ zoom, claimedCells, hoveredCell });

  }, [map]); // This effect should only run when the map instance is created.

  // Update props when they change without re-running the entire setup effect.
  useEffect(() => {
      if (overlayRef.current) {
          overlayRef.current.setProps({ zoom, claimedCells, hoveredCell });
      }
  }, [zoom, claimedCells, hoveredCell]);


  useEffect(() => {
    // Cleanup function to remove the overlay and listener when the component unmounts.
    return () => {
      if (listenerRef.current) {
        window.google.maps.event.removeListener(listenerRef.current);
      }
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
    };
  }, []);

  return null;
};

export default CanvasOverlay;