import { db } from '../db.js';

const GRID_SIZE = 0.0005;

let claimedCellKeys = new Set();
let exploredCellKeys = new Set();
let lastKnownBounds = null;
let dataSynced = false; // Flag to check if initial sync is done

// --- Function to load all data from IndexedDB into memory ---
async function syncDataFromDB() {
    try {
        const [claimed, explored] = await Promise.all([
            db.claimedCells.toArray(),
            db.exploredCells.toArray()
        ]);
        claimedCellKeys = new Set(claimed.map(cell => cell.id));
        exploredCellKeys = new Set(explored.map(cell => cell.id));
        dataSynced = true; // Mark sync as complete
        console.log(`[Worker] Synced data: ${claimedCellKeys.size} claimed, ${exploredCellKeys.size} explored.`);
    } catch (error) {
        console.error("[Worker] Error syncing data from IndexedDB:", error);
    }
}

// --- Function to calculate drawable cells based on current memory state ---
function calculateAndPostCells(bounds) {
    if (!bounds) return;
    lastKnownBounds = bounds; // Save the latest bounds

    const sw = bounds.southwest;
    const ne = bounds.northeast;

    const startIY = Math.floor(sw.lat / GRID_SIZE);
    const startIX = Math.floor(sw.lng / GRID_SIZE);
    const endIY = Math.floor(ne.lat / GRID_SIZE);
    const endIX = Math.floor(ne.lng / GRID_SIZE);

    const claimedCellsToDraw = [];
    const exploredCellsToDraw = [];

    for (let iy = startIY; iy <= endIY; iy++) {
        for (let ix = startIX; ix <= endIX; ix++) {
            const key = `${iy}_${ix}`;
            const south = iy * GRID_SIZE;
            const west = ix * GRID_SIZE;

            if (exploredCellKeys.has(key)) {
                exploredCellsToDraw.push({ south, west });
            }
            if (claimedCellKeys.has(key)) {
                claimedCellsToDraw.push({ south, west });
            }
        }
    }

    self.postMessage({ claimedCellsToDraw, exploredCellsToDraw });
}

// --- Message router ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'BOUNDS_CHANGED':
            // If this is the first time, sync from DB first.
            if (!dataSynced) {
                await syncDataFromDB();
            }
            calculateAndPostCells(payload.bounds);
            break;

        case 'DATA_UPDATED':
            // Force a re-sync from the database
            await syncDataFromDB();
            // Recalculate using the last known map position
            if (lastKnownBounds) {
                calculateAndPostCells(lastKnownBounds);
            }
            break;
    }
};
