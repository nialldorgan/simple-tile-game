import { Stack } from 'expo-router'

export default function Layout() {
  return (
    <Stack screenOptions={{      
       headerStyle: {
          backgroundColor: '#25292e'
        },
        headerTintColor: '#faee43',
        headerTitleStyle: {
          fontWeight: 900,
          fontSize: 20,
        },
    }}>
      <Stack.Screen name="helpScreen" />
      <Stack.Screen name="about"/>
    </Stack>
  );
}