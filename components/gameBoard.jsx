import GameGrid from '@/components/gameGrid'
import config from '../config.json' with { type: "json" }
import { View, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native'
import { useState, useEffect } from 'react'
import  SelectorComponent from '@/components/selectorComponent'
import Big from 'big.js'
import { Button, Menu, Divider, Text, TextInput, TextInputIcon } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'


export default function GameBoard () {

  const getNeighbouringSquares = (row, col, gridSize) => {
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
  
  const onTilePressed = (homePosition, currentPosition, tileIndex) => {
    const { rowIndex, colIndex } = currentPosition
    const neighbours = getNeighbouringSquares(rowIndex, colIndex, gridSize)
    setGameState(prevState => {
      // Deep clone the previous state
      const newGameState = prevState.map(rowArr =>
        rowArr.map(cell => ({
          ...cell,
          tileProps: cell.tileProps ? { ...cell.tileProps } : null
        }))
      )

      for (const { row, col } of neighbours) {
        if (!newGameState[row][col].hasTile) {
          newGameState[row][col].hasTile = true
          newGameState[rowIndex][colIndex].hasTile = false
          newGameState[row][col].tileProps = newGameState[rowIndex][colIndex].tileProps
          newGameState[row][col].tileProps.currentPosition = {
            rowIndex: row,
            colIndex: col
          }
          newGameState[rowIndex][colIndex].tileProps = null
          break
        }
      }
      setNumberOfMoves(numberOfMoves => numberOfMoves+1)
      return newGameState
    })    
  }
  const [imageTiles, setImageTiles] = useState([])

  const fillGameBoardGridSquares = () => {
    
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
          squareMinWidth: calculateTileSize(),
          tileProps: isEmpty
            ? null
            : {
                background: tileColor,
                textColor: '#ffffffff',
                size: calculateTileSize(),
                label: `${tileLabel}`,
                img: tile? tile.uri: null,
                homePosition: { rowIndex: i, colIndex: y },
                currentPosition: { rowIndex: i, colIndex: y },
                handleTileClick: onTilePressed,
              },
        }
      })
    )
  }

  const calculateWindowSize = () => {
    if (Platform.OS !== 'web') {
      return Dimensions.get('window').width - 40
    }
    return 400
  }

  const [ boardSize, setBoardSize ] = useState(calculateWindowSize)

  const calculateTileSize = () => {
    const widthHeight = Big(boardSize)
    const border = Big(10).times(2).plus(1.5)
    const gameSpace = widthHeight.minus(border)
    return gameSpace.div(gridSize).toNumber()
  }

  

  const checkForVictory = function () {
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

  const chopImageIntoTiles = async (imageUri, gridSize, tileSize) => {
    const tiles = [];

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cropRegion = {
          originX: col * tileSize,
          originY: row * tileSize,
          width: tileSize,
          height: tileSize,
        };

        const cropped = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ crop: cropRegion }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );

        tiles.push({
          uri: cropped.uri,
          row,
          col,
          index: row * gridSize + col,
        });
      }
    }

    return tiles;
  }

  const resizeImage = async (uri, targetWidth, targetHeight) => {
    const resizedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{resize: {
        height: targetHeight,
        width: targetWidth
      }}],
      { compress: 1, format: ImageManipulator.SaveFormat.PNG }
    )
    return resizedImage.uri
  }
  
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      //chop the image and assign it to gameState
      const imageUri = await resizeImage(result.assets[0].uri, boardSize, boardSize)
      const tiles = await chopImageIntoTiles(imageUri, gridSize, calculateTileSize())
      setImageTiles(tiles)
      resetBoard()

    }
  }

  const [ tileColor, setTileColor ] = useState(config.defaultTileProfile.color)
  const [ gridSize, setGridSize ] = useState(config.defaultGridSize)
  const [ gameState, setGameState ] = useState(fillGameBoardGridSquares)
  const [ hasStarted, setHasStarted ] = useState(false)
  const [ difficultyLevel, setDifficultyLevel ] = useState(config.difficultyLevels[0].moves)
  const [ gamePhase, setGamePhase ] = useState('idle') // 'idle', 'resetting', 'shuffling', 'ready'
  const [ gridOptions, setGridOptions ] = useState(config.gridOptions)
  const [ difficultyMenu, setDifficultyMenu] = useState(false)
  const [ gridSizeMenu, setGridSizeMenu ] = useState(false)
  const [ numberOfMoves, setNumberOfMoves ] = useState(0)
  const [ gameTimer, setGameTimer ] = useState(0)
  const [ timerInterval, setTimerInterval ] = useState(0)  

  const openMenu = (menu) => {
    if (menu === 'grid') {
      setGridSizeMenu(true)
    } else {
      setDifficultyMenu(true)
    }
  }

  const closeMenu = (menu) => {
    if (menu === 'grid') {
      setGridSizeMenu(false)
    } else {
      setDifficultyMenu(false)
    }
  }
  

  const shuffleGameBoard = function () {
    let moves = difficultyLevel
    const empty = { rowIndex: gridSize-1, colIndex: gridSize-1 }
    const prevSquare = { rowIndex: gridSize-1, colIndex: gridSize-1 } 
    let p = Promise.resolve()
          
    for (let i=0; i<moves; i++) {
      p = p.then(() => new Promise(resolve => setTimeout(resolve, 10)))
        .then(() => {

          setGameState(prevState => {
            const newGameState = prevState.map(rowArr =>
              rowArr.map(cell => ({
                ...cell,
                tileProps: cell.tileProps ? { ...cell.tileProps } : null
              }))
            )
            const getValidNeighbours = (empty, prev) => {
              return getNeighbouringSquares(empty.rowIndex, empty.colIndex, gridSize).filter(neighbour => {
                return !(neighbour.rowIndex === empty.rowIndex && neighbour.colIndex === empty.colIndex)
              })
            }

            const neighbours = getValidNeighbours(empty, prevSquare)


            prevSquare.rowIndex = empty.rowIndex
            prevSquare.colIndex = empty.colIndex
            const swapIndex = Math.floor(Math.random() * neighbours.length)
            const { row, col } = neighbours[swapIndex]
            
            newGameState[empty.rowIndex][empty.colIndex].hasTile = true
            newGameState[row][col].hasTile = false
            newGameState[empty.rowIndex][empty.colIndex].tileProps = newGameState[row][col].tileProps
            newGameState[empty.rowIndex][empty.colIndex].tileProps.currentPosition = {
              rowIndex: empty.rowIndex,
              colIndex: empty.colIndex
            }
            newGameState[row][col].tileProps = null
            empty.rowIndex = row
            empty.colIndex = col

            return newGameState

          })
      })
    }
    return p
  }
  
  const resetBoard = function () {
    setGamePhase('preparing')    
  }

  const newGame = function () {    
    setHasStarted(false)
    setGamePhase('resetting')

  }

  useEffect(() => {
    if (gamePhase === 'idle' && hasStarted && checkForVictory(gameState)) {
      alert(`You won in ${gameTimer} seconds and ${numberOfMoves} moves, well done!`)
      setHasStarted(false)
      clearInterval(timerInterval)
      setTimerInterval(null)      
    }
  }, [gameState])

  useEffect(() => {
    if (gamePhase === 'preparing') {
      setHasStarted(false)
      const newBoard = fillGameBoardGridSquares()
      setGameState(newBoard)
      setGamePhase('idle')
      timerInterval? clearInterval(timerInterval) : null      
      setTimerInterval(null)
      setGameTimer(0)
      setNumberOfMoves(0)
    }
  }, [gamePhase])

  useEffect(() => {
    if (gamePhase === 'resetting') {
      const newBoard = fillGameBoardGridSquares()
      setGameState(newBoard)
      setGamePhase('shuffling')
    }
  }, [gamePhase])

  useEffect(() => {
    if (gamePhase === 'shuffling') {
      shuffleGameBoard().then(() => {
        setGamePhase('ready')
      })
    }
  }, [gamePhase])

  useEffect(() => {
    if (gamePhase === 'ready') {
      setHasStarted(true)
      setGamePhase('idle') // reset phase tracker
      setNumberOfMoves(0)
      setGameTimer(0)
      setTimerInterval(setInterval(() => {
        setGameTimer(gameTimer => gameTimer+1)
      }, 1000))
    }
  }, [gamePhase])
  
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        {/* score area */}
        <TextInput style={{width: "40%", marginRight: 16}}
        value={String(gameTimer)}
        mode="outlined" left={<TextInput.Icon icon="timer-outline"></TextInput.Icon>}></TextInput>
        <Text variant="titleMedium" style={styles.defaultText}>{`Moves: ${numberOfMoves}`}</Text>
      </View>
      <View style={styles.gameControlArea}>
        <View style={{marginBottom: 8, flexDirection: 'row', alignItems: 'center'}}>
          <Menu
            visible={difficultyMenu}
            onDismiss={() => closeMenu('setDifficultyMenu')}
            anchor={<Button onPress={() => {openMenu('setDifficultyMenu')}} mode='contained' buttonColor='#68b682ff' textColor='#ffffff' style={{margin: 10}}>Difficulty</Button>}>
              { config.difficultyLevels.map(level => (
                <Menu.Item onPress={() => {                  
                  setDifficultyLevel(level.moves) 
                  closeMenu('setDifficultyMenu')
                  }} title={level.level} key={level.moves}/>
              ))}              
            </Menu>
          { config.difficultyLevels.filter(level => level.moves === difficultyLevel).map(level => (
            <Text variant="titleMedium" style={styles.defaultText} key={level.level}>{level.level}</Text>
           ))}
           </View>
           <View style={{marginBottom: 8, flexDirection: 'row', alignItems: 'center'}}>
           <Menu
            visible={gridSizeMenu}
            onDismiss={() => closeMenu('grid')}
            anchor={<Button onPress={() => openMenu('grid')} mode='contained' buttonColor='#68b682ff' textColor='#ffffff' style={{margin: 10}}>Grid size</Button>}>
              { gridOptions.map(option => (                
                <Menu.Item
                  key={option.value}
                  onPress={() => {
                    setGridSize(option.value)
                    closeMenu('grid')
                    resetBoard()
                  }}
                  title={option.label}
                />
              ))}
            </Menu>
            <Text variant="titleMedium" style={styles.defaultText}>{gridSize}x{gridSize}</Text>
        </View>
        <View style={{flexDirection: 'row', marginBottom: 8}}>
          <View style={styles.newGameButton}>
            <Button
            mode="contained"
            buttonColor='#68b682ff'
            textColor='#ffffff'
            onPress={newGame}>New Game</Button>
          </View>
          <View style={styles.newGameButton}>
            <Button
            mode="contained"
            buttonColor='#68b682ff'
            textColor='#ffffff'
            onPress={resetBoard}>Reset</Button>
          </View>
          <View style={styles.newGameButton}>
            <Button
            mode="contained"
            buttonColor='#68b682ff'
            textColor='#ffffff'
            onPress={pickImage}>Select an image</Button>
          </View>         
        </View>        
      </View>
        
      <ScrollView horizontal={true}>
        <GameGrid gameState={gameState} tileColor={tileColor} boardSize={boardSize}></GameGrid>
      </ScrollView>      
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 10,
    backgroundColor: '#25292e',
    height: '100%'        
  },

  defaultText: {
    color: '#ffffff'
  },

  newGameButton: {
    margin: 2,
    borderRadius: 5,
    padding: 2,
    minHeight: 40
  },

  menuButton: {
    textColor: '#ffffff'
  },

  gameControlArea: {
    flexDirection: 'column'
  },
})