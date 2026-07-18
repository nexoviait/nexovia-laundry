import { useCallback, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchOrder, cancelOrder, rateOrder } from '../api/orders';
import { apiErrorMessage } from '../api/client';
import { useCurrencyFormatter } from '../context/SettingsContext';
import Button from '../components/Button';
import StarRating from '../components/StarRating';
import { colors } from '../theme';
import { t } from '../i18n';

const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'assigned'];

function Section({ title, children }) {
    return (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

/** FR-CUS order timeline screen — full status history plus current order detail. */
export default function OrderDetailScreen({ route, navigation }) {
    const { orderId, placed } = route.params;
    const formatAmount = useCurrencyFormatter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [ratingStars, setRatingStars] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    const load = useCallback(async () => {
        try {
            setError(null);
            setOrder(await fetchOrder(orderId));
        } catch (e) {
            setError(apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    function confirmCancel() {
        Alert.alert(t('orders.cancelConfirm'), '', [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('orders.cancel'), style: 'destructive', onPress: doCancel },
        ]);
    }

    async function doCancel() {
        setCancelling(true);
        try {
            const updated = await cancelOrder(orderId);
            setOrder(updated);
        } catch (e) {
            setError(apiErrorMessage(e));
        } finally {
            setCancelling(false);
        }
    }

    async function submitRating() {
        setSubmittingRating(true);
        try {
            const updated = await rateOrder(orderId, { stars: ratingStars, comment: ratingComment.trim() || undefined });
            setOrder(updated);
        } catch (e) {
            setError(apiErrorMessage(e));
        } finally {
            setSubmittingRating(false);
        }
    }

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
    }

    if (!order) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    const canCancel = CANCELLABLE_STATUSES.includes(order.status);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {placed && <Text style={styles.success}>{t('booking.success')}</Text>}
            {error && <Text style={styles.error}>{error}</Text>}

            <Text style={styles.title}>Order #{order.id}</Text>
            <Text style={styles.currentStatus}>{t(`status.${order.status}`)}</Text>

            <Section title={t('orders.timeline')}>
                {order.status_histories?.map((h) => (
                    <View key={h.id} style={styles.timelineRow}>
                        <View style={styles.timelineDot} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.timelineStatus}>{t(`status.${h.status}`)}</Text>
                            <Text style={styles.timelineDate}>{new Date(h.created_at).toLocaleString()}</Text>
                        </View>
                    </View>
                ))}
            </Section>

            <Section title="Items">
                {order.items?.map((item) => (
                    <View key={item.id} style={styles.line}>
                        <Text style={styles.lineText}>{item.service?.name} × {item.qty}</Text>
                        <Text style={styles.lineText}>{formatAmount(item.line_total)}</Text>
                    </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.line}>
                    <Text style={[styles.lineText, styles.bold]}>{t('booking.total')}</Text>
                    <Text style={[styles.lineText, styles.bold]}>{formatAmount(order.total)}</Text>
                </View>
            </Section>

            <Section title="Delivery address">
                <Text style={styles.lineText}>{order.address?.label} — {order.address?.postcode}</Text>
                {order.note && <Text style={styles.note}>Note: {order.note}</Text>}
            </Section>

            {order.status === 'delivered' && (
                <Section title={t('orders.rate')}>
                    {order.rating ? (
                        <>
                            <StarRating value={order.rating.stars} onChange={() => {}} size={22} />
                            {order.rating.comment && <Text style={styles.note}>{order.rating.comment}</Text>}
                        </>
                    ) : (
                        <>
                            <StarRating value={ratingStars} onChange={setRatingStars} />
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Add a comment (optional)"
                                value={ratingComment}
                                onChangeText={setRatingComment}
                                multiline
                            />
                            <View style={{ marginTop: 10 }}>
                                <Button
                                    title={t('orders.rate')}
                                    onPress={submitRating}
                                    loading={submittingRating}
                                    disabled={ratingStars === 0}
                                />
                            </View>
                        </>
                    )}
                </Section>
            )}

            {canCancel && (
                <View style={{ marginTop: 16 }}>
                    <Button title={t('orders.cancel')} variant="danger" onPress={confirmCancel} loading={cancelling} />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surfaceMuted },
    content: { padding: 16 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: '700', color: colors.text },
    currentStatus: { fontSize: 15, color: colors.accent, fontWeight: '600', marginBottom: 16 },
    card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 },
    timelineRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 5 },
    timelineStatus: { fontSize: 14, fontWeight: '600', color: colors.text },
    timelineDate: { fontSize: 12, color: colors.textMuted },
    line: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    lineText: { fontSize: 14, color: colors.text },
    commentInput: {
        marginTop: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
        padding: 10, fontSize: 14, minHeight: 60, textAlignVertical: 'top',
    },
    bold: { fontWeight: '700' },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
    note: { fontSize: 13, color: colors.textMuted, marginTop: 6, fontStyle: 'italic' },
    success: {
        color: colors.success, backgroundColor: colors.successBg, padding: 10, borderRadius: 8,
        marginBottom: 12, textAlign: 'center',
    },
    error: { color: colors.danger, textAlign: 'center', marginBottom: 12 },
});
