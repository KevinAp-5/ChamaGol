import React, {Children, useEffect} from "react";
import * as Notifications from "expo-notifications";
import { configureNotificationHandler, registerDeviceForPush } from '../services/Notifications';
import { useNavigation } from "@react-navigation/native";

export const NotificationProvider = ({
    children,
}: any) => {
    const navigation: any = useNavigation();

    useEffect(() => {
        configureNotificationHandler();
        registerDeviceForPush();

        const ResponseListener =
            Notifications.addNotificationResponseReceivedListener(
                () => {navigation.navigate("Timeline");}
            );
        
        return () => {
            ResponseListener.remove();
        };
    }, []);

    return children;
};
