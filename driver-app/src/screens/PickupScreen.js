import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { submitPickup } from '../api/tasks';
import { apiErrorMessage } from '../api/client';
import PhotoPicker from '../components/PhotoPicker';
import Button from '../components/Button';
import { colors } from '../theme';

/** FR-RID-004: the pickup flow — item count, weight, 1-4 photos, confirm. */
export default function PickupScreen({ route, navigation }) {
    const { taskId } = route.params;
    const [itemCount, setItemCount] = useState('');
    const [weight, setWeight] = useState('');
    const [photos, setPhotos] = useState([]);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = Number(itemCount) > 0 && photos.length >= 1 && !submitting;

    async function submit() {
        setError(null);
        setSubmitting(true);
        try {
            await submitPickup(taskId, { itemCount: Number(itemCount), weight: weight ? Number(weight) : null, photos });
            navigation.navigate('TaskDetail', { taskId });
        } catch (e) {
            setError(apiErrorMessage(e, 'Could not record the pickup.'));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Confirm pickup</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <Text style={styles.label}>Item count</Text>
            <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="e.g. 6"
                value={itemCount}
                onChangeText={setItemCount}
            />

            <Text style={styles.label}>Weight (kg, optional)</Text>
            <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="e.g. 3.4"
                value={weight}
                onChangeText={setWeight}
            />

            <Text style={styles.label}>Photos (1-4)</Text>
            <PhotoPicker photos={photos} onChange={setPhotos} />

            <View style={{ marginTop: 24 }}>
                <Button title="Confirm pickup" onPress={submit} loading={submitting} disabled={!canSubmit} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    content: { padding: 16 },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6, marginTop: 14 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
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
