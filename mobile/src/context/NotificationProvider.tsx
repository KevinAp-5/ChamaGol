import { useEffect } from "react";
import { configureNotificationHandler, registerDeviceForPush } from '../services/Notifications';

export const NotificationProvider = ({
    children,
}: any) => {
    useEffect(() => {
        configureNotificationHandler();
        registerDeviceForPush();
    }, []);

    return children;
};
