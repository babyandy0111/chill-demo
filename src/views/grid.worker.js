const GRID_SIZE = 0.0005;

self.onmessage = (e) => {
    const {bounds, zoom, claimedCells, exploredCells} = e.data;

    if (zoom < 15) {
        self.postMessage({claimedCellsToDraw: [], exploredCellsToDraw: []});
        return;
    }

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

            if (exploredCells && exploredCells[key]) {
                exploredCellsToDraw.push({south, west});
            }
            if (claimedCells && claimedCells[key]) {
                claimedCellsToDraw.push({south, west});
            }
        }
    }

    self.postMessage({claimedCellsToDraw, exploredCellsToDraw});
};
