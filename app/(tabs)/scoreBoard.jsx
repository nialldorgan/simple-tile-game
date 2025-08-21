import React from 'react'
import { StyleSheet } from 'react-native'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'
import { DataTable, Text, Card } from 'react-native-paper'
import { ImageBackground } from 'expo-image'
import { useFocusEffect } from 'expo-router'
import { useReusableFunctions } from '@/hooks/reusableFunctions'

const ScoreBoard = () => {
  const [scoreBoard, setScoreBoard ] = React.useState([])

  const image = {uri: 'https://legacy.reactjs.org/logo-og.png'}
  const { storeData, getData } = useReusableFunctions()

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

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#25292e' }}>
          <ImageBackground 
          contentFit="cover"
          transition={1000}
          source={require('@/assets/images/simple-tile-puzzle-background.png')} 
          style={styles.background}>
            <DataTable style={{backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 10, padding: 10, margin: 10, width: '90%'}}>
              <DataTable.Header >
                <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>User</DataTable.Title>
                <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>Grid</DataTable.Title>
                <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>Moves</DataTable.Title>
                <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>Time (s)</DataTable.Title>
              </DataTable.Header>
              { scoreBoard.map((score, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell textStyle={[styles.tableText]}>{score.userName}</DataTable.Cell>
                  <DataTable.Cell textStyle={[styles.tableText]}>{`${score.gridSize}x${score.gridSize}`}</DataTable.Cell>
                  <DataTable.Cell textStyle={[styles.tableText]}>{score.moves}</DataTable.Cell>
                  <DataTable.Cell textStyle={[styles.tableText]}>{score.time}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
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
  tableText: {
    color: '#ffffff',
    textAlign: 'right'
  },

  tableHeader: {
    fontSize: 12,
    fontWeight: 900
  }
})


export default ScoreBoard