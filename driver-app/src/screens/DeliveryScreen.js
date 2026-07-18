import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { submitDelivery } from '../api/tasks';
import { apiErrorMessage } from '../api/client';
import Button from '../components/Button';
import { colors } from '../theme';

/** FR-RID-006/007: delivery handover — customer OTP + cash-on-delivery recording. */
export default function DeliveryScreen({ route, navigation }) {
    const { taskId } = route.params;
    const [otp, setOtp] = useState('');
    const [paidCash, setPaidCash] = useState(true);
    const [codAmount, setCodAmount] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = otp.length === 4 && (!paidCash || Number(codAmount) >= 0) && !submitting;

    async function submit() {
        setError(null);
        setSubmitting(true);
        try {
            await submitDelivery(taskId, {
                otp,
                paymentMethod: 'cash',
                codAmount: paidCash ? Number(codAmount) : 0,
            });
            navigation.navigate('TaskDetail', { taskId });
        } catch (e) {
            setError(apiErrorMessage(e, 'Could not confirm the delivery.'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Confirm delivery</Text>
            <Text style={styles.subtitle}>Ask the customer for the 4-digit code sent to their phone.</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <Text style={styles.label}>Handover code</Text>
            <TextInput
                style={[styles.input, styles.otpInput]}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="0000"
                value={otp}
                onChangeText={setOtp}
            />

            <Text style={styles.label}>Cash on delivery</Text>
            <View style={styles.toggleRow}>
                <Pressable
                    style={[styles.toggle, paidCash && styles.toggleActive]}
                    onPress={() => setPaidCash(true)}
                >
                    <Text style={[styles.toggleText, paidCash && styles.toggleTextActive]}>Cash collected</Text>
                </Pressable>
                <Pressable
                    style={[styles.toggle, !paidCash && styles.toggleActive]}
                    onPress={() => setPaidCash(false)}
                >
                    <Text style={[styles.toggleText, !paidCash && styles.toggleTextActive]}>No payment due</Text>
                </Pressable>
            </View>

            {paidCash && (
                <>
                    <Text style={styles.label}>Amount collected (£)</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        value={codAmount}
                        onChangeText={setCodAmount}
                    />
                </>
            )}

            <View style={{ marginTop: 24 }}>
                <Button title="Confirm delivery" onPress={submit} loading={submitting} disabled={!canSubmit} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: 16 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6, marginTop: 14 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    otpInput: { fontSize: 28, letterSpacing: 8, textAlign: 'center', fontWeight: '700' },
    toggleRow: { flexDirection: 'row', gap: 10 },
    toggle: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    toggleText: { color: colors.text, fontWeight: '600' },
    toggleTextActive: { color: '#fff' },
    error: {
        color: colors.danger,
        backgroundColor: colors.dangerBg,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        textAlign: 'center',
    },
});
