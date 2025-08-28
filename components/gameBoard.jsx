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
  const [ gridSize, setGridSize ] = useState(config.defaultGridSize)
  const [ gameState, setGameState ] = useState([])
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
  const [ showNotTopTenWinnerDialog, setShowNotTopTenWinnerDialog ] = useState(false)
  const [isShuffled, setIsShuffled] = useState(false)

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
        if (a.moves !== b.moves) {
          return a.moves - b.moves
        }
        return a.time - b.time        
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
        if (a.moves !== b.moves) {
          return a.moves - b.moves
        }
        return a.time - b.time
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
    setGameTimer(0)
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
        setNumberOfMoves(numberOfMoves => numberOfMoves+1)
        playClickSound()
      } else {
        triggerErrorBuzz()
      }    
      return newGameState
    })    
  }, [gridSize])

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

  // Recreate board when grid size, image, or color changes
  useEffect(() => {
    const initialState = createInitialState(
      gridSize,
      tileSize,
      imageTiles,
      tileColor,
      onTilePressed,
      isShuffled
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
        filterScoresByGridSize.some(score => score.moves > numberOfMoves)

      playVictoryFanfare()
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
      const newBoard = createInitialState(gridSize, tileSize, imageTiles, tileColor, onTilePressed, isShuffled)
      setGameState(newBoard)
      setGamePhase('idle')
      timerInterval? clearInterval(timerInterval) : null      
      setTimerInterval(null)
      setGameTimer(0)
      setNumberOfMoves(0)
    }
  }, [gamePhase])

  // Reset the board and shuffle tiles
  useEffect(() => {
    if (gamePhase === 'resetting') {
      const newBoard = createInitialState(gridSize, tileSize, imageTiles, tileColor, onTilePressed, isShuffled)
      setGameState(newBoard)
      setGamePhase('shuffling')
    }
  }, [gamePhase])

  // Shuffle the board for a new game
  useEffect(() => {
    if (gamePhase === 'shuffling') {
      const newGameState = shuffleGameBoard(gameState, difficultyLevel, gridSize)
      setIsShuffled(true)
      setGameState(newGameState)
      setGamePhase('ready')
      setTimeout(() => {
        setIsShuffled(false)
      }, 300);
    }
  }, [gamePhase])

  // Start the timer and game when ready
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

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    newGame,
    pickImage,
    resetBoard
    // expose other methods if needed
  }))
  
  // Render the game board UI
  return (
      <View id={'gameBoard'} style={{flexGrow: 0, paddingLeft: 5,paddingRight: 5}}>        
        <View style={styles.gameControlArea} id={'gameControlArea'}>
          <View style={styles.gameControls}> 
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
        <View style={{flexGrow:0}}>
          <GameGrid gameState={gameState} tileColor={tileColor} boardSize={boardSize}></GameGrid>                    
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
    marginLeft: 10,
    marginRight: 10,
    flexDirection: 'row', 
    alignContent: 'center', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  }
})