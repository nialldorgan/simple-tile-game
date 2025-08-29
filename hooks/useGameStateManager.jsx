/**
 * Custom React hook for managing the state of a tile-based game board.
 *
 * @returns {Object} An object containing utility functions for game state management:
 *   - createInitialState: Initializes the game board state.
 *   - checkForVictory: Checks if the current game state is a winning state.
 *
 * @function
 *
 * @example
 * const { createInitialState, checkForVictory } = useGameStateManager();
 *
 * @typedef {Object} TileProps
 * @property {string} background - Background color of the tile.
 * @property {string} textColor - Text color for the tile label.
 * @property {number} size - Size of the tile.
 * @property {string} label - Label displayed on the tile.
 * @property {string|null} img - URI of the tile image, if any.
 * @property {Object} homePosition - The original position of the tile.
 * @property {Object} currentPosition - The current position of the tile.
 * @property {Function} handleTileClick - Callback for when the tile is pressed.
 *
 * @typedef {Object} Square
 * @property {number} rowIndex - Row index of the square.
 * @property {number} colIndex - Column index of the square.
 * @property {boolean} hasTile - Whether the square contains a tile.
 * @property {number} squareMinWidth - Minimum width of the square.
 * @property {TileProps|null} tileProps - Properties of the tile, or null if empty.
 *
 * @param {number} gridSize - The size of the grid (number of rows/columns).
 * @param {number} tileSize - The size of each tile.
 * @param {Array} imageTiles - Array of image tile objects.
 * @param {string} tileColor - Background color for the tiles.
 * @param {Function} onTilePressed - Callback function for tile press events.
 *
 * @returns {Array<Array<Square>>} The initial state of the game board.
 */
export const useGameStateManager = () => {
  
  const createInitialState = (gridSize, tileSize, imageTiles, tileColor, onTilePressed) => {
    return Array.from({ length: gridSize }, (v, i) =>
      Array.from({ length: gridSize }, (v, y) => {
        const isEmpty = i === gridSize-1 && y === gridSize-1
        const index = (i * gridSize + y)
        const tileLabel = `${index + 1}`
        const tile = imageTiles && imageTiles.length ? imageTiles[index] : null
        
        return {
          rowIndex: i,
          colIndex: y,
          hasTile: !isEmpty,
          squareMinWidth: tileSize,
          tileProps: isEmpty
            ? null
            : {
                background: tileColor,
                textColor: '#ffffffff',
                size: tileSize,
                label: `${tileLabel}`,
                img: tile? tile.uri: null,
                homePosition: { rowIndex: i, colIndex: y },
                currentPosition: { rowIndex: i, colIndex: y },
                handleTileClick: onTilePressed
              },
        }
      })
    )
  }

  // Check if the board is in a winning state
  const checkForVictory = (gameState) => {
    let winner = true
    gameState.forEach(rowArr => {
      rowArr.forEach(square => {
        if (square.hasTile) {
          if (JSON.stringify(square.tileProps.homePosition) !== JSON.stringify(square.tileProps.currentPosition)) {
            winner = false
          }        
        }
      })
    })    
    return winner
  }

  return {
    checkForVictory,
    createInitialState
  }
}