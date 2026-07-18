import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { fetchServices } from '../../api/catalogue';
import { apiErrorMessage } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import { useCurrencyFormatter } from '../../context/SettingsContext';
import Button from '../../components/Button';
import { colors } from '../../theme';
import { t } from '../../i18n';

function Stepper({ qty, onChange }) {
    return (
        <View style={styles.stepper}>
            <Pressable style={styles.stepperBtn} onPress={() => onChange(Math.max(0, qty - 1))}>
                <Text style={styles.stepperBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{qty}</Text>
            <Pressable style={styles.stepperBtn} onPress={() => onChange(qty + 1)}>
                <Text style={styles.stepperBtnText}>+</Text>
            </Pressable>
        </View>
    );
}

export default function SelectServicesScreen({ navigation }) {
    const { items, setQty } = useBooking();
    const formatAmount = useCurrencyFormatter();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchServices()
            .then(setServices)
            .catch((e) => setError(apiErrorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    function qtyFor(serviceId) {
        return items.find((i) => i.service_id === serviceId)?.qty || 0;
    }

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('booking.selectServices')}</Text>
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={services}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowName}>{item.name}</Text>
                            <Text style={styles.rowPrice}>{formatAmount(item.price)} / {item.unit}</Text>
                        </View>
                        <Stepper qty={qtyFor(item.id)} onChange={(qty) => setQty(item, qty)} />
                    </View>
                )}
            />

            <View style={styles.footer}>
                {items.length === 0 && <Text style={styles.hint}>{t('booking.emptyBasket')}</Text>}
                <Button
                    title={t('common.continue')}
                    onPress={() => navigation.navigate('BookingSelectSlot')}
                    disabled={items.length === 0}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, padding: 16, paddingBottom: 8 },
    list: { paddingHorizontal: 16 },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    rowName: { fontSize: 16, fontWeight: '500', color: colors.text },
    rowPrice: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    stepper: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    stepperBtn: {
        width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceMuted,
        alignItems: 'center', justifyContent: 'center',
    },
    stepperBtnText: { fontSize: 18, fontWeight: '700', color: colors.text },
    stepperValue: { fontSize: 16, fontWeight: '600', minWidth: 20, textAlign: 'center', color: colors.text },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    hint: { textAlign: 'center', color: colors.textMuted, marginBottom: 10 },
    error: { color: colors.danger, textAlign: 'center', marginBottom: 8 },
});
