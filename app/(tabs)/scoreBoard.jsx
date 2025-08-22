import React from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'
import { PaperProvider } from 'react-native-paper'
import { DataTable, Text, Button } from 'react-native-paper'
import { ImageBackground } from 'expo-image'
import { useFocusEffect } from 'expo-router'
import { useReusableFunctions } from '@/hooks/reusableFunctions'
import ClearScoresDialog from '@/components/clearScoresDialog'
import config from '../../config.json' with { type: "json" }

const ScoreBoard = () => {
  const [ scoreBoard, setScoreBoard ] = React.useState([])
  const [ gridOptions, setGridOptions ] = React.useState(config.gridOptions)
  const [ filterByGrid, setFilterByGrid ] = React.useState(4)
  const [ showClearScoresDialog, setShowClearScoresDialog ] = React.useState(false)

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

  const filterScoresByGridSize = React.useMemo(() => {
    return scoreBoard.filter(score => score.gridSize === filterByGrid)
      .sort((a, b) => {
        if (a.time !== b.time) {
          return a.time - b.time
        }
        return a.moves - b.moves
      })
  }, [scoreBoard, filterByGrid])

  const clearValues = () => {
    const clearedScores = scoreBoard.filter(score => {
      return score.gridSize !== filterByGrid
    })
    setScoreBoard(clearedScores)
    storeData(clearedScores, 'scoreBoard')
    setShowClearScoresDialog(false)
  }

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#25292e' }}>
          <ImageBackground 
          contentFit="cover"
          transition={1000}
          source={require('@/assets/images/simple-tile-puzzle-background.png')} 
          style={styles.background}>
            <ScrollView style={{width: '100%', flexGrow: 0, paddingLeft: 5,paddingRight: 5}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '95%', marginLeft: 5, marginRight: 5}}>
                { gridOptions.map(option => (
                  <Button 
                  key={option.value}
                  compact={true}                  
                  mode='outlined'
                  onPress={() => setFilterByGrid(option.value)}
                  textColor='#FFD54F'>{option.label}</Button>
                ))}
              </View>
              <DataTable style={{backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 10,  paddingTop: 10, marginTop: 10, width: '99%'}}>
                <DataTable.Header >
                  <View style={{flexDirection: 'column', width: '100%'}}> 
                    <View style={{width: '100%', flexDirection: 'row'}}>
                      <Button                       
                      compact={true}                  
                      mode='contained-tonal'
                      disabled={filterScoresByGridSize.length < 1}
                      onPress={() => setShowClearScoresDialog(true)}
                      textColor='#3d3787'>Clear</Button>
                    </View>
                    <View style={{width: '100%', flexDirection: 'row'}}>
                      <DataTable.Title style={{ flex:2 }} textStyle={[styles.tableText, styles.tableHeader]}>Date</DataTable.Title>
                      <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>User</DataTable.Title>
                      <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>Grid</DataTable.Title>
                      <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>Moves</DataTable.Title>
                      <DataTable.Title textStyle={[styles.tableText, styles.tableHeader]}>Time</DataTable.Title>
                    </View>
                  </View>
                </DataTable.Header>
                { filterScoresByGridSize.map((score, index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell style={{ flex:2 }} textStyle={[styles.tableText, styles.tableCell]}>{score.date}</DataTable.Cell>
                    <DataTable.Cell textStyle={[styles.tableText, styles.tableCell]}>{score.userName}</DataTable.Cell>
                    <DataTable.Cell textStyle={[styles.tableText, styles.tableCell]}>{`${score.gridSize}x${score.gridSize}`}</DataTable.Cell>
                    <DataTable.Cell textStyle={[styles.tableText, styles.tableCell]}>{score.moves}</DataTable.Cell>
                    <DataTable.Cell textStyle={[styles.tableText, styles.tableCell]}>{score.time}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </ScrollView>
            <ClearScoresDialog 
            showMe={showClearScoresDialog}
            gridSize={filterByGrid}
            handleCloseMe={() => setShowClearScoresDialog(false)}
            handleClearScores={clearValues}></ClearScoresDialog>
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
    // textAlign: 'right',
  },

  tableCell: {
    fontSize: 9    
  },

  tableHeader: {
    fontSize: 10,
    fontWeight: 900
  }
})


export default ScoreBoard