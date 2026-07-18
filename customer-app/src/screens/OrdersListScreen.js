import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchOrders } from '../api/orders';
import { apiErrorMessage } from '../api/client';
import { useCurrencyFormatter } from '../context/SettingsContext';
import { useBooking } from '../context/BookingContext';
import { colors } from '../theme';
import { t } from '../i18n';

function OrderCard({ order, formatAmount, onPress, onReorder }) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderNumber}>Order #{order.id}</Text>
                <Text style={styles.total}>{formatAmount(order.total)}</Text>
            </View>
            <Text style={styles.status}>{t(`status.${order.status}`)}</Text>
            <Text style={styles.meta}>
                {order.time_slot ? `${order.time_slot.date} · ${order.time_slot.window}` : ''}
            </Text>
            <Pressable style={styles.reorder} onPress={onReorder}>
                <Text style={styles.reorderText}>{t('orders.reorder')}</Text>
            </Pressable>
        </Pressable>
    );
}

export default function OrdersListScreen({ navigation }) {
    const formatAmount = useCurrencyFormatter();
    const { startReorder } = useBooking();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setError(null);
            setOrders(await fetchOrders());
        } catch (e) {
            setError(apiErrorMessage(e));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    function reorder(order) {
        startReorder(order);
        navigation.navigate('BookingSelectSlot');
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('orders.title')}</Text>
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={orders}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        formatAmount={formatAmount}
                        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
                        onReorder={() => reorder(item)}
                    />
                )}
                ListEmptyComponent={!loading && <Text style={styles.empty}>{t('orders.empty')}</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surfaceMuted },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, padding: 16, backgroundColor: colors.surface },
    list: { padding: 16, gap: 12 },
    card: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 4 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    orderNumber: { fontSize: 16, fontWeight: '700', color: colors.text },
    total: { fontSize: 16, fontWeight: '700', color: colors.text },
    status: { fontSize: 13, color: colors.accent, fontWeight: '600' },
    meta: { fontSize: 13, color: colors.textMuted },
    reorder: { marginTop: 8, alignSelf: 'flex-start' },
    reorderText: { color: colors.accent, fontWeight: '600', fontSize: 13 },
    empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
    error: { color: colors.danger, textAlign: 'center', margin: 16 },
});
