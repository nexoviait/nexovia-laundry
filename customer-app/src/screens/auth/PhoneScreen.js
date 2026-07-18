import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { requestOtp } from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import Button from '../../components/Button';
import { colors } from '../../theme';
import { t } from '../../i18n';

/** FR-CUS-001: phone OTP onboarding, step 1 — request a code. */
export default function PhoneScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function submit() {
        setError(null);
        setLoading(true);
        try {
            await requestOtp(phone.trim());
            navigation.navigate('OtpVerify', { phone: phone.trim() });
        } catch (e) {
            setError(apiErrorMessage(e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={styles.title}>{t('auth.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.phonePrompt')}</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <TextInput
                style={styles.input}
                placeholder={t('auth.phonePlaceholder')}
                keyboardType="phone-pad"
                autoFocus
                value={phone}
                onChangeText={setPhone}
            />

            <Button title={t('auth.sendCode')} onPress={submit} loading={loading} disabled={phone.trim().length < 7} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.surface },
    title: { fontSize: 24, fontWeight: '700', color: colors.text, textAlign: 'center' },
    subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 24, marginTop: 4 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 16,
        fontSize: 18,
        textAlign: 'center',
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
