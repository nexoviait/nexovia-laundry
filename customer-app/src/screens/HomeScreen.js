import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchServices } from '../api/catalogue';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCurrencyFormatter } from '../context/SettingsContext';
import { useBooking } from '../context/BookingContext';
import Button from '../components/Button';
import { colors } from '../theme';
import { t } from '../i18n';

function ServiceRow({ service, formatAmount }) {
    return (
        <View style={styles.row}>
            <View>
                <Text style={styles.rowName}>{service.name}</Text>
                <Text style={styles.rowUnit}>{t('home.perUnit', { unit: service.unit })}</Text>
            </View>
            <Text style={styles.rowPrice}>{formatAmount(service.price)}</Text>
        </View>
    );
}

export default function HomeScreen({ navigation }) {
    const { user } = useAuth();
    const { reset } = useBooking();
    const formatAmount = useCurrencyFormatter();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setError(null);
            setServices(await fetchServices());
        } catch (e) {
            setError(apiErrorMessage(e));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    function startBooking() {
        reset();
        navigation.navigate('BookingSelectServices');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>{t('home.greeting', { name: user?.name?.split(' ')[0] || '' })}</Text>

            <View style={{ paddingHorizontal: 16 }}>
                <Button title={t('home.bookNow')} onPress={startBooking} />
            </View>

            <Text style={styles.sectionTitle}>{t('home.servicesTitle')}</Text>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 24 }} size="large" color={colors.primary} />
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
                    renderItem={({ item }) => <ServiceRow service={item} formatAmount={formatAmount} />}
                    ListEmptyComponent={error && <Text style={styles.error}>{error}</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    greeting: { fontSize: 22, fontWeight: '700', color: colors.text, padding: 16, paddingBottom: 8 },
    sectionTitle: {
        fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase',
        paddingHorizontal: 16, marginTop: 20, marginBottom: 4,
    },
    list: { paddingHorizontal: 16, paddingBottom: 24 },
    row: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    rowName: { fontSize: 16, fontWeight: '500', color: colors.text },
    rowUnit: { fontSize: 12, color: colors.textMuted },
    rowPrice: { fontSize: 16, fontWeight: '700', color: colors.text },
    error: { color: colors.danger, textAlign: 'center', marginTop: 24 },
});
