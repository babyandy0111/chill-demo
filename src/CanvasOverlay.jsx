import React, { useCallback, useEffect, useRef } from 'react';
import { OverlayView } from '@react-google-maps/api';

const GRID_SIZE = 0.0005;

const CanvasOverlay = ({ bounds, zoom, claimedCells, hoveredCell }) => {
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);

  const onOverlayLoad = useCallback((overlay) => {
    overlayRef.current = overlay;
    // Replace the draw method
    overlay.draw = () => draw(overlay);
  }, []);

  const onOverlayUnmount = useCallback((overlay) => {
    overlay.draw = () => {};
  }, []);

  const draw = (overlay) => {
    const projection = overlay.getProjection();
    const map = overlay.getMap();
    if (!projection || !map || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mapDiv = map.getDiv();

    if (canvas.width !== mapDiv.clientWidth) canvas.width = mapDiv.clientWidth;
    if (canvas.height !== mapDiv.clientHeight) canvas.height = mapDiv.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (zoom < 17) return;

    const currentBounds = map.getBounds();
    if (!currentBounds) return;

    const ne = currentBounds.getNorthEast();
    const sw = currentBounds.getSouthWest();

    const startLat = Math.floor(sw.lat() / GRID_SIZE) * GRID_SIZE;
    const startLng = Math.floor(sw.lng() / GRID_SIZE) * GRID_SIZE;

    for (let lat = startLat; lat < ne.lat() + GRID_SIZE; lat += GRID_SIZE) {
      for (let lng = startLng; lng < ne.lng() + GRID_SIZE; lng += GRID_SIZE) {
        const key = `${lat}_${lng}`;
        const cellSW = new window.google.maps.LatLng(lat, lng);
        const cellNE = new window.google.maps.LatLng(lat + GRID_SIZE, lng + GRID_SIZE);

        const swPixel = projection.fromLatLngToDivPixel(cellSW);
        const nePixel = projection.fromLatLngToDivPixel(cellNE);

        if (!swPixel || !nePixel) continue;

        ctx.beginPath();
        ctx.rect(swPixel.x, nePixel.y, nePixel.x - swPixel.x, swPixel.y - nePixel.y);

        if (claimedCells[key]) {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
          ctx.fill();
        } else if (key === hoveredCell) {
          ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
        }

        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  };

  // Redraw when props change
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.draw();
    }
  }, [bounds, zoom, claimedCells, hoveredCell]);

  return (
    <OverlayView
      mapPaneName={OverlayView.MAP_PANE}
      onLoad={onOverlayLoad}
      onUnmount={onOverlayUnmount}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
    </OverlayView>
  );
};

export default CanvasOverlay;