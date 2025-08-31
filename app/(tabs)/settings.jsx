import React from 'react'
import { View, StyleSheet } from 'react-native'
import { ImageBackground } from 'expo-image'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'
import { PaperProvider, Text, RadioButton, Switch } from 'react-native-paper'
import useGameStore from '@/store/gameStore'

const SettingsScreen = () => {

  const isSoundEnabled = useGameStore((state) => state.isSoundEnabled)
  const defaultGridSize = useGameStore((state) => state.defaultGridSize)
  const scoreOptions = useGameStore((state) => state.scoreOptions)

  const setSoundEnabled = useGameStore((state) => state.setSoundEnabled)
  const setDefaultGridSize = useGameStore((state) => state.setDefaultGridSize)
  const setScoreOptions = useGameStore((state) => state.setScoreOptions)

  React.useEffect(() => {
    useGameStore.getState().hydrateSettings()
  }, [])

  // Save settings to AsyncStorage
  const saveSettings = (changedValue) => {    
    if (typeof changedValue === 'string') {
      setScoreOptions(changedValue)
    } else if (typeof changedValue === 'boolean') {
      setSoundEnabled(changedValue)
    } else if (typeof changedValue === 'number') {
      setDefaultGridSize(changedValue)
    }
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
            <View style={{alignItems: 'center'}}>
              <Text variant='headlineMedium' style={styles.textHeader}>Slider Challenge</Text>
              <Text variant='headlineMedium' style={styles.textHeader}>Settings</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'center', justifyContent: 'space-between', width: '80%', marginTop: 20}}>
              <Text style={styles.label}>Sound enabled*</Text>
              <Switch
                color='#0aedf5'
                value={isSoundEnabled}
                onValueChange={saveSettings}
              />
            </View>
            <View style={{flexDirection: 'column', width: '80%', alignSelf: 'center', marginTop: 20}}>
              <Text style={styles.label}>Score top ten:</Text>
              <RadioButton.Group onValueChange={saveSettings} value={scoreOptions} >
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='By moves' value='moves'></RadioButton.Item>
                  <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='By time' value='time'></RadioButton.Item>
                </View>
              </RadioButton.Group>
            </View>
            <View style={{flexDirection: 'column', width: '80%', alignSelf: 'center', marginTop: 20}}>
              <Text style={styles.label}>Default grid size</Text>
              <RadioButton.Group onValueChange={saveSettings} value={defaultGridSize} >
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='3x3' value={3}></RadioButton.Item>
                  <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='4x4' value={4}></RadioButton.Item>
                </View>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='5x5' value={5}></RadioButton.Item>
                  <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='6x6' value={6}></RadioButton.Item>
                </View>
              </RadioButton.Group>
            </View>
            <View style={{flexDirection: 'column', width: '80%', alignSelf: 'center', marginTop: 20}}>
              <Text style={{fontSize: 12, color: '#fff'}}>*Updated sound settings will only take effect when the board is reset</Text>
            </View>
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
  settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
      width: '80%'
  },
  label: {
      fontSize: 18,
      color: '#fff'
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

export default SettingsScreen