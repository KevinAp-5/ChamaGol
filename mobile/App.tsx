import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import DeepLinkListener from './src/components/DeepLinkListener';
import AboutScreen from './src/screens/about';
import ForgotPasswordScreen from './src/screens/forgotPassword';
import HomeScreen from './src/screens/home';
import LoginScreen from './src/screens/login';
import PasswordResetEmailConfirmed from './src/screens/passwordResetEmailConfirmed';
import ProfileScreen from './src/screens/profile';
import RegisterScreen from './src/screens/register';
import RequestPasswordReset from './src/screens/requestPasswordReset';
import SplashScreen from './src/screens/splash';
import ProSubscriptionScreen from './src/screens/subscription';
import TimelineScreen from './src/screens/timeline';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Timeline: undefined;
  About: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PasswordResetEmailConfirmed: undefined;
  RequestPassword: undefined;
  ProSubscription: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const linking = {
    prefixes: ['chamagol://', 'https://chamagol-9gfb.onrender.com'],
    config: {
      screens: {
        Home: 'home',
        Payment: 'payment',
        PaymentSuccess: 'payment/success',
        PaymentFailure: 'payment/failure',
        PaymentPending: 'payment/pending',
        // Adicione outras rotas conforme necessário
      },
    },

  };
  return (
    <>
    <NavigationContainer linking={linking}>
      <DeepLinkListener/>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="PasswordResetEmailConfirmed" component={PasswordResetEmailConfirmed} />
        <Stack.Screen name="RequestPassword" component={RequestPasswordReset} />
        <Stack.Screen name="ProSubscription" component={ProSubscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  ); 
}
