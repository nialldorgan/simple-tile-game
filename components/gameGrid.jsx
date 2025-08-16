import { View, StyleSheet, Text } from 'react-native'
import GameSquare from '@/components/gameSquare'
import GameTile from '@/components/gameTile'

type Props = {
  gameState: number,
  tileColor: string,
  boardSize: number
}


export default function GameGrid ({ gameState, tileColor, boardSize }: Props) {

  return (
    <View style={[styles.gameBoard, { width: boardSize, height: boardSize}]}>      
      {
        gameState.map((row, index) => (
          <View style={styles.rows} key={index}>
            { row.map(col => (
              <View key={col.tileProps? col.tileProps.label: `emptySquare`}>
                <GameSquare colIndex={col.colIndex} rowIndex={col.rowIndex} hasTile={col.hasTile} tileProps={col.tileProps} squareMinWidth={col.squareMinWidth}></GameSquare>
              </View>
            ))}
          </View>
        ))
      }     
    </View>
      
  )
}


        

const styles = StyleSheet.create({
  gameBoard: {    
    borderColor: '#818181ff',
    borderWidth: 10
  },
  rows: {
    flexDirection: 'row'
  }
  
})