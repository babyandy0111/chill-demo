import { useEffect, useRef } from 'react';
import cloudImageSrc from './assets/cloud.png';

const GRID_SIZE = 0.0005;

const cloudImage = new Image();
cloudImage.src = cloudImageSrc;

const CanvasOverlay = ({ map, zoom, claimedCells, hoveredCell }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    class FinalCorrectedOverlay extends window.google.maps.OverlayView {
      constructor() {
        super();
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.props = {};
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0px';
        this.canvas.style.top = '0px';
        this.canvas.style.pointerEvents = 'none';
        cloudImage.onload = () => this.draw();
      }

      setProps(props) {
        this.props = props;
      }

      onAdd() {
        const panes = this.getPanes();
        // Attaching to overlayMouseTarget is crucial for correct positioning and interaction.
        panes.overlayMouseTarget.appendChild(this.canvas);
      }

      onRemove() {
        if (this.canvas.parentElement) {
          this.canvas.parentElement.removeChild(this.canvas);
        }
      }

      draw() {
        const projection = this.getProjection();
        if (!projection || !this.canvas) return;

        const { zoom, claimedCells, hoveredCell } = this.props;

        const mapDiv = map.getDiv();
        const mapWidth = mapDiv.clientWidth;
        const mapHeight = mapDiv.clientHeight;

        if (this.canvas.width !== mapWidth) this.canvas.width = mapWidth;
        if (this.canvas.height !== mapHeight) this.canvas.height = mapHeight;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (zoom < 17) return;

        const bounds = map.getBounds();
        if (!bounds) return;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

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
            
            const swPixel = projection.fromLatLngToDivPixel(cellSW);
            const nePixel = projection.fromLatLngToDivPixel(cellNE);

            if (!swPixel || !nePixel) continue;

            const rectX = swPixel.x;
            const rectY = nePixel.y;
            const rectWidth = nePixel.x - swPixel.x;
            const rectHeight = swPixel.y - nePixel.y;

            if (claimedCells && claimedCells[key]) {
              if (cloudImage.complete) {
                this.ctx.drawImage(cloudImage, rectX, rectY, rectWidth, rectHeight);
              }
            } 
            else {
              if (key === hoveredCell) {
                this.ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
                this.ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
              }
              this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.75)';
              this.ctx.lineWidth = 5;
              this.ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
            }
          }
        }
      }
    }

    if (!overlayRef.current) {
      overlayRef.current = new FinalCorrectedOverlay();
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
