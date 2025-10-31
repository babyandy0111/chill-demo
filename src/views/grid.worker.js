const GRID_SIZE = 0.0005;

self.onmessage = (e) => {
    const { bounds, claimedCells, exploredCells } = e.data;

    // Create Sets for efficient lookup from the incoming arrays.
    // The data from the store now correctly has an 'id' property.
    const claimedCellKeys = new Set(claimedCells.map(cell => cell.id));
    const exploredCellKeys = new Set(exploredCells.map(cell => cell.id));

    const sw = bounds.southwest;
    const ne = bounds.northeast;

    const startIY = Math.floor(sw.lat / GRID_SIZE);
    const startIX = Math.floor(sw.lng / GRID_SIZE);
    const endIY = Math.floor(ne.lat / GRID_SIZE);
    const endIX = Math.floor(ne.lng / GRID_SIZE);

    const claimedCellsToDraw = [];
    const exploredCellsToDraw = [];

    // Iterate over the visible grid area
    for (let iy = startIY; iy <= endIY; iy++) {
        for (let ix = startIX; ix <= endIX; ix++) {
            const key = `${iy}_${ix}`;
            const south = iy * GRID_SIZE;
            const west = ix * GRID_SIZE;

            // Use the Sets to check for existence
            if (exploredCellKeys.has(key)) {
                exploredCellsToDraw.push({ south, west });
            }
            if (claimedCellKeys.has(key)) {
                claimedCellsToDraw.push({ south, west });
            }
        }
    }

    self.postMessage({ claimedCellsToDraw, exploredCellsToDraw });
};
