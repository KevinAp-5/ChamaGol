import "@expo/metro-runtime";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Screens
import HomeScreen from "./src/screens/Home/home.js";
import Timeline from "./src/screens/Timeline/timeline.js";

// Auth Screens
import Login from "./src/screens/Auth/Login/login.js";
import Register from "./src/screens/Auth/Register/register.js";
import EmailInput from "./src/screens/Auth/EmailInput/emailInput.js";
import ResetPassword from "./src/screens/Auth/ResetPassword/resetPassword.js";
import EmailConfirmation from "./src/screens/Auth/EmailConfirmation/emailConfirmation.js";


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home" 
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyle: { backgroundColor: '#FFFFFF' }
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="EmailInput" component={EmailInput} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="EmailConfirmation" component={EmailConfirmation} />
        <Stack.Screen 
          name="Timeline" 
          component={Timeline}
          options={{
            headerShown: true,
            headerTitle: 'CHAMAGOL Timeline',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#0C3B2E',
            },
            headerTintColor: '#FFBA00',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;