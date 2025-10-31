import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from './db'; // Import our IndexedDB instance

const GRID_SIZE = 0.0005;

export const useAppStore = create(
    immer((set, get) => ({
        // --- STATE ---
        clouds: 10,
        claimedCells: {},
        exploredCells: {},
        selectedCell: null,
        userLocation: null,
        isHydrated: false,
        lastCloudIncrease: Date.now(), // Track the timestamp of the last cloud increase

        // --- ACTIONS ---

        // Hydrate the store from IndexedDB
        hydrate: async () => {
            try {
                const [exploredCellsArray, claimedCellsArray, cloudsState, lastIncreaseState] = await Promise.all([
                    db.exploredCells.toArray(),
                    db.claimedCells.toArray(),
                    db.gameState.get('clouds'),
                    db.gameState.get('lastCloudIncrease'),
                ]);

                const exploredCells = {};
                exploredCellsArray.forEach(cell => {
                    exploredCells[cell.id] = true;
                });

                const claimedCells = {};
                claimedCellsArray.forEach(cell => {
                    claimedCells[cell.id] = cell.data;
                });

                set((state) => {
                    state.exploredCells = exploredCells;
                    state.claimedCells = claimedCells;
                    state.clouds = cloudsState ? cloudsState.value : 10;
                    state.lastCloudIncrease = lastIncreaseState ? lastIncreaseState.value : Date.now();
                    state.isHydrated = true;
                });
            } catch (error) {
                console.error("Failed to hydrate store from IndexedDB:", error);
                set((state) => { state.isHydrated = true; });
            }
        },

        increaseCloud: () => {
            const now = Date.now();
            set((state) => {
                if (state.clouds < 10) {
                    state.clouds += 1;
                    state.lastCloudIncrease = now;
                }
            });
            // Save to IndexedDB
            db.gameState.put({ key: 'clouds', value: get().clouds }).catch(e => console.error("Failed to put clouds state:", e));
            db.gameState.put({ key: 'lastCloudIncrease', value: now }).catch(e => console.error("Failed to put lastCloudIncrease state:", e));
        },
        
        // Initializes geolocation tracking
        initializeGeolocation: () => {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    set((state) => {
                        state.userLocation = { lat: latitude, lng: longitude };

                        const iy = Math.floor(latitude / GRID_SIZE);
                        const ix = Math.floor(longitude / GRID_SIZE);
                        const currentExplored = get().exploredCells;
                        let changed = false;
                        const EXPLORE_RADIUS = 2;

                        const cellsToAdd = [];
                        for (let i = -EXPLORE_RADIUS; i <= EXPLORE_RADIUS; i++) {
                            for (let j = -EXPLORE_RADIUS; j <= EXPLORE_RADIUS; j++) {
                                if (i * i + j * j <= EXPLORE_RADIUS * EXPLORE_RADIUS) {
                                    const key = `${iy + i}_${ix + j}`;
                                    if (!currentExplored[key]) {
                                        state.exploredCells[key] = true;
                                        cellsToAdd.push({ id: key });
                                        changed = true;
                                    }
                                }
                            }
                        }

                        if (changed) {
                            if (cellsToAdd.length > 0) {
                                db.exploredCells.bulkAdd(cellsToAdd).catch(e => console.error("Failed to bulkAdd explored cells:", e));
                            }
                        }
                    });
                },
                (error) => console.error("Geolocation watch error:", error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        },

        // Handles selecting a cell on the map
        selectCell: (cell) => {
            const currentSelected = get().selectedCell;
            const claimed = get().claimedCells;
            if (!cell || (currentSelected && currentSelected.key === cell.key) || claimed[cell.key]) {
                set({ selectedCell: null });
            } else {
                set({ selectedCell: cell });
            }
        },

        // Updates the selected cell with geocoded data
        updateSelectedCellInfo: (data) => {
            set((state) => {
                if (state.selectedCell) {
                    state.selectedCell = { ...state.selectedCell, ...data, isLoading: false };
                }
            });
        },

        // Handles claiming the currently selected cell
        claimSelectedCell: () => {
            const { selectedCell, clouds, exploredCells } = get();
            if (!selectedCell) return 'no-cell';
            if (clouds <= 0) return 'no-clouds';

            const { key } = selectedCell;
            const cellData = { owner: 'user', color: '#3B82F6' };

            // --- Expand vision logic ---
            const [iy, ix] = key.split('_').map(Number);
            const cellsToExplore = [];
            const EXPLORE_RADIUS = 1; // 3x3 grid (center + 1 radius)

            for (let i = -EXPLORE_RADIUS; i <= EXPLORE_RADIUS; i++) {
                for (let j = -EXPLORE_RADIUS; j <= EXPLORE_RADIUS; j++) {
                    const newKey = `${iy + i}_${ix + j}`;
                    if (!exploredCells[newKey]) {
                        cellsToExplore.push({ id: newKey });
                    }
                }
            }

            set((state) => {
                state.clouds -= 1;
                state.claimedCells[key] = cellData;
                cellsToExplore.forEach(cell => {
                    state.exploredCells[cell.id] = true;
                });
                state.selectedCell = null;
            });

            // --- Save to IndexedDB ---
            db.claimedCells.put({ id: key, data: cellData }).catch(e => console.error("Failed to put claimed cell:", e));
            db.gameState.put({ key: 'clouds', value: get().clouds }).catch(e => console.error("Failed to put clouds state:", e));
            if (cellsToExplore.length > 0) {
                db.exploredCells.bulkAdd(cellsToExplore).catch(e => console.error("Failed to bulkAdd explored cells:", e));
            }

            return 'claimed';
        },

        // Resets cloud count, e.g., after registration
        register: () => {
            set({ clouds: 10 });
            // Save to IndexedDB
            db.gameState.put({ key: 'clouds', value: 10 }).catch(e => console.error("Failed to put clouds state on register:", e));
        },
    }))
);