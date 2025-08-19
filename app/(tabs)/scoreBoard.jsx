import React from 'react'
import { StyleSheet } from 'react-native'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'
import { DataTable, Text } from 'react-native-paper'
import { ImageBackground } from 'expo-image'

const ScoreBoard = () => {
  const image = {uri: 'https://legacy.reactjs.org/logo-og.png'}
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#25292e' }}>
          <ImageBackground 
          contentFit="cover"
          transition={1000}
          source={require('@/assets/images/simple-tile-puzzle-background.png')} 
          style={styles.background}></ImageBackground>
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


export default ScoreBoard