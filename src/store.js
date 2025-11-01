import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from './db'; // Import our IndexedDB instance

const GRID_SIZE = 0.0005;

export const useAppStore = create(
    immer((set, get) => ({
        // --- STATE ---
        clouds: 10,
        claimedCells: [], // FIX: Initial state must be an array
        exploredCells: [], // FIX: Initial state must be an array
        selectedCell: null,
        userLocation: null,
        isHydrated: false,
        lastCloudIncrease: Date.now(),

        // --- ACTIONS ---

        hydrate: async () => {
            try {
                const [exploredCellsArray, claimedCellsArray, cloudsState, lastIncreaseState] = await Promise.all([
                    db.exploredCells.toArray(),
                    db.claimedCells.toArray(),
                    db.gameState.get('clouds'),
                    db.gameState.get('lastCloudIncrease'),
                ]);

                // FIX: Directly use the arrays from IndexedDB. Do not convert to objects.
                set((state) => {
                    state.exploredCells = exploredCellsArray;
                    state.claimedCells = claimedCellsArray;
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
            db.gameState.put({ key: 'clouds', value: get().clouds });
            db.gameState.put({ key: 'lastCloudIncrease', value: now });
        },
        
        initializeGeolocation: () => {
            navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const exploredCellKeys = new Set(get().exploredCells.map(c => c.id));

                    set((state) => {
                        state.userLocation = { lat: latitude, lng: longitude };
                        const iy = Math.floor(latitude / GRID_SIZE);
                        const ix = Math.floor(longitude / GRID_SIZE);
                        const cellsToAdd = [];
                        const EXPLORE_RADIUS = 2;

                        for (let i = -EXPLORE_RADIUS; i <= EXPLORE_RADIUS; i++) {
                            for (let j = -EXPLORE_RADIUS; j <= EXPLORE_RADIUS; j++) {
                                if (i * i + j * j <= EXPLORE_RADIUS * EXPLORE_RADIUS) {
                                    const key = `${iy + i}_${ix + j}`;
                                    if (!exploredCellKeys.has(key)) {
                                        const newCell = { id: key, iy: iy + i, ix: ix + j };
                                        state.exploredCells.push(newCell); // FIX: Use array.push
                                        cellsToAdd.push(newCell);
                                        exploredCellKeys.add(key);
                                    }
                                }
                            }
                        }
                        
                        if (cellsToAdd.length > 0) {
                            db.exploredCells.bulkAdd(cellsToAdd).catch(e => console.error("Failed to bulkAdd explored cells:", e));
                        }
                    });
                },
                (error) => console.error("Geolocation watch error:", error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        },

        selectCell: (cell) => {
            const currentSelected = get().selectedCell;
            const claimedCells = get().claimedCells;
            const cellKey = cell?.key;

            console.log(`[selectCell] Checking cell with key: ${cellKey}`);

            const isClaimed = claimedCells.some(c => c.id === cellKey);

            console.log(`[selectCell] Is this cell claimed? ${isClaimed}`);
            if (isClaimed) {
                console.log('[selectCell] Reason: Cell is already in the claimedCells list.');
                const problematicCell = claimedCells.find(c => c.id === cellKey);
                console.log('[selectCell] Problematic cell data:', problematicCell);
            }

            if (!cell) {
                console.log('[selectCell] Decision: Deselecting (cell is null).');
                set({ selectedCell: null });
            } else if (currentSelected && currentSelected.key === cellKey) {
                console.log('[selectCell] Decision: Deselecting (clicking the same cell again).');
                set({ selectedCell: null });
            } else if (isClaimed) {
                console.log('[selectCell] Decision: Deselecting (cell is already claimed).');
                set({ selectedCell: null });
            } else {
                console.log('[selectCell] Decision: Selecting cell.');
                set({ selectedCell: cell });
            }
        },

        updateSelectedCellInfo: (data) => {
            set((state) => {
                if (state.selectedCell) {
                    state.selectedCell = { ...state.selectedCell, ...data, isLoading: false };
                }
            });
        },

        claimSelectedCell: () => {
            const { selectedCell, clouds } = get();
            if (!selectedCell) return 'no-cell';
            if (clouds <= 0) return 'no-clouds';

            const { key } = selectedCell;
            const [iy, ix] = key.split('_').map(Number);
            const cellData = { owner: 'user', color: '#3B82F6' };
            const newClaimedCell = { id: key, iy, ix, data: cellData };

            const exploredCellKeys = new Set(get().exploredCells.map(c => c.id));
            const cellsToExplore = [];
            const EXPLORE_RADIUS = 1;

            for (let i = -EXPLORE_RADIUS; i <= EXPLORE_RADIUS; i++) {
                for (let j = -EXPLORE_RADIUS; j <= EXPLORE_RADIUS; j++) {
                    const currentIY = iy + i;
                    const currentIX = ix + j;
                    const newKey = `${currentIY}_${currentIX}`;
                    if (!exploredCellKeys.has(newKey)) {
                        cellsToExplore.push({ id: newKey, iy: currentIY, ix: currentIX });
                    }
                }
            }

            set((state) => {
                state.clouds -= 1;
                state.claimedCells.push(newClaimedCell); // FIX: Use array.push
                state.exploredCells.push(...cellsToExplore); // FIX: Use array spread
                state.selectedCell = null;
            });

            db.claimedCells.put(newClaimedCell);
            db.gameState.put({ key: 'clouds', value: get().clouds });
            if (cellsToExplore.length > 0) {
                db.exploredCells.bulkAdd(cellsToExplore);
            }

            return 'claimed';
        },

        register: () => {
            set({ clouds: 10 });
            db.gameState.put({ key: 'clouds', value: 10 });
        },
    }))
);
