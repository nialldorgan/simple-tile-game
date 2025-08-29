import { View, StyleSheet } from 'react-native'
import {GameTile, TileProps} from '@/components/gameTile'

type Props = {
  colIndex: number,
  rowIndex: number,
  hasTile: boolean,
  squareMinWidth: number,
  tileProps?: object,
  showShuffleAnimation: boolean
}

export default function GameSquare ({ colIndex, rowIndex, hasTile, squareMinWidth, tileProps = null, showShuffleAnimation}: Props) {
  if (hasTile && tileProps) {
    const { background, textColor, size, label, img, homePosition, currentPosition, handleTileClick } = tileProps
    return (
      <View>
        <GameTile background={background} textColor={textColor} 
        size={size} label={label} img={img} homePosition={homePosition} 
        currentPosition={currentPosition} 
        handleTileClick={handleTileClick}
        showShuffleAnimation={showShuffleAnimation}></GameTile>
      </View>
    )   
  }
  
  return (
    <View style={{minWidth: squareMinWidth}}>
      
    </View>
  )
}