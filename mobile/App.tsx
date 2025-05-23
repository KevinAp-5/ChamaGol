import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
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
import EmailConfirmationSuccessScreen from "./src/screens/EmailConfirmationSuccess";
import PaymentSuccessScreen from "./src/screens/payment/success";
import PaymentFailureScreen from "./src/screens/payment/failure";
import PaymentPendingScreen from "./src/screens/payment/pending";
import messaging, { registerDeviceForRemoteMessages } from "@react-native-firebase/messaging";
import { Alert } from "react-native";

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
};

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    messaging().subscribeToTopic("all_users");
  }, []);
  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Permissão concedida para notificações!");
    }
  }

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("Nova Notificação!", remoteMessage.notification.body);
      console.log("putdata info: " + remoteMessage.data);
    });

    return unsubscribe;
  }, []);

  const linking = {
    prefixes: ["chamagol://", "https://chamagol-9gfb.onrender.com", "exp://"],
    config: {
      screens: {
        Home: "home",
        // Telas de pagamento para deep link
        PaymentSuccess: "payment/success",
        PaymentFailure: "payment/failure",
        PaymentPending: "payment/pending",
        // Outras telas existentes
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
          <Stack.Screen name="Login" component={LoginScreen} />
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
          {/* Adicione as novas telas para deep link */}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
