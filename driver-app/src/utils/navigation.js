import { Platform, Linking } from 'react-native';

/** FR-RID-003: hand the address's map pin off to the device's native navigation app. */
export async function openNavigationTo(lat, lng, label = 'Destination') {
    if (!lat || !lng) return false;

    const encodedLabel = encodeURIComponent(label);
    const scheme = Platform.select({
        ios: `maps:0,0?q=${encodedLabel}@${lat},${lng}`,
        android: `geo:0,0?q=${lat},${lng}(${encodedLabel})`,
    });
    const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    const canOpenNative = scheme && (await Linking.canOpenURL(scheme));
    await Linking.openURL(canOpenNative ? scheme : webFallback);
    return true;
}
