import { Animated, View, StyleSheet, Pressable, Text } from 'react-native'
import { useState, useRef, useEffect } from 'react'
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
  isShuffled: boolean,
  handleTileClick?: () => void
} 

export function GameTile ({background = '#868686ff', textColor = '#black', size = 30, label = null, 
  img = null, currentPosition = {rowIndex:0, colIndex:0}, homePosition, isShuffled, handleTileClick}: TileProps) {
    const [tileIndex, setTileIndex] = useState(parseInt(label))
    const scale = useRef(new Animated.Value(0)).current    

    useEffect(() => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        delay: currentPosition.colIndex * 30,
        useNativeDriver: true,
      }).start()        
    }, [])
    
    return (     
        
      img ? (
        <Animated.View style={{ height: size, width: size, position: 'relative', transform: [{ scale }] }}>
          <Pressable
            style={[styles.gameTile, styles.userImage]}
            onPress={() => handleTileClick(homePosition, currentPosition, tileIndex)}
          >
            <Text style={[styles.imageTextStyle, { color: textColor, zIndex: 1000 }]}>{label}</Text>
            <Image
              style={[styles.userImage, { height: size, width: size }]}
              source={img} />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View style={{ backgroundColor: background, height: size, width: size, transform: [{ scale }] }}>
          <Pressable
            style={styles.gameTile}
            onPress={() => handleTileClick(homePosition, currentPosition, tileIndex)}
          >
            <Image
              style={{ height: size, width: size }}
              source={require('@/assets/images/puzzle-tile-100px.png')} />            
            <Text style={[styles.plainTileTextStyle, { color: '#10009cff' }]}>{label}</Text>
          </Pressable>
        </Animated.View>
      )

    )
}


const styles = StyleSheet.create({
  imageTextStyle: {    
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

  plainTileTextStyle: {
    position: 'absolute', 
    top: 10, 
    left: 10, 
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textShadowColor: '#12014eff',
    textShadowOffset: { width: -1, height: -1 },
    textShadowRadius: 1,
  },

  userImage: {
    borderWidth: 1,
    borderTopColor: '#7c7c7cff',      // light top edge
    borderLeftColor: '#7c7c7cff',     // light left edge
    borderBottomColor: '#1f1f1fff',   // darker bottom edge
    borderRightColor: '#1f1f1fff',    // darker right edge
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3, // for Android 
  },

  gameTile: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    position: 'relative'
  }
})