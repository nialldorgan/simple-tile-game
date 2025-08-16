import { View, StyleSheet, Pressable, Text } from 'react-native'
import { useState } from 'react'
import { Image } from 'expo-image'

export type TileProps = {
  background?: string,
  textColor: string,
  size: 30,
  label?: string,
  img?: string,
  homePosition: {
    rowIndex: number,
    colIndex: number
  },
  currentPosition: {
    rowIndex: number,
    colIndex: number
  },
  handleTileClick?: () => void
} 

export function GameTile ({background = '#868686ff', textColor = '#black', size = 30, label = null, img = null, currentPosition = {rowIndex:0, colIndex:0}, homePosition, handleTileClick}: TileProps) {
    const [tileIndex, setTileIndex] = useState(parseInt(label))
    return (     
        
      img ? (
        <View style={{ height: size, width: size, position: 'relative' }}>
          <Pressable
            style={styles.gameTile}
            onPress={() => handleTileClick(homePosition, currentPosition, tileIndex)}
          >
            <Text style={[styles.textStyle, { color: textColor, zIndex: 1000 }]}>{label}</Text>
            <Image
              style={{ height: size, width: size }}
              source={img} />
          </Pressable>
        </View>
      ) : (
        <View style={{ backgroundColor: background, height: size, width: size }}>
          <Pressable
            style={styles.gameTile}
            onPress={() => handleTileClick(homePosition, currentPosition, tileIndex)}
          >
            <Text style={[styles.textStyle, { color: textColor }]}>{label}</Text>
          </Pressable>
        </View>
      )

    )
}


const styles = StyleSheet.create({
  textStyle: {    
    position: 'absolute', 
    top: 0, 
    left: 0, 
    fontWeight: 'bold',
    fontSize: 11,    
    paddingHorizontal: 6,
    textShadowColor: '#000000',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 2,

  },
  gameTile: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    position: 'relative',
    borderWidth: 1,
    borderTopColor: '#ffffff',      // light top edge
    borderLeftColor: '#ffffff',     // light left edge
    borderBottomColor: '#414141ff',   // darker bottom edge
    borderRightColor: '#414141ff',    // darker right edge
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3, // for Android      
  }
})