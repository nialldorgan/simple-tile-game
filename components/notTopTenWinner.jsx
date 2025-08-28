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
}

const NotTopTenWinner = ({showMe, moves, time, handleCloseMe}: Props) => {  
  const choiceRef = React.useRef(Math.floor(Math.random() * config.notTopTenWinners.length))
  const choice = choiceRef.current  

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
                  <Text variant='headlineLarge' style={styles.textHeader}>{config.notTopTenWinners[choice].line1}</Text>
                  <Text variant='headlineMedium' style={styles.textHeader}>{config.notTopTenWinners[choice].line2}</Text>
                  <Text variant='headlineSmall' style={styles.textHeader}>{`${moves} moves in ${time} seconds`}</Text>
                </View>
              </Dialog.Title>                
                <Dialog.Actions>                    
                  <Button mode='contained' buttonColor='#00cfde'  onPress={handleCloseMe}>Close</Button>
                </Dialog.Actions>             
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

export default NotTopTenWinner