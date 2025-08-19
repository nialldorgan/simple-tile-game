import { Tabs } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome6'

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#25292e'
        },
        headerShown: false,
        // headerLargeTitle: true,
        // headerShadowVisible: false,
        // headerTintColor: '#fff',
        // headerTitle: 'Slider Challenge',
        // headerTitleAlign: 'center',
        tabBarStyle: {
          color: '#ffffff',
          backgroundColor: '#25292e',
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FFD54F'       
    }}>
      <Tabs.Screen
      
        name="index"
        options={{          
          tabBarIcon: ({color, size}) => (
            <FontAwesome name={'house'} size={size} color={color}></FontAwesome>
          )
        }}
      />

      <Tabs.Screen
        name="scoreBoard"
        options={{

          tabBarIcon: ({color, size}) => (
            <FontAwesome name={'trophy'} size={size} color={color}></FontAwesome>
          )
        }}
      />
    </Tabs>
  );
}