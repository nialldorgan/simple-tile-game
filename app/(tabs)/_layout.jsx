import { Tabs } from 'expo-router'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#25292e'
        },
        headerShown: false,        
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
            <FontAwesome5 name={'home'} size={size} color={color}></FontAwesome5>
          )
        }}
      />

      <Tabs.Screen
        name="scoreBoard"
        options={{
          tabBarIcon: ({color, size}) => (
            <FontAwesome5 name={'trophy'} size={size} color={color}></FontAwesome5>
          )
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({color, size}) => (
            <FontAwesome5 name={'cog'} size={size} color={color}></FontAwesome5>
          )
        }}
      />

      <Tabs.Screen
        name="help"
        options={{
          tabBarIcon: ({color, size}) => (
            <FontAwesome5 name={'question-circle'} size={size} color={color}></FontAwesome5>
          )
        }}
      />
    </Tabs>
  );
}