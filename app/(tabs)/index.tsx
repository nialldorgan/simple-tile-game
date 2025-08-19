import GameBoard from '@/components/gameBoard'
import { PaperProvider, Text } from 'react-native-paper'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'
import { useRef } from 'react'
import { View, StyleSheet, StatusBar} from 'react-native'
import { IconButton } from 'react-native-paper'
import { ImageBackground, Image } from 'expo-image'


const Index = () => {
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#25292e', paddingTop: StatusBar.currentHeight }} edges={['top']}>
          <ImageBackground 
          contentFit="cover"
          transition={1000}
          source={require('@/assets/images/simple-tile-puzzle-background.png')} 
          style={styles.background}>
            <Image 
            contentPosition='top center'
            contentFit='contain'
            style={{width: '100%', flex: 1}}
            transition={{duration:1000, effect:'flip-from-bottom', timing:'ease-in-out'}}
            source={require('@/assets/images/slider-challenge-title.png')}></Image>            
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
          </ImageBackground>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  text: {
    color: 'white',
    fontSize: 24
  }
})

export default Index