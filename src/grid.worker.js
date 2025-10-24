const GRID_SIZE = 0.0005;

self.onmessage = (e) => {
    const { bounds, zoom, claimedCells } = e.data;

    if (zoom < 15) {
        self.postMessage({ cellsToDraw: [] });
        return;
    }

    const sw = bounds.southwest;
    const ne = bounds.northeast;

    const startIY = Math.floor(sw.lat / GRID_SIZE);
    const startIX = Math.floor(sw.lng / GRID_SIZE);
    const endIY = Math.floor(ne.lat / GRID_SIZE);
    const endIX = Math.floor(ne.lng / GRID_SIZE);

    const cellsToDraw = [];

    for (let iy = startIY; iy <= endIY; iy++) {
        for (let ix = startIX; ix <= endIX; ix++) {
            const key = `${iy}_${ix}`;
            if (claimedCells && claimedCells[key]) {
                const south = iy * GRID_SIZE;
                const west = ix * GRID_SIZE;
                cellsToDraw.push({ south, west });
            }
        }
    }

    self.postMessage({ cellsToDraw });
};
