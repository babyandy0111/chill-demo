import { db } from '../db.js';
import { quadtree } from 'd3-quadtree'; // Import d3-quadtree

const GRID_SIZE = 0.0005;

let lastKnownBounds = null;
let isQuadtreeInitialized = false;

// Global Quadtree instances
let exploredQuadtree = quadtree()
    .x(d => d.ix)
    .y(d => d.iy);
let claimedQuadtree = quadtree()
    .x(d => d.ix)
    .y(d => d.iy);

async function initQuadtrees() {
    if (isQuadtreeInitialized) return;

    try {
        const [allExploredCells, allClaimedCells] = await Promise.all([
            db.exploredCells.toArray(),
            db.claimedCells.toArray()
        ]);

        exploredQuadtree = quadtree()
            .x(d => d.ix)
            .y(d => d.iy)
            .addAll(allExploredCells);

        claimedQuadtree = quadtree()
            .x(d => d.ix)
            .y(d => d.iy)
            .addAll(allClaimedCells);

        isQuadtreeInitialized = true;
        console.log("[Worker] Quadtrees initialized with all data.");
    } catch (error) {
        console.error("[Worker] Error initializing Quadtrees:", error);
    }
}

// --- Function to calculate drawable cells by querying DB directly ---


async function calculateAndPostCells(bounds) {
    if (!bounds) return;
    lastKnownBounds = bounds; // Save the latest bounds

    await initQuadtrees(); // Ensure quadtrees are built

    const sw = bounds.southwest;
    const ne = bounds.northeast;

    const startIY = Math.floor(sw.lat / GRID_SIZE);
    const startIX = Math.floor(sw.lng / GRID_SIZE);
    const endIY = Math.floor(ne.lat / GRID_SIZE);
    const endIX = Math.floor(ne.lng / GRID_SIZE);

    const claimedCellsInView = [];
    claimedQuadtree.visit((node, x0, y0, x1, y1) => {
        if (!node.length) { // It's a leaf node
            do {
                const d = node.data;
                if (d.ix >= startIX && d.ix <= endIX && d.iy >= startIY && d.iy <= endIY) {
                    claimedCellsInView.push(d);
                }
                // eslint-disable-next-line no-cond-assign
            } while (node = node.next);
        }
        // Return true if the quadtree node is outside the query bounds, to prune the search
        return x0 > endIX || y0 > endIY || x1 < startIX || y1 < startIY;
    });

    const exploredCellsInView = [];
    exploredQuadtree.visit((node, x0, y0, x1, y1) => {
        if (!node.length) { // It's a leaf node
            do {
                const d = node.data;
                if (d.ix >= startIX && d.ix <= endIX && d.iy >= startIY && d.iy <= endIY) {
                    exploredCellsInView.push(d);
                }
                // eslint-disable-next-line no-cond-assign
            } while (node = node.next);
        }
        // Return true if the quadtree node is outside the query bounds, to prune the search
        return x0 > endIX || y0 > endIY || x1 < startIX || y1 < startIY;
    });

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
}

// --- Message router ---
self.onmessage = async (e) => {
    const { type, payload } = e.data;

    switch (type) {
        case 'BOUNDS_CHANGED':
            calculateAndPostCells(payload.bounds);
            break;

        case 'DATA_UPDATED':
            // Force re-initialization of quadtrees from IndexedDB
            isQuadtreeInitialized = false;
            await initQuadtrees();

            if (lastKnownBounds) {
                calculateAndPostCells(lastKnownBounds);
            }
            break;
    }
};