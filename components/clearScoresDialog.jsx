import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, Dialog, Text, TextInput, Portal } from 'react-native-paper'

type Props = {
  showMe: boolean,
  gridSize: string,
  handleCloseMe: () => void,
  handleClearScores: () => void
}

const ClearScoresDialog = ({showMe, gridSize, handleCloseMe, handleClearScores}: Props) => {

  return (
    <Dialog 
    visible={showMe}     
    dismissable={false}>
      <Dialog.Title style={{color: '#ffffff', fontWeight: 900}}>
        <View style={{ flexDirection: 'column', alignItems: 'center', width: '100%'}}>                  
          <Text variant='headlineMedium' >{`Clear scores for grid ${gridSize}x${gridSize}`}</Text>
        </View>
      </Dialog.Title>
      <Dialog.Actions>
        <Button mode='contained' 
        buttonColor='#00de4aff'        
        onPress={handleClearScores}>Yes</Button>
        <Button mode='contained' buttonColor='#de005dff'  onPress={handleCloseMe}>No</Button>
      </Dialog.Actions>
    </Dialog>
  )
}

export default ClearScoresDialog