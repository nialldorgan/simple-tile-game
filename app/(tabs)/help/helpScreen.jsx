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
                General
              </Text>
              <View style={{ marginBottom: 12, maxWidth: 300 }}>
                <Text style={styles.text}>This simple tile puzzle is based on the 15-puzzle game. 
                  The objective is to arrange the tiles in a specific order by sliding them into the empty space.
                  You have the option of playing on 4 different grid sizes: 3x3, 4x4, 5x5, and 6x6.
                  You can choose to play with numbered tiles or with image tiles.
                  An image can be selected from your device if you have a photo album.
                  The game remembers the last image you used. 
                  You can select a default grid size and whether to score by moves or time in settings.
                </Text>
              </View>
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
                Game controls
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
                <Text style={styles.text}>3. All the puzzles are solvable.</Text>
              </View>
              <Text
                variant="headlineSmall"
                style={styles.textSubHeader}
              >
                Scoring
              </Text>
              <View style={{ marginBottom: 12, maxWidth: 300 }}>
                <Text style={styles.text}>
                  The default scoring system is based on the number of moves taken to solve the puzzle. 
                  You can change this in settings to score by the time taken to solve the puzzle instead.
                  There is a top ten list for each grid size.
                  You can clear each top ten individually by clicking the clear button at the top of each list in the scores screen.
                  If the primary score is moves the secondary score will be time.
                  If there are two scores with the same primary score the one with the better secondary score will be ranked higher.
                  Changing the score option will not clear the existing top ten lists but it will re-rank them.
                </Text>
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