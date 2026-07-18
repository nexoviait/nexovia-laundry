import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../context/AuthContext';
import { setUpPushNotifications } from '../notifications';
import Button from '../components/Button';
import { colors } from '../theme';
import { t } from '../i18n';

export default function ProfileScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        Notifications.getPermissionsAsync().then(({ status }) => setNotificationsEnabled(status === 'granted'));
    }, []);

    async function toggleNotifications(value) {
        if (value) {
            const token = await setUpPushNotifications();
            setNotificationsEnabled(!!token);
        } else {
            setNotificationsEnabled(false); // Revoking OS permission has to happen in device Settings.
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('profile.title')}</Text>

            <View style={styles.card}>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.meta}>{user?.phone}</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.notifRow}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={styles.notifTitle}>{t('profile.notifications')}</Text>
                        <Text style={styles.notifHint}>{t('profile.notificationsHint')}</Text>
                    </View>
                    <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
                </View>
            </View>

            <Pressable style={styles.link} onPress={() => navigation.navigate('Addresses')}>
                <Text style={styles.linkText}>{t('addresses.title')}</Text>
            </Pressable>

            <View style={{ marginTop: 24 }}>
                <Button title={t('profile.logout')} variant="secondary" onPress={logout} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16 },
    card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, marginBottom: 12 },
    name: { fontSize: 17, fontWeight: '600', color: colors.text },
    meta: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
    notifRow: { flexDirection: 'row', alignItems: 'center' },
    notifTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
    notifHint: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    link: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    linkText: { fontSize: 15, color: colors.accent, fontWeight: '600' },
});
