import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { reportFailure } from '../api/tasks';
import { apiErrorMessage } from '../api/client';
import Button from '../components/Button';
import { colors } from '../theme';

const COMMON_REASONS = [
    'Customer not home',
    'Access denied / gated property',
    'Wrong address',
    'Customer refused',
    'Vehicle breakdown',
];

/** FR-RID-008: failed pickup/delivery reporting with a reason. */
export default function FailTaskScreen({ route, navigation }) {
    const { taskId } = route.params;
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    async function submit() {
        if (!reason.trim()) return;
        setError(null);
        setSubmitting(true);
        try {
            await reportFailure(taskId, reason.trim());
            navigation.navigate('TaskDetail', { taskId });
        } catch (e) {
            setError(apiErrorMessage(e, 'Could not report the failure.'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Report a problem</Text>
            <Text style={styles.subtitle}>This will flag the task for the office to follow up.</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.chips}>
                {COMMON_REASONS.map((r) => (
                    <Pressable key={r} style={styles.chip} onPress={() => setReason(r)}>
                        <Text style={styles.chipText}>{r}</Text>
                    </Pressable>
                ))}
            </View>

            <Text style={styles.label}>Reason</Text>
            <TextInput
                style={styles.input}
                placeholder="Describe what happened"
                multiline
                numberOfLines={4}
                value={reason}
                onChangeText={setReason}
            />

            <View style={{ marginTop: 24 }}>
                <Button
                    title="Report failure"
                    variant="danger"
                    onPress={submit}
                    loading={submitting}
                    disabled={!reason.trim() || submitting}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface, padding: 16 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    chipText: { fontSize: 13, color: colors.text },
    label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
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
