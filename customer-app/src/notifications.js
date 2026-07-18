import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { registerPushToken } from './api/auth';

// Show notifications while the app is in the foreground too, not just when backgrounded.
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/**
 * Requests permission, grabs the device's Expo push token, and registers it
 * with the backend (see AuthController::registerPushToken). The backend's
 * PushGateway is a console/log stub for now (see App\Services\Push) — this
 * wires up the client side so a real provider can be dropped in later
 * without any app changes.
 */
export async function setUpPushNotifications() {
    if (!Device.isDevice) {
        return null; // Simulators/emulators can't receive real push tokens.
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;

    if (status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        status = requested.status;
    }

    if (status !== 'granted') {
        return null;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    const { data: pushToken } = await Notifications.getExpoPushTokenAsync();

    try {
        await registerPushToken(pushToken);
    } catch {
        // Non-fatal — the app still works without push, just without updates.
    }

    return pushToken;
}
