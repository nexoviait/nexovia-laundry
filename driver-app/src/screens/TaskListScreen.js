import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTodaysTasks } from '../api/tasks';
import { apiErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const STATUS_LABELS = {
    pending: 'Pending',
    en_route: 'En route',
    completed: 'Done',
    failed: 'Failed',
};

function TaskCard({ task, onPress }) {
    const order = task.order;
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={styles.cardHeader}>
                <Text style={styles.type}>{task.type === 'pickup' ? '📦 Pickup' : '🚚 Delivery'}</Text>
                <Text style={[styles.status, styles[`status_${task.status}`]]}>
                    {STATUS_LABELS[task.status] || task.status}
                </Text>
            </View>
            <Text style={styles.customer}>{order?.user?.name} — Order #{order?.id}</Text>
            <Text style={styles.meta}>
                {order?.time_slot ? `${order.time_slot.date} · ${order.time_slot.window}` : 'No time slot'}
            </Text>
            <Text style={styles.meta}>{order?.address?.service_area?.name} · {order?.address?.postcode}</Text>
        </Pressable>
    );
}

export default function TaskListScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setError(null);
            setTasks(await fetchTodaysTasks());
        } catch (e) {
            setError(apiErrorMessage(e, 'Could not load today’s tasks.'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    async function onRefresh() {
        setRefreshing(true);
        load();
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Today’s tasks</Text>
                    <Text style={styles.headerSubtitle}>{user?.name}</Text>
                </View>
                <Pressable onPress={logout}>
                    <Text style={styles.logout}>Log out</Text>
                </Pressable>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={tasks}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                renderItem={({ item }) => (
                    <TaskCard task={item} onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })} />
                )}
                ListEmptyComponent={
                    !loading && (
                        <Text style={styles.empty}>No tasks scheduled for today.</Text>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surfaceMuted },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    headerSubtitle: { fontSize: 13, color: colors.textMuted },
    logout: { color: colors.danger, fontWeight: '600' },
    list: { padding: 16, gap: 12 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    type: { fontSize: 16, fontWeight: '600', color: colors.text },
    status: { fontSize: 12, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    status_pending: { backgroundColor: '#e2e8f0', color: '#334155' },
    status_en_route: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    status_completed: { backgroundColor: colors.successBg, color: colors.success },
    status_failed: { backgroundColor: colors.dangerBg, color: colors.danger },
    customer: { fontSize: 15, fontWeight: '500', color: colors.text },
    meta: { fontSize: 13, color: colors.textMuted },
    empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
    error: {
        color: colors.danger,
        backgroundColor: colors.dangerBg,
        margin: 16,
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
    },
});
