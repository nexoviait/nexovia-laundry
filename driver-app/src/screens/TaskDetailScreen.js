import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTask, startDelivery } from '../api/tasks';
import { apiErrorMessage } from '../api/client';
import { openNavigationTo } from '../utils/navigation';
import Button from '../components/Button';
import { colors } from '../theme';

function Row({ label, value }) {
    if (!value) return null;
    return (
        <View style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
        </View>
    );
}

export default function TaskDetailScreen({ route, navigation }) {
    const { taskId } = route.params;
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startingDelivery, setStartingDelivery] = useState(false);

    const load = useCallback(async () => {
        try {
            setError(null);
            setTask(await fetchTask(taskId));
        } catch (e) {
            setError(apiErrorMessage(e, 'Could not load this task.'));
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !task) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error || 'Task not found.'}</Text>
            </View>
        );
    }

    const order = task.order;
    const address = order?.address;

    async function handleNavigate() {
        const opened = await openNavigationTo(address?.map_lat, address?.map_lng, address?.label);
        if (!opened) {
            setError('No map coordinates saved for this address.');
        }
    }

    async function handleStartDelivery() {
        setStartingDelivery(true);
        try {
            const updated = await startDelivery(task.id);
            setTask(updated);
        } catch (e) {
            setError(apiErrorMessage(e, 'Could not start the delivery run.'));
        } finally {
            setStartingDelivery(false);
        }
    }

    const isDone = task.status === 'completed' || task.status === 'failed';
    const canPickup = task.type === 'pickup' && task.status === 'pending';
    const canStartDelivery = task.type === 'delivery' && task.status === 'pending' && order?.status === 'ready';
    const canDeliver = task.type === 'delivery' && task.status === 'en_route';
    const canReportFailure = !isDone;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{task.type === 'pickup' ? 'Pickup' : 'Delivery'} — Order #{order?.id}</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <Row label="Name" value={order?.user?.name} />
                <Row label="Phone" value={order?.user?.phone} />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Address</Text>
                <Row label="Label" value={address?.label} />
                <Row label="Postcode" value={address?.postcode} />
                <Row label="Area" value={address?.service_area?.name} />
                <Row label="Directions" value={address?.directions} />
                <View style={{ marginTop: 8 }}>
                    <Button title="Open in Maps" variant="secondary" onPress={handleNavigate} />
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Slot</Text>
                <Row label="Date" value={order?.time_slot?.date} />
                <Row label="Window" value={order?.time_slot?.window} />
            </View>

            {order?.items?.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Items</Text>
                    {order.items.map((item) => (
                        <Row key={item.id} label={item.service?.name} value={`× ${item.qty}`} />
                    ))}
                </View>
            )}

            <View style={{ gap: 10, marginTop: 8 }}>
                {canPickup && (
                    <Button title="Record pickup" onPress={() => navigation.navigate('Pickup', { taskId: task.id })} />
                )}
                {canStartDelivery && (
                    <Button title="Start delivery run" onPress={handleStartDelivery} loading={startingDelivery} />
                )}
                {task.type === 'delivery' && task.status === 'pending' && order?.status !== 'ready' && (
                    <Text style={styles.hint}>Waiting for this order to be marked ready before delivery can start.</Text>
                )}
                {canDeliver && (
                    <Button title="Confirm delivery" onPress={() => navigation.navigate('Delivery', { taskId: task.id })} />
                )}
                {canReportFailure && (
                    <Button
                        title={`Report failed ${task.type}`}
                        variant="danger"
                        onPress={() => navigation.navigate('FailTask', { taskId: task.id })}
                    />
                )}
                {task.status === 'completed' && <Text style={styles.hint}>This task is complete.</Text>}
                {task.status === 'failed' && <Text style={styles.hint}>Reported failed: {task.failure_reason}</Text>}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surfaceMuted },
    content: { padding: 16, gap: 12 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 4,
    },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    rowLabel: { color: colors.textMuted, fontSize: 14 },
    rowValue: { color: colors.text, fontSize: 14, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
    hint: { textAlign: 'center', color: colors.textMuted, fontSize: 13 },
    error: {
        color: colors.danger,
        backgroundColor: colors.dangerBg,
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
    },
});
