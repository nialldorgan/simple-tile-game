import * as React from 'react'
import { View, StyleSheet } from 'react-native'
import { Button, Dialog, Text, TextInput, Portal } from 'react-native-paper'
import { ImageBackground, Image } from 'expo-image'
import config from '../config.json' with { type: "json" }

type Props = {
  showMe: boolean,
  moves: number,
  time: number,
  handleCloseMe: () => void,
  handleRecordScore: () => void
}

const GameWinnerDialog = ({showMe, moves, time, handleCloseMe, handleRecordScore}: Props) => {
  const [ recordScore, setRecordScore ] = React.useState(false)
  const [ winnerName, setWinnerName ] = React.useState('')
  const choiceRef = React.useRef(Math.floor(Math.random() * config.winnerDialogTiles.length));
  const choice = choiceRef.current;

  const onRecordScore = () => {
    setRecordScore(!recordScore)
  }


  return (
    
      <Portal>        
        <Dialog visible={showMe} 
        style={styles.dialog}
        dismissable={false}>
          <ImageBackground 
          contentFit="cover"          
          source={require('@/assets/images/winner.png')}>
            <View style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
              <Dialog.Title style={{color: '#ffffff', fontWeight: 900}}>
                <View style={{ flexDirection: 'column', alignItems: 'center', width: '100%'}}>                  
                  <Text variant='headlineLarge' style={styles.textHeader}>{config.winnerDialogTiles[choice].line1}</Text>
                  <Text variant='headlineMedium' style={styles.textHeader}>{config.winnerDialogTiles[choice].line2}</Text>
                  <Text variant='headlineSmall' style={styles.textHeader}>{`${moves} moves in ${time} seconds`}</Text>
                </View>
              </Dialog.Title>
                
              { recordScore? (
                <View>
                  <Dialog.Content>
                    <Text variant="bodyLarge" style={{color: '#ffffff', textAlign: 'center'}}>Enter your name in the box below</Text>
                    <TextInput 
                    mode='outlined' 
                    label='Your name' 
                    value={winnerName}
                    onChangeText={(text) => setWinnerName(text)}></TextInput>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button mode='contained' 
                    buttonColor='#00cfde' 
                    disabled={winnerName? false: true}
                    onPress={() => handleRecordScore(winnerName)}>Save</Button>
                    <Button mode='contained' buttonColor='#00cfde'  onPress={onRecordScore}>Cancel</Button>
                  </Dialog.Actions>
                </View>
                  
              ) : (
                <View>
                  <Dialog.Content>
                    <Text variant="bodyLarge" style={{color: '#ffffff', textAlign: 'center'}}>Do you want to record your score?</Text>
                  </Dialog.Content>
                  <Dialog.Actions>
                    <Button mode='contained' buttonColor='#00cfde'  onPress={onRecordScore}>Yes</Button>
                    <Button mode='contained' buttonColor='#00cfde'  onPress={handleCloseMe}>No</Button>
                  </Dialog.Actions>
                </View>
              )}                
            </View>              
          </ImageBackground>
        </Dialog>        
      </Portal>

  )
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#00cfde00',
    position: 'relative'
  },
  textHeader: {
    color: '#faee43', 
    textAlign: 'center',
    fontWeight: 900,                   
    textShadowColor: '#b08648', 
    textShadowOffset: {width: 3, height: 3}, 
    textShadowRadius: 5
  }
})

export default GameWinnerDialog