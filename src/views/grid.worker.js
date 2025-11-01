import { db } from '../db.js';

const GRID_SIZE = 0.0005;

let lastKnownBounds = null; // Still need to store last known bounds for DATA_UPDATED

// --- Function to calculate drawable cells by querying DB directly ---
async function calculateAndPostCells(bounds) {
    if (!bounds) return;
    lastKnownBounds = bounds; // Save the latest bounds

    const sw = bounds.southwest;
    const ne = bounds.northeast;

    const startIY = Math.floor(sw.lat / GRID_SIZE);
    const startIX = Math.floor(sw.lng / GRID_SIZE);
    const endIY = Math.floor(ne.lat / GRID_SIZE);
    const endIX = Math.floor(ne.lng / GRID_SIZE);

            try {
                // Query both tables for cells within the visible bounds
                const [claimedCellsInView, exploredCellsInView] = await Promise.all([
                    db.claimedCells.where('[iy+ix]').between([startIY, startIX], [endIY, endIX]).toArray(),
                    db.exploredCells.where('[iy+ix]').between([startIY, startIX], [endIY, endIX]).toArray()
                ]);
    
                // --- Logic to ensure claimed cells are always explored ---
                const exploredMap = new Map();
                // First, add all officially explored cells
                exploredCellsInView.forEach(cell => exploredMap.set(cell.id, cell));
                // Then, add all claimed cells, overwriting duplicates. This handles inconsistent data.
                claimedCellsInView.forEach(cell => exploredMap.set(cell.id, cell));
    
                const combinedExploredCells = Array.from(exploredMap.values());
    
                const claimedCellsToDraw = claimedCellsInView.map(cell => ({ south: cell.iy * GRID_SIZE, west: cell.ix * GRID_SIZE }));
                const exploredCellsToDraw = combinedExploredCells.map(cell => ({ south: cell.iy * GRID_SIZE, west: cell.ix * GRID_SIZE }));
    
                self.postMessage({ claimedCellsToDraw, exploredCellsToDraw });
    
            } catch (error) {
                console.error("[Worker] Error querying IndexedDB for cells:", error);
            }}

// --- Message router ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'BOUNDS_CHANGED':
            calculateAndPostCells(payload.bounds);
            break;

        case 'DATA_UPDATED':
            // Recalculate using the last known map position, which will trigger a fresh DB query
            if (lastKnownBounds) {
                calculateAndPostCells(lastKnownBounds);
            }
            break;
    }
};