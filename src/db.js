import Dexie from 'dexie';

export const db = new Dexie('ChillGameDB');

db.version(1).stores({
    exploredCells: 'id, [iy+ix]', // id is the cell key (e.g., "lat_lng")
    claimedCells: 'id, [iy+ix]',  // id is the cell key
    gameState: 'key'     // key for single-value states like 'clouds'
});

// Optional: Open the database to catch any errors early
db.open().catch((error) => {
    console.error("Failed to open IndexedDB:", error);
});
