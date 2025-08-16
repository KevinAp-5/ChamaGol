import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import DeepLinkListener from "./src/components/DeepLinkListener";
import AboutScreen from "./src/screens/about";
import ForgotPasswordScreen from "./src/screens/forgotPassword";
import HomeScreen from "./src/screens/home";
import LoginScreen from "./src/screens/login";
import PasswordResetEmailConfirmed from "./src/screens/passwordResetEmailConfirmed";
import ProfileScreen from "./src/screens/profile";
import RegisterScreen from "./src/screens/register";
import RequestPasswordReset from "./src/screens/requestPasswordReset";
import SplashScreen from "./src/screens/splash";
import ProSubscriptionScreen from "./src/screens/subscription";
import TimelineScreen from "./src/screens/timeline";
import EmailVerificationScreen from "./src/screens/EmailVerification";
import EmailConfirmationSuccessScreen from './src/screens/EmailConfirmationSuccess';
import PaymentSuccessScreen from "./src/screens/payment/success";
import PaymentFailureScreen from "./src/screens/payment/failure";
import PaymentPendingScreen from "./src/screens/payment/pending";

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
  EmailVerification: Object;
  PaymentSuccess: undefined;
  PaymentFailure: undefined;
  PaymentPending: undefined;
  EmailConfirmationSuccessScreen: undefined;
};

const Stack = createStackNavigator();

export default function App() {
  const linking = {
    prefixes: ["chamagol://", "https://chamagol-9gfb.onrender.com", "exp://"],
    config: {
      screens: {
        Home: "home",
        PaymentSuccess: "payment/success",
        PaymentFailure: "payment/failure",
        PaymentPending: "payment/pending",
        Splash: "splash",
        Login: "login",
        Timeline: "timeline",
        About: "about",
        Profile: "profile",
        Register: "register",
        ForgotPassword: "forgot-password",
        PasswordResetEmailConfirmed: "password-reset-confirmed",
        RequestPassword: "request-password",
        ProSubscription: "pro-subscription",
        EmailVerification: "email-verification",
        EmailConfirmationSuccess: "email-confirmation-success",
      },
    },
  };

  return (
    <>
      <NavigationContainer linking={linking}>
        <DeepLinkListener />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ gestureEnabled: false}}/>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Timeline" component={TimelineScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen
            name="PasswordResetEmailConfirmed"
            component={PasswordResetEmailConfirmed}
          />
          <Stack.Screen
            name="RequestPassword"
            component={RequestPasswordReset}
          />
          <Stack.Screen
            name="ProSubscription"
            component={ProSubscriptionScreen}
          />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
          />
          <Stack.Screen
            name="EmailConfirmationSuccess"
            component={EmailConfirmationSuccessScreen}
          />
          <Stack.Screen
            name="PaymentSuccess"
            component={PaymentSuccessScreen}
          />
          <Stack.Screen
            name="PaymentFailure"
            component={PaymentFailureScreen}
          />
          <Stack.Screen
            name="PaymentPending"
            component={PaymentPendingScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
