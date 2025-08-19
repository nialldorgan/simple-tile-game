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
    <View style={styles.gameOutsideBoard}>
      <View style={styles.gameBoardMiddleBorder}>
        <View style={styles.gameInsideBoard}>
          <View>      
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
        </View>
      </View>
    </View>
  )
}


        

const styles = StyleSheet.create({
  gameOutsideBoard: {    
    borderTopColor: '#ffffff',      // light top edge
    borderLeftColor: '#ffffff',     // light left edge
    borderBottomColor: '#414141ff',   // darker bottom edge
    borderRightColor: '#414141ff',    // darker right edge
    borderWidth: 1
  },
  gameBoardMiddleBorder: {
    borderColor: '#6b6b6bff',
    borderWidth: 8
  },
  gameInsideBoard: {    
    borderBottomColor: '#ffffff',      // light top edge
    borderRightColor: '#ffffff',     // light left edge
    borderLeftColor: '#414141ff',   // darker bottom edge
    borderTopColor: '#414141ff',    // darker right edge
    borderWidth: 1
  },
  rows: {
    flexDirection: 'row'
  }
  
})