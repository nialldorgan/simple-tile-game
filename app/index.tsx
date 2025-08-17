import GameBoard from '@/components/gameBoard'
import { PaperProvider } from 'react-native-paper'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'
import { useRef } from 'react'
import { View } from 'react-native'
import { IconButton, MD3Colors } from 'react-native-paper'


export default function Index() {
  const gameRef = useRef()
  const handleNewGame = () => {
    gameRef.current?.newGame();
  }
  const handleResetBoard = () => {
    gameRef.current?.resetBoard();
  }
  const handlePickImage = () => {
    gameRef.current?.pickImage();
  }
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#25292e' }}>
          <GameBoard ref={gameRef}></GameBoard>
          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>            
            <IconButton
            icon="play"
            iconColor="#ffffff"
            size={32}
            style={{padding: 8}}
            onPress={handleNewGame}></IconButton>
            <IconButton
            icon="refresh"
            iconColor="#ffffff"
            size={32}
            style={{padding: 8}}
            onPress={handleResetBoard}></IconButton>
            <IconButton
            icon="image"
            iconColor="#ffffff"
            size={32}
            style={{padding: 8}}
            onPress={handlePickImage}></IconButton>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
