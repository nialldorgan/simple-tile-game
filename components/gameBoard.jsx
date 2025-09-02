import GameGrid from '@/components/gameGrid'
import config from '../config.json' with { type: "json" }
import { View, ScrollView, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native'
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import Big from 'big.js'
import { Button, Menu, Divider, Text, TextInput, TextInputIcon } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import AsyncStorage from '@react-native-async-storage/async-storage'
import GameWinnerDialog from '@/components/gameWinnerDialog'
import NotTopTenWinner from '@/components/notTopTenWinner'
import { useReusableFunctions } from '@/hooks/useReusableFunctions'
import { useAudioPlayer } from 'expo-audio'
import * as Haptics from 'expo-haptics'
import dayjs from 'dayjs'
import { useFocusEffect } from 'expo-router'
import { useGameStateManager } from '@/hooks/useGameStateManager'
import { shuffleGameBoard, getNeighbouringSquares } from '@/utils/grid'
import { chopImageIntoTiles, resizeImage } from '@/utils/images'
import useGameStore from '@/store/gameStore'


// GameBoard component: main logic for the tile puzzle game board
const GameBoard = forwardRef((props, ref) => {
  // Audio players for click and victory sounds
  const clickPlayer = useAudioPlayer(require('@/assets/sounds/slide.mp3'))
  const vistoryPlayer = useAudioPlayer(require('@/assets/sounds/fanfare.mp3'))

  // Custom hooks for storage and game state
  const { storeData, getData } = useReusableFunctions()
  const [ scoreBoard, setScoreBoard ] = React.useState([])

  const { createInitialState, checkForVictory } = useGameStateManager()

  // Various state variables for game settings and status
  const [ tileColor, setTileColor ] = useState(config.defaultTileProfile.color)
  const [ gameState, setGameState ] = useState([])
  const [ hasStarted, setHasStarted ] = useState(false)
  const [ difficultyLevel, setDifficultyLevel ] = useState(config.difficultyLevels[0].moves)
  const [ gamePhase, setGamePhase ] = useState('idle') // 'idle', 'resetting', 'shuffling', 'ready'
  const [ gridOptions, setGridOptions ] = useState(config.gridOptions)
  const [ difficultyMenu, setDifficultyMenu] = useState(false)
  const [ gridSizeMenu, setGridSizeMenu ] = useState(false)
  const [ timerInterval, setTimerInterval ] = useState(0)
  const [ showWinnerDialog, setShowWinnerDialog ] = useState(false)
  const [ showNotTopTenWinnerDialog, setShowNotTopTenWinnerDialog ] = useState(false)
  const [ showShuffleAnimation, setShowShuffleAnimation ] = useState(false)

  // Game settings from global store
  const numberOfMoves = useGameStore((state) => state.numberOfMoves)
  const setNumberOfMoves = useGameStore((state) => state.incrementMoves)
  const resetMoves = useGameStore((state) => state.resetMoves)
  const gameTimer = useGameStore((state) => state.gameTimer)  
  const setGameTimer = useGameStore((state) => state.incrementTimer)
  const resetGameTimer = useGameStore((state) => state.stopTimer)
  //persistent state variables
  const isSoundEnabled = useGameStore((state) => state.isSoundEnabled)
  const defaultGridSize = useGameStore((state) => state.defaultGridSize)
  const scoreOptions = useGameStore((state) => state.scoreOptions)
  const [gridSize, setGridSize] = useState(defaultGridSize)

  // State for image tiles and selected image
  const [imageTiles, setImageTiles] = useState([])
  const [tileImage, setTileImage] = useState(null)

  // Calculate board size based on platform
  const [ boardSize, setBoardSize ] = useState(() => {
    return Platform.OS !== 'web'
      ? Dimensions.get('window').width - 10
      : 400;
  })

  // Calculate tile size based on board size and grid size
  const tileSize = React.useMemo(() => {
    const widthHeight = Big(boardSize)
    const border = Big(8)
    const gameSpace = widthHeight.minus(border)
    return gameSpace.div(gridSize).toNumber()
  }, [boardSize, gridSize])  

  
  // Play click sound
  const playClickSound = () => {    
    clickPlayer.seekTo(0)
    clickPlayer.volume = 0.3
    clickPlayer.play()
  }

  // Play victory sound
  const playVictoryFanfare = () => {
    vistoryPlayer.seekTo(0)
    vistoryPlayer.play()
  }

  // Trigger haptic feedback for error
  const triggerErrorBuzz = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
  
  
  // Pick an image from the device gallery
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1      
    })

    if (!result.canceled) {
      // Chop the image and assign it to gameState
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

  const removeImage = async () => {
    try {
      await AsyncStorage.removeItem('tile-image')
      setTileImage(null)
      setGamePhase('newImageSelected')
    } catch (e) {
      console.log(e)
    }
  }

  // Create tiles from the selected image
  const createTiles = async () => {
    if (tileImage) {
      const tiles = await chopImageIntoTiles(tileImage, gridSize, tileSize)
      setImageTiles(tiles)
    } else {
      setImageTiles([])
    }
  }

  // Filter and sort scores for the current grid size
  const filterScoresByGridSize = React.useMemo(() => {
    return scoreBoard.filter(score => score.gridSize === gridSize)
      .sort((a, b) => {
        // Sort scores by the selected primary option (moves or time), then by the secondary option
        const primary = scoreOptions === 'moves' ? 'moves' : 'time'
        const secondary = scoreOptions === 'moves' ? 'time' : 'moves'
        if (a[primary] !== b[primary]) {
          // If primary values differ, sort by primary (ascending)
          return a[primary] - b[primary]
        }
        // If primary values are equal, sort by secondary (ascending)
        return a[secondary] - b[secondary]
      })
  }, [scoreBoard, gridSize])

  // Trim scores to top 10 for each grid size and save
  const loadAndTrimScores = async () => {
    const scores = await getData('scoreBoard') ?? []

    // Group scores by gridSize
    const grouped = {}
    scores.forEach(score => {
      const key = String(score.gridSize)
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(score)
    })

    // Sort and trim each group to top 10
    const topScores = []
    Object.keys(grouped).forEach(gridSize => {
      const sorted = grouped[gridSize].sort((a, b) => {
        // Sort scores by the selected primary option (moves or time), then by the secondary option
        const primary = scoreOptions === 'moves' ? 'moves' : 'time'
        const secondary = scoreOptions === 'moves' ? 'time' : 'moves'
        if (a[primary] !== b[primary]) {
          // If primary values differ, sort by primary (ascending)
          return a[primary] - b[primary]
        }
        // If primary values are equal, sort by secondary (ascending)
        return a[secondary] - b[secondary]
      })
      topScores.push(...sorted.slice(0, 10))
    })

    // Save trimmed scores back to AsyncStorage
    await storeData(topScores, 'scoreBoard')
  }

  // Open/close menu handlers
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

  // Reset the board, optionally with a new image
  const resetBoard = async function () {
    setShowShuffleAnimation(true)
    if (tileImage) {
      await createTiles()
    } else {
      setImageTiles([])
    }     
    setGamePhase('preparing')    
  }

  // Start a new game
  const newGame = function () {    
    setHasStarted(false)
    timerInterval? clearInterval(timerInterval) : null      
    setTimerInterval(null)
    resetGameTimer()
    setGamePhase('resetting')
  }

  // Handle tile press: move tile if possible, play sound or haptic
  const onTilePressed = React.useCallback((homePosition, currentPosition, tileIndex) => {
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
        setNumberOfMoves()
        if (isSoundEnabled) {
          playClickSound()
        }
      } else {
        triggerErrorBuzz()
      }    
      return newGameState
    })    
  }, [gridSize, isSoundEnabled])

  // Close winner dialogs
  const onHandleCloseWinnerDialog = () => {
    setShowWinnerDialog(false)
    setShowNotTopTenWinnerDialog(false)
  }

  // Record a new score and update storage
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
    await loadAndTrimScores()
    setShowWinnerDialog(false)
  }

  // Load scores when screen is focused
  useFocusEffect(
    React.useCallback(() => {      
      const loadScoresAsync = async () => {
        try {
          const scores = await getData('scoreBoard')
          setScoreBoard(scores? scores: [])
        }
        catch (e) {
          console.log(e)
        }
      }
      loadScoresAsync()      
    }, [])
  )

  React.useEffect(() => {
    useGameStore.getState().hydrateSettings()    
  }, [])

  React.useEffect(() => {
    setGridSize(defaultGridSize)
  }, [defaultGridSize])

  // Recreate board when grid size, image, or color changes
  useEffect(() => {
    const initialState = createInitialState(
      gridSize,
      tileSize,
      imageTiles,
      tileColor,
      onTilePressed
    );
    setGameState(initialState)
  }, [gridSize, imageTiles, tileColor])

  // Load tile image from storage on mount
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

  // React to game phase changes
  useEffect(() => {
    if (gamePhase === 'gridSizeChanged' || gamePhase === 'newImageSelected') {
      resetBoard()
    }
  }, [gamePhase])

  // Check for victory when game state changes
  useEffect(() => {
    if (gamePhase === 'idle' && hasStarted && checkForVictory(gameState)) {
      const isTopTen = filterScoresByGridSize.length < 10 ||
        (scoreOptions === 'moves' ? 
        filterScoresByGridSize.some(score => score.moves > numberOfMoves) : 
        filterScoresByGridSize.some(score => score.time > gameTimer))

      if (isSoundEnabled) {
        playVictoryFanfare()
      }
      setHasStarted(false)
      clearInterval(timerInterval)
      setTimerInterval(null)

      if (isTopTen) {
        setShowWinnerDialog(true)
      } else {
        setShowNotTopTenWinnerDialog(true)
      }
    }
  }, [gameState])

  // Prepare the board for a new game
  useEffect(() => {
    if (gamePhase === 'preparing') {
      setHasStarted(false)
      const newBoard = createInitialState(gridSize, tileSize, imageTiles, tileColor, onTilePressed)
      setGameState(newBoard)
      setGamePhase('idle')
      timerInterval? clearInterval(timerInterval) : null      
      setTimerInterval(null)
      resetGameTimer()
      resetMoves(0)
      setTimeout(() => {
        setShowShuffleAnimation(false)
      }, 1000)
    }
  }, [gamePhase])

  // Reset the board and shuffle tiles
  useEffect(() => {
    if (gamePhase === 'resetting') {
      const newBoard = createInitialState(gridSize, tileSize, imageTiles, tileColor, onTilePressed)
      setShowShuffleAnimation(true)
      setGameState(newBoard)
      setGamePhase('shuffling')
    }
  }, [gamePhase])

  // Shuffle the board for a new game
  useEffect(() => {
    if (gamePhase === 'shuffling') {
      const newGameState = shuffleGameBoard(gameState, difficultyLevel, gridSize)
      setGameState(newGameState)
      setGamePhase('ready')
    }
  }, [gamePhase])

  // Start the timer and game when ready
  useEffect(() => {
    if (gamePhase === 'ready') {
      setHasStarted(true)
      setGamePhase('idle') // reset phase tracker
      resetMoves()
      resetGameTimer()      
      setTimerInterval(setInterval(() => {        
        setGameTimer()
      }, 1000))
      setTimeout(() => {
        setShowShuffleAnimation(false)
      }, 1000)
    }
  }, [gamePhase])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    newGame,
    pickImage,
    resetBoard,
    removeImage
    // expose other methods if needed
  }))
  
  // Render the game board UI
  return (
      <View id={'gameBoard'} style={{flexGrow: 0, paddingLeft: 5,paddingRight: 5}}>        
        <View style={styles.gameControlArea} id={'gameControlArea'}>
          <View style={styles.gameControls}> 
            <TextInput style={{width: "30%"}}
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
              {/* <Text variant="titleMedium" style={styles.defaultText}>{`Moves: ${numberOfMoves}`}</Text> */}
              <TextInput style={{width: "30%"}}
              value={String(numberOfMoves)}
              mode="outlined" left={<TextInput.Icon icon="gesture-swipe"></TextInput.Icon>}></TextInput>
          </View>              
        </View>          
        <View style={{flexGrow:0}}>
          <GameGrid gameState={gameState} tileColor={tileColor} boardSize={boardSize} showShuffleAnimation={showShuffleAnimation}></GameGrid>                    
        </View>
        <View>          
          <GameWinnerDialog 
          showMe={showWinnerDialog}
          moves={numberOfMoves}
          time={gameTimer}
          handleCloseMe={onHandleCloseWinnerDialog} 
          handleRecordScore={onHandleRecordScore}></GameWinnerDialog>
          <NotTopTenWinner 
          showMe={showNotTopTenWinnerDialog}
          moves={numberOfMoves}
          time={gameTimer}
          handleCloseMe={onHandleCloseWinnerDialog}></NotTopTenWinner>
        </View>
      </View>
      
  )
})

export default GameBoard

const styles = StyleSheet.create({

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

  gameControls: {
    marginBottom: 15, 
    marginTop: 10, 
    marginLeft: 5,
    marginRight: 5,
    flexDirection: 'row', 
    alignContent: 'center', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  }
})