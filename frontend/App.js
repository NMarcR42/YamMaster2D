// ./App.js
import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SocketProvider } from './app/contexts/socket.context'; 
import HomeScreen from './app/screens/home.screen';
import OnlineGameScreen from './app/screens/online-game.screen';
import VsBotGameScreen from './app/screens/vs-bot-game.screen';
import ModeSelectionScreen from './app/screens/mode-selection.screen'; 

const Stack = createStackNavigator();
LogBox.ignoreAllLogs(true);

function App() {
  return (
    <SocketProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ModeSelectionScreen" component={ModeSelectionScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OnlineGameScreen" component={OnlineGameScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VsBotGameScreen" component={VsBotGameScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>
  );
}

export default App;