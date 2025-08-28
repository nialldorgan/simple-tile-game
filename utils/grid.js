

export function getNeighbouringSquares(row, col, gridSize) {
  const neighbours = []
  // Up
  if (row > 0) neighbours.push({ row: row - 1, col })
  // Down
  if (row < gridSize - 1) neighbours.push({ row: row + 1, col })
  // Left
  if (col > 0) neighbours.push({ row, col: col - 1 })
  // Right
  if (col < gridSize - 1) neighbours.push({ row, col: col + 1 })
  return neighbours
}

export function shuffleGameBoard(prevState, difficultyLevel, gridSize) {
  let moves = difficultyLevel * gridSize
  const empty = { rowIndex: gridSize - 1, colIndex: gridSize - 1 }
  const prevSquare = { rowIndex: gridSize - 1, colIndex: gridSize - 1 }

  const newGameState = prevState.map(rowArr =>
    rowArr.map(cell => ({
      ...cell,
      tileProps: cell.tileProps ? { ...cell.tileProps } : null
    }))
  )

  for (let i = 0; i < moves; i++) {
    const neighbours = getNeighbouringSquares(empty.rowIndex, empty.colIndex, gridSize).filter(
      n => !(n.rowIndex === prevSquare.rowIndex && n.colIndex === prevSquare.colIndex)
    )

    const swapIndex = Math.floor(Math.random() * neighbours.length)
    const { row, col } = neighbours[swapIndex]

    // Swap logic
    newGameState[empty.rowIndex][empty.colIndex].hasTile = true
    newGameState[row][col].hasTile = false
    newGameState[empty.rowIndex][empty.colIndex].tileProps = newGameState[row][col].tileProps
    newGameState[empty.rowIndex][empty.colIndex].tileProps.currentPosition = {
      rowIndex: empty.rowIndex,
      colIndex: empty.colIndex
    }
    newGameState[row][col].tileProps = null
    // Update empty and prevSquare
    prevSquare.rowIndex = empty.rowIndex
    prevSquare.colIndex = empty.colIndex
    empty.rowIndex = row
    empty.colIndex = col
  }

  return newGameState
}