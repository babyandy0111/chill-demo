import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const GRID_SIZE = 0.0005;

// Helper function to load explored cells from localStorage
const loadExploredCells = () => {
    try {
        const saved = localStorage.getItem('exploredCells');
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error("Failed to load explored cells:", e);
        return {};
    }
};

// Helper function to save explored cells to localStorage
const saveExploredCells = (cells) => {
    try {
        localStorage.setItem('exploredCells', JSON.stringify(cells));
    } catch (e) {
        console.error("Failed to save explored cells:", e);
    }
};

export const useAppStore = create(
    immer((set, get) => ({
        // --- STATE ---
        clouds: 10,
        claimedCells: {},
        exploredCells: loadExploredCells(),
        selectedCell: null,
        userLocation: null,
        
        // --- ACTIONS ---
        
        // Initializes geolocation tracking
        initializeGeolocation: () => {
            const watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    set((state) => {
                        state.userLocation = { lat: latitude, lng: longitude };

                        const iy = Math.floor(latitude / GRID_SIZE);
                        const ix = Math.floor(longitude / GRID_SIZE);
                        const currentExplored = get().exploredCells;
                        let changed = false;
                        const EXPLORE_RADIUS = 2;

                        for (let i = -EXPLORE_RADIUS; i <= EXPLORE_RADIUS; i++) {
                            for (let j = -EXPLORE_RADIUS; j <= EXPLORE_RADIUS; j++) {
                                if (i * i + j * j <= EXPLORE_RADIUS * EXPLORE_RADIUS) {
                                    const key = `${iy + i}_${ix + j}`;
                                    if (!currentExplored[key]) {
                                        state.exploredCells[key] = true;
                                        changed = true;
                                    }
                                }
                            }
                        }
                        if (changed) {
                           saveExploredCells(state.exploredCells);
                        }
                    });
                },
                (error) => console.error("Geolocation watch error:", error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            // We might need a way to clear this watch later if the app unmounts,
            // but for now, we'll keep it simple.
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
            const { selectedCell, clouds } = get();
            if (!selectedCell) return 'no-cell';
            if (clouds <= 0) return 'no-clouds';

            const { key } = selectedCell;
            set((state) => {
                state.clouds -= 1;
                state.claimedCells[key] = { owner: 'user', color: '#3B82F6' };
                state.selectedCell = null;
            });
            return 'claimed';
        },

        // Resets cloud count, e.g., after registration
        register: () => {
            set({ clouds: 10 });
        },
    }))
);
