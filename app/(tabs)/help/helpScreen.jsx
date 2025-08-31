import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context'
import { ImageBackground } from 'expo-image'
import { PaperProvider, Text, Icon, IconButton } from 'react-native-paper'
import { Link } from 'expo-router'

export default function helpScreen() {

  return (
    <PaperProvider>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#25292e' }}>
          <ImageBackground
            source={require('@/assets/images/simple-tile-puzzle-background.png')}
            style={styles.background}
            contentFit="cover"
            transition={1000}
          >
            <ScrollView contentContainerStyle={styles.container}>
              <Text
                variant="headlineMedium"
                style={styles.textHeader}
              >
                Help & Instructions
              </Text>
              <Text
                variant="headlineSmall"
                style={styles.textSubHeader}
              >
                How to Play
              </Text>
              <View style={{ marginBottom: 12, maxWidth: 300 }}>
                <Text style={styles.text}>1. Tap on a tile to move it.</Text>
                <Text style={styles.text}>2. Move or swap tiles to solve the puzzle.</Text>
                <Text style={styles.text}>3. Complete the puzzle in as few moves or as fast as possible, you can decide!</Text>
              </View>
              <Text
                variant="headlineSmall"
                style={styles.textSubHeader}
              >
                Menu
              </Text>
              <View style={{ marginBottom: 12, maxWidth: 300 }}>
                {[
                  { icon: 'play', text: 'Click to scramble the board and start a new game.' },
                  { icon: 'refresh', text: 'Click to reset the board.' },
                  { icon: 'image', text: 'Click to change the puzzle image.' },
                  { icon: 'image-remove', text: 'Click to remove the puzzle image and use plain tiles.' },
                ].map(({ icon, text }, index) => (
                  <View key={icon} style={styles.row}>
                    <View style={styles.icon}>
                      <Icon
                        source={icon}
                        color="#fff"
                        size={32}
                      />
                    </View>
                    <Text style={styles.text}>{text}</Text>
                  </View>
                ))}
              </View>
              <Text
                variant="headlineSmall"
                style={styles.textSubHeader}
              >
                Tips
              </Text>
              <View style={{ marginBottom: 12, maxWidth: 300 }}>
                <Text style={styles.text}>1. Plan your moves ahead.</Text>
                <Text style={styles.text}>2. Try to solve from the top line first, then each line in turn.</Text>
              </View>
              <View style={{ alignItems: 'center', marginTop: 24 }}>
                
                <Link href="/help/about">
                  <Text
                    variant="titleMedium"
                    style={styles.textSubHeader}
                  >
                    About this app
                  </Text>
                </Link>
              </View>
            </ScrollView>
          </ImageBackground>
        </SafeAreaView>
      </SafeAreaProvider>
    </PaperProvider>
  )
}

const styles = StyleSheet.create({

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    alignContent: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 36, // fixed width ensures alignment
    marginRight: 12,
  },

   background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  },
  container: {
    padding: 24,
    flexGrow: 1
  },
  textSubHeader: {
    marginBottom: 24,
    textAlign: 'left',
    fontWeight: 900,
    color: '#faee43',                 
    textShadowColor: '#b08648', 
    textShadowOffset: {width: 3, height: 3}, 
    textShadowRadius: 5
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    padding: 12
  },

  textHeader: {
    marginBottom: 24,
    color: '#faee43', 
    textAlign: 'center',
    fontWeight: 900,                   
    textShadowColor: '#b08648', 
    textShadowOffset: {width: 3, height: 3}, 
    textShadowRadius: 5
  }
})