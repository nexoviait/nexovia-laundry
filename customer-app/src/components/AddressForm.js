import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { createAddress } from '../api/addresses';
import { apiErrorMessage, isOutOfAreaError } from '../api/client';
import Button from './Button';
import { colors } from '../theme';
import { t } from '../i18n';

/** Shared by the booking flow and the addresses management screen (FR-CUS-002/028 area gating). */
export default function AddressForm({ onCreated }) {
    const [label, setLabel] = useState('');
    const [postcode, setPostcode] = useState('');
    const [directions, setDirections] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    async function submit() {
        setError(null);
        setSubmitting(true);
        try {
            const address = await createAddress({ label: label.trim(), postcode: postcode.trim(), directions: directions.trim() || undefined });
            setLabel('');
            setPostcode('');
            setDirections('');
            onCreated(address);
        } catch (e) {
            setError(isOutOfAreaError(e) ? t('booking.outOfArea') : apiErrorMessage(e));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <View style={styles.form}>
            {error && <Text style={styles.error}>{error}</Text>}
            <TextInput style={styles.input} placeholder={t('addresses.label')} value={label} onChangeText={setLabel} />
            <TextInput
                style={styles.input}
                placeholder={t('addresses.postcode')}
                autoCapitalize="characters"
                value={postcode}
                onChangeText={setPostcode}
            />
            <TextInput
                style={styles.input}
                placeholder={t('addresses.directions')}
                value={directions}
                onChangeText={setDirections}
            />
            <Button
                title={t('addresses.add')}
                onPress={submit}
                loading={submitting}
                disabled={!label.trim() || !postcode.trim()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    form: { gap: 10 },
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
        textAlign: 'center',
    },
});
