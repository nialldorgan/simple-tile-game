/**
 * Zustand store for managing game state and settings.
 * 
 * This store handles:
 * - Move counting and resetting
 * - Game timer incrementing and resetting
 * - Sound settings (enable/disable)
 * - Default grid size for the game
 * - Score options (e.g., 'moves')
 * - Hydration and persistence of settings using custom storage functions
 * 
 * Note: cannot use zustand persist as it is not compatible with react native in its current version.
 * 
 * @module useGameStore
 * 
 * @property {number} numberOfMoves - The current number of moves made in the game.
 * @property {function} incrementMoves - Increments the number of moves by 1.
 * @property {function} resetMoves - Resets the number of moves to 0.
 * 
 * @property {number} gameTimer - The current value of the game timer.
 * @property {function} incrementTimer - Increments the game timer by 1.
 * @property {function} stopTimer - Resets the game timer to 0.
 * 
 * @property {boolean} isSoundEnabled - Whether sound is enabled in the game.
 * @property {function} setSoundEnabled - Sets the sound enabled state and saves settings.
 * 
 * @property {number} defaultGridSize - The default grid size for the game.
 * @property {function} setDefaultGridSize - Sets the default grid size and saves settings.
 * 
 * @property {string} scoreOptions - The current score option (e.g., 'moves').
 * @property {function} setScoreOptions - Sets the score option and saves settings.
 * 
 * @property {function} hydrateSettings - Loads settings from persistent storage.
 * @property {function} saveSettings - Saves current settings to persistent storage.
 */
import { create } from 'zustand'
import { useReusableFunctions } from '@/hooks/useReusableFunctions'

const { storeData, getData } = useReusableFunctions()
const STORAGE_KEY = 'gameOptions'
// Game state store

const useGameStore = create((set, get) => ({
  
  numberOfMoves: 0,
  incrementMoves: () => set((state) => ({ numberOfMoves: state.numberOfMoves + 1 })),
  resetMoves: () => set({ numberOfMoves: 0 }),

  gameTimer: 0,
  incrementTimer: () => set((state) => ({ gameTimer: state.gameTimer + 1 })),
  stopTimer: () => set({ gameTimer: 0 }),

  isSoundEnabled: true,
  setSoundEnabled: (isSoundEnabled) => {
    set({ isSoundEnabled });
    get().saveSettings();
  },

  defaultGridSize: 3,
  setDefaultGridSize: (defaultGridSize) => {
    set({ defaultGridSize });
    get().saveSettings();
  },

  scoreOptions: 'moves',
  setScoreOptions: (scoreOptions) => {
    set({ scoreOptions });
    get().saveSettings();
  },

  hydrateSettings: async () => {
    const data = await getData(STORAGE_KEY);
    if (data) {
      const { isSoundEnabled, defaultGridSize, scoreOptions } = data;
      set({
        ...(isSoundEnabled !== undefined && { isSoundEnabled }),
        ...(defaultGridSize !== undefined && { defaultGridSize }),
        ...(scoreOptions !== undefined && { scoreOptions }),
      });
    }
  },

  saveSettings: async () => {
    const { isSoundEnabled, defaultGridSize, scoreOptions } = get();
    await storeData({ isSoundEnabled, defaultGridSize, scoreOptions }, STORAGE_KEY );
  },
}));

export default useGameStore