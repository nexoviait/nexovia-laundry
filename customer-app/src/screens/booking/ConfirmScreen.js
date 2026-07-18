import { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { estimatePrice, createOrder } from '../../api/orders';
import { apiErrorMessage } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import { useCurrencyFormatter } from '../../context/SettingsContext';
import Button from '../../components/Button';
import { colors } from '../../theme';
import { t } from '../../i18n';

function Line({ label, value, bold }) {
    return (
        <View style={styles.line}>
            <Text style={[styles.lineLabel, bold && styles.bold]}>{label}</Text>
            <Text style={[styles.lineValue, bold && styles.bold]}>{value}</Text>
        </View>
    );
}

/** FR-CUS booking flow, final step: note + review + confirm (REQ-CUST-06/08). */
export default function ConfirmScreen({ navigation }) {
    const { items, addressId, timeSlotId, note, setNote, reset } = useBooking();
    const formatAmount = useCurrencyFormatter();
    const [estimate, setEstimate] = useState(null);
    const [loadingEstimate, setLoadingEstimate] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        estimatePrice(items.map((i) => ({ service_id: i.service_id, qty: i.qty })))
            .then(setEstimate)
            .catch((e) => setError(apiErrorMessage(e)))
            .finally(() => setLoadingEstimate(false));
    }, []);

    async function placeOrder() {
        setError(null);
        setSubmitting(true);
        try {
            const order = await createOrder({
                addressId,
                timeSlotId,
                note: note.trim() || undefined,
                items: items.map((i) => ({ service_id: i.service_id, qty: i.qty })),
            });
            reset();
            navigation.replace('OrderDetail', { orderId: order.id, placed: true });
        } catch (e) {
            const message = e?.response?.data?.errors?.time_slot_id?.[0]
                ? t('booking.slotFull')
                : apiErrorMessage(e);
            setError(message);
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingEstimate) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{t('booking.review')}</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.card}>
                {items.map((item) => (
                    <Line key={item.service_id} label={`${item.name} × ${item.qty}`} value={formatAmount(item.price * item.qty)} />
                ))}
                <View style={styles.divider} />
                <Line label={t('booking.subtotal')} value={formatAmount(estimate?.subtotal)} />
                <Line label={t('booking.deliveryFee')} value={formatAmount(estimate?.delivery_fee)} />
                <Line label={t('booking.vat')} value={formatAmount(estimate?.vat)} />
                <View style={styles.divider} />
                <Line label={t('booking.total')} value={formatAmount(estimate?.total)} bold />
            </View>

            <Text style={styles.label}>{t('booking.note')}</Text>
            <TextInput
                style={styles.input}
                placeholder={t('booking.notePlaceholder')}
                multiline
                numberOfLines={3}
                value={note}
                onChangeText={setNote}
            />

            <View style={{ marginTop: 20 }}>
                <Button title={t('booking.placeOrder')} onPress={placeOrder} loading={submitting} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: 16 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 },
    card: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, gap: 6 },
    line: { flexDirection: 'row', justifyContent: 'space-between' },
    lineLabel: { color: colors.textMuted, fontSize: 14 },
    lineValue: { color: colors.text, fontSize: 14 },
    bold: { fontWeight: '700', color: colors.text, fontSize: 16 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginTop: 20, marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        textAlignVertical: 'top',
        minHeight: 80,
    },
    error: {
        color: colors.danger,
        backgroundColor: colors.dangerBg,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        textAlign: 'center',
    },
});
