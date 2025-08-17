import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: '#25292e'
        },
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitle: 'Slider Challenge',
        headerTitleAlign: 'center'
      }}/>
      <StatusBar style="light"/>
    </ThemeProvider>
  )
  
}
