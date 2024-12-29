import "@expo/metro-runtime";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import EmailConfirmation from './src/components/EmailConfirm';
import HomeScreen from './src/components/HomeScreen';
import Login from './src/components/Login/';
import Register from './src/components/Register/';
import ResetPassword from './src/components/ResetPassword';
import Timeline from './src/components/TimeLine/';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{gestureEnabled: true}}>
        <Stack.Screen name= "EmailConfirmation" component={EmailConfirmation} options={{headerShown: false, gestureDirection: 'horizontal'}} />
        <Stack.Screen name= "Home" component={HomeScreen} options={{headerShown: false, gestureDirection: 'horizontal'}} />
        <Stack.Screen name= "Login" component={Login} options={{headerShown: false, gestureDirection: 'horizontal'}} />
        <Stack.Screen name= "Register" component={Register} options={{headerShown: false, gestureDirection: 'horizontal'}} />
        <Stack.Screen name= "ResetPassword" component={ResetPassword} options={{headerShown: false, gestureDirection: 'horizontal'}} />
        <Stack.Screen name= "Timeline" component={Timeline} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
