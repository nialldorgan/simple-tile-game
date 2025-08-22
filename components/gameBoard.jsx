import GameGrid from '@/components/gameGrid'
import config from '../config.json' with { type: "json" }
import { View, ScrollView, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native'
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import Big from 'big.js'
import { Button, Menu, Divider, Text, TextInput, TextInputIcon } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import GameWinnerDialog from '@/components/gameWinnerDialog'
import { useReusableFunctions } from '@/hooks/reusableFunctions'
import { useAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import dayjs from 'dayjs'


const GameBoard = forwardRef((props, ref) => {
  const clickPlayer = useAudioPlayer(require('@/assets/sounds/slide.mp3'))
  const vistoryPlayer = useAudioPlayer(require('@/assets/sounds/fanfare.mp3'))

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

  const playClickSound = () => {    
    clickPlayer.seekTo(0)
    clickPlayer.volume = 0.3
    clickPlayer.play()
  }

  const playVictoryFanfare = () => {
    vistoryPlayer.seekTo(0)
    vistoryPlayer.play()
  }

  const triggerErrorBuzz = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  
  const onTilePressed = (homePosition, currentPosition, tileIndex) => {
    const { rowIndex, colIndex } = currentPosition
    const neighbours = getNeighbouringSquares(rowIndex, colIndex, gridSize)
    let canMove = false
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
          canMove = true
          break
        }
      }
      if (canMove) {
        setNumberOfMoves(numberOfMoves => numberOfMoves+1)
        playClickSound()
      } else {
        triggerErrorBuzz()
      }    
      return newGameState
    })    
  }  

  const [imageTiles, setImageTiles] = useState([])
  const [tileImage, setTileImage] = useState(null)

  useEffect(() => {
    const fetchTileImage = async () => {
      try {
        const storedImage = await AsyncStorage.getItem('tile-image')
        if (storedImage !== null) {
          setTileImage(storedImage)
          setGamePhase('newImageSelected')
        }
      } catch (e) {
        console.log('Error loading tile image:', e)
      }
    };

    fetchTileImage()
  }, [])

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
      return Dimensions.get('window').width-10
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
      { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
    )
    return resizedImage
  }
  
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1      
    })

    if (!result.canceled) {
      //chop the image and assign it to gameState
      const image = await resizeImage(result.assets[0].uri, boardSize, boardSize)
      try {
        await AsyncStorage.setItem('tile-image', 'data:image/xxx;base64,' + image.base64)
      } catch (e) {
        console.log(e)
      }
      setTileImage(image.uri)
      setGamePhase('newImageSelected')
    }
  }

  const createTiles = async () => {
    if (tileImage) {
      const tiles = await chopImageIntoTiles(tileImage, gridSize, calculateTileSize())
      setImageTiles(tiles)
    } else {
      setImageTiles([])
    }
  }  

  const {storeData, getData } = useReusableFunctions()  

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
  const [ showWinnerDialog, setShowWinnerDialog ] = useState(false)

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
    let moves = difficultyLevel*gridSize
    const empty = { rowIndex: gridSize-1, colIndex: gridSize-1 }
    const prevSquare = { rowIndex: gridSize-1, colIndex: gridSize-1 } 
    let p = Promise.resolve()
          
    for (let i=0; i<moves; i++) {
      p = p.then(() => new Promise(resolve => setTimeout(resolve, 20)))
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

  const onHandleCloseWinnerDialog = () => {
    setShowWinnerDialog(false)
  }

  const onHandleRecordScore = async (userName) => {
    const scoreBoard = await getData('scoreBoard') ?? []
    const scoreBoardEntry = {
      date: dayjs().format('DD-MMM-YYYY'),
      userName: userName,
      gridSize: gridSize,
      time: gameTimer,
      moves: numberOfMoves
    }
    scoreBoard.push(scoreBoardEntry)
    await storeData(scoreBoard, 'scoreBoard')
    setShowWinnerDialog(false)
  }
  
  const resetBoard = async function () {
    if (tileImage) {
      await createTiles()
    } else {
      setImageTiles([])
    }     
    setGamePhase('preparing')    
  }

  const newGame = function () {    
    setHasStarted(false)
    timerInterval? clearInterval(timerInterval) : null      
    setTimerInterval(null)
    setGameTimer(0)
    setGamePhase('resetting')
  }

  useEffect(() => {
    if (gamePhase === 'gridSizeChanged' || gamePhase === 'newImageSelected') {
      resetBoard()
    }
  }, [gamePhase])

  useEffect(() => {
    if (gamePhase === 'idle' && hasStarted && checkForVictory(gameState)) {      
      playVictoryFanfare()    
      setHasStarted(false)
      clearInterval(timerInterval)
      setTimerInterval(null)
      setShowWinnerDialog(true)     
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

  useImperativeHandle(ref, () => ({
    newGame,
    pickImage,
    resetBoard
    // expose other methods if needed
  }))
  
  return (
      <ScrollView id={'gameBoard'} style={{flexGrow: 0, paddingLeft: 5,paddingRight: 5}}>        
        <View style={styles.gameControlArea} id={'gameControlArea'}>
          <View style={{marginBottom: 8, marginTop: 8, flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', alignItems: 'center'}}> 
            <TextInput style={{width: "40%", marginRight: 16}}
            value={String(gameTimer)}
            mode="outlined" left={<TextInput.Icon icon="timer-outline"></TextInput.Icon>}></TextInput>        
            <Menu
              visible={gridSizeMenu}
              onDismiss={() => closeMenu('grid')}
              anchor={
              <Button
              compact={true}
              onPress={() => openMenu('grid')} 
              mode='outlined' 
              textColor='#FFD54F' 
              style={styles.settingButtons}>{`${gridSize}x${gridSize}`}</Button>}>
                { gridOptions.map(option => (                
                  <Menu.Item
                    key={option.value}
                    onPress={() => {
                      setGridSize(option.value)
                      closeMenu('grid')
                      setGamePhase('gridSizeChanged')
                    }}
                    title={option.label}
                  />
                ))}
              </Menu>
              <Text variant="titleMedium" style={styles.defaultText}>{`Moves: ${numberOfMoves}`}</Text>
          </View>              
        </View>          
        <ScrollView horizontal={true} style={{flexGrow:0}}>
          <GameGrid gameState={gameState} tileColor={tileColor} boardSize={boardSize}></GameGrid>
                    
        </ScrollView>
        <ScrollView>          
          <GameWinnerDialog 
          showMe={showWinnerDialog}
          moves={numberOfMoves}
          time={gameTimer}
          handleCloseMe={onHandleCloseWinnerDialog} 
          handleRecordScore={onHandleRecordScore}></GameWinnerDialog>
        </ScrollView>
      </ScrollView>
      
  )
})

export default GameBoard

const styles = StyleSheet.create({
  contentContainer: {
    // backgroundColor: '#25292e49',      
  },

  defaultText: {
    color: '#ffffff'
  },

  settingButtons: {marginRight: 15, borderRadius: 5, borderWidth: 2, borderColor: '#FFD54F'},

  menuButton: {
    textColor: '#ffffff'
  },

  gameControlArea: {
    flexDirection: 'column'
  },
})