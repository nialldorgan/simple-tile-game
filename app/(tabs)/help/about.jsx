import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { ImageBackground } from 'expo-image'
import { PaperProvider, Text, Icon } from 'react-native-paper'

export default function about() {
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
            <View style={styles.container}>
              <Text
                variant="headlineMedium"
                style={styles.textHeader}
              >
                About Slider Challenge
              </Text>
              <View style={{ marginBottom: 12, maxWidth: 300 }}>
                <Text style={styles.sectionTitle}>Publisher</Text>
                <Text style={styles.text}>Palm Tree Software</Text>
                <Text style={styles.sectionTitle}>Version</Text>
                <Text style={styles.text}>1.0.0</Text>
                <Text style={styles.sectionTitle}>Copyright</Text>
                <Text style={styles.text}>© 2025 Palm Tree Software. All rights reserved.</Text>
              </View>
            </View>
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
    textShadowOffset: { width: 3, height: 3 },
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
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 5
  }
})
