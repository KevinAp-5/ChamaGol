import { DefaultTheme, NavigationContainer, Theme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect } from "react";
import { StatusBar, Platform, PermissionsAndroid } from "react-native";
import * as Notifications from "expo-notifications";

import { CustomAlertProvider } from "./src/components/CustomAlert";
import DeepLinkListener from "./src/components/DeepLinkListener";
import { NotificationProvider } from "./src/context/NotificationProvider";
import AboutScreen from "./src/screens/about";
import EmailConfirmationSuccessScreen from "./src/screens/EmailConfirmationSuccess";
import EmailVerificationScreen from "./src/screens/EmailVerification";
import ForgotPasswordScreen from "./src/screens/forgotPassword";
import HomeScreen from "./src/screens/home";
import LoginScreen from "./src/screens/login";
import PasswordResetEmailConfirmed from "./src/screens/passwordResetEmailConfirmed";
import PaymentFailureScreen from "./src/screens/payment/failure";
import PaymentPendingScreen from "./src/screens/payment/pending";
import PaymentSuccessScreen from "./src/screens/payment/success";
import ProfileScreen from "./src/screens/profile";
import ProSubscriptionScreen from "./src/screens/subscription";
import RegisterScreen from "./src/screens/register";
import RequestPasswordReset from "./src/screens/requestPasswordReset";
import SplashScreen from "./src/screens/splash";
import TimelineScreen from "./src/screens/timeline";
import { navigationRef } from "./src/utils/navigationRef";

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
  EmailVerification: object;
  PaymentSuccess: undefined;
  PaymentFailure: undefined;
  PaymentPending: undefined;
  EmailConfirmationSuccess: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const DarkTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#000000",
    card: "#000000",
    text: "#ffffff",
    border: "#222222",
    primary: "#ffffff",
  },
};

async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

async function requestNotificationPermission() {
  if (Platform.OS === "android") {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any
    );
    console.log(
      "[PERMISSION] POST_NOTIFICATIONS:",
      result === PermissionsAndroid.RESULTS.GRANTED
    );
  } else if (Platform.OS === "ios") {
    const status = await Notifications.requestPermissionsAsync();
    console.log("[PERMISSION] iOS:", status.granted);
  }
}

export default function App() {
  useEffect(() => {
    setupNotificationChannel();
    requestNotificationPermission();

    Notifications.getDevicePushTokenAsync().then((token) => {
      console.log("[PUSH TOKEN]", token.data);
    });

    Notifications.scheduleNotificationAsync({
      content: {
        title: "Teste Local",
        body: "Se notificação aparecer, o problema é FCM/Expo push",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("[NOTIFICATION RECEIVED]", JSON.stringify(notification));
      }
    );

    const clickSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as any;
        console.log("[NOTIFICATION CLICK]", JSON.stringify(data));

        if (data?.screen === "Timeline" && navigationRef.isReady()) {
          navigationRef.navigate("Timeline" as never);
        }
      });

    return () => {
      subscription.remove();
      clickSubscription.remove();
    };
  }, []);

  const linking = {
    prefixes: ["chamagol://", "https://chamagol.com", "exp://"],
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
    <CustomAlertProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <NavigationContainer ref={navigationRef} linking={linking} theme={DarkTheme}>
        <NotificationProvider>
          <DeepLinkListener />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#000000" },
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Timeline" component={TimelineScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen
              name="PasswordResetEmailConfirmed"
              component={PasswordResetEmailConfirmed}
            />
            <Stack.Screen name="RequestPassword" component={RequestPasswordReset} />
            <Stack.Screen name="ProSubscription" component={ProSubscriptionScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            <Stack.Screen name="EmailConfirmationSuccess" component={EmailConfirmationSuccessScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
            <Stack.Screen name="PaymentFailure" component={PaymentFailureScreen} />
            <Stack.Screen name="PaymentPending" component={PaymentPendingScreen} />
          </Stack.Navigator>
        </NotificationProvider>
      </NavigationContainer>
    </CustomAlertProvider>
  );
}