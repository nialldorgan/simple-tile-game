import React from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { PaperProvider } from 'react-native-paper'
import { ImageBackground } from 'expo-image'
import { Text, RadioButton, Switch } from 'react-native-paper'
import { useReusableFunctions } from '@/hooks/useReusableFunctions'
import { useFocusEffect } from 'expo-router'
import config from '../../config.json' with { type: "json" }

const SettingsScreen = () => {
  const { storeData, getData } = useReusableFunctions()
  const [ isSoundEnabled, setIsSoundEnabled ] = React.useState()
  const [ scoreOptions, setScoreOptions ] = React.useState()
  const [ defaultGridSize, setDefaultGridSize ] = React.useState()
  const [ gameOptions, setGameOptions ] = React.useState()
  const [ hasLoadedSettings, setHasLoadedSettings ] = React.useState(false)

  useFocusEffect(
    React.useCallback(() => {
      const loadGameOptionsAsync = async () => {
        const gameOptions = await getData('gameOptions')
        if (gameOptions) {
          setScoreOptions(gameOptions.scoreOptions)
          setIsSoundEnabled(gameOptions.soundOptions)
          setDefaultGridSize(gameOptions.defaultGridSize)
        } else {
          setScoreOptions('moves')
          setIsSoundEnabled(true)
          setDefaultGridSize(config.defaultGridSize)
          setGameOptions({scoreOptions: 'moves', soundOptions: true, defaultGridSize: config.defaultGridSize})
        }
        setHasLoadedSettings(true)
      }
      loadGameOptionsAsync()
    }, [])
  )

  React.useEffect(() => {
    if (hasLoadedSettings) {
      storeData({scoreOptions: scoreOptions, soundOptions: isSoundEnabled, defaultGridSize: defaultGridSize}, 'gameOptions')
    }
  }, [scoreOptions, isSoundEnabled, defaultGridSize])

  return (
    <PaperProvider>
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
            <Text style={styles.label}>Sound enabled</Text>
            <Switch
              color='#0aedf5'
              value={isSoundEnabled}
              onValueChange={setIsSoundEnabled}
            />
          </View>
          <View style={{flexDirection: 'column', width: '80%', alignSelf: 'center', marginTop: 20}}>
            <Text style={styles.label}>Score top ten:</Text>
            <RadioButton.Group onValueChange={(scoreOptions) => setScoreOptions(scoreOptions)} value={scoreOptions} >
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='By moves' value='moves'></RadioButton.Item>
                <RadioButton.Item color='#0aedf5' uncheckedColor='#7868ed' labelStyle={{color: '#ffff'}} label='By time' value='time'></RadioButton.Item>
              </View>
            </RadioButton.Group>
          </View>
          <View style={{flexDirection: 'column', width: '80%', alignSelf: 'center', marginTop: 20}}>
            <Text style={styles.label}>Default grid size</Text>
            <RadioButton.Group onValueChange={(defaultGridSize) => setDefaultGridSize(defaultGridSize)} value={defaultGridSize} >
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
            <Text style={{fontSize: 12, color: '#fff'}}>Updating settings will cause the board to reset</Text>
          </View>
        </ImageBackground>
      </SafeAreaView> 
    </PaperProvider>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',    
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