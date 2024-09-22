import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './src/components/Login/';
import Timeline from './src/components/TimeLine/';
import Register from './src/components/Register/';
import Title from './src/components/Title';
import ResetPassword from './src/components/ResetPassword';
import HomeScreen from './src/components/HomeScreen'

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name= "Home" component={HomeScreen} options={{headerShown: false}} />
        <Stack.Screen name= "Login" component={Login} options={{headerShown: false}} />
        <Stack.Screen name= "Register" component={Register} options={{headerShown: false}} />
        <Stack.Screen name= "ResetPassword" component={ResetPassword} options={{headerShown: false}} />
        <Stack.Screen name= "Timeline" component={Timeline} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#e0e5e5',
    backgroundColor: "#0C3B2E",
    paddingTop: 0,
  },
});

export default App;
