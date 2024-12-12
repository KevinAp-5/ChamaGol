import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './src/components/Login/';
import Timeline from './src/components/TimeLine/';
import Register from './src/components/Register/';
import ResetPassword from './src/components/ResetPassword';
import HomeScreen from './src/components/HomeScreen'
import EmailConfirmation from './src/components/EmailConfirm';
import "@expo/metro-runtime";

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name= "EmailConfirmation" component={EmailConfirmation} options={{headerShown: false}} />
        <Stack.Screen name= "Home" component={HomeScreen} options={{headerShown: false}} />
        <Stack.Screen name= "Login" component={Login} options={{headerShown: false}} />
        <Stack.Screen name= "Register" component={Register} options={{headerShown: false}} />
        <Stack.Screen name= "ResetPassword" component={ResetPassword} options={{headerShown: false}} />
        <Stack.Screen name= "Timeline" component={Timeline} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
