import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { verifyOtp, requestOtp } from '../../api/auth';
import { apiErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import { colors } from '../../theme';
import { t } from '../../i18n';

/** FR-CUS-001: phone OTP onboarding, step 2 — verify the code (creates the account on first use). */
export default function OtpVerifyScreen({ route }) {
    const { phone } = route.params;
    const { signIn } = useAuth();
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    async function submit() {
        setError(null);
        setLoading(true);
        try {
            const user = await verifyOtp(phone, otp, name.trim() || undefined);
            signIn(user);
        } catch (e) {
            setError(apiErrorMessage(e, t('auth.invalidCode')));
        } finally {
            setLoading(false);
        }
    }

    async function resend() {
        setResending(true);
        setError(null);
        try {
            await requestOtp(phone);
        } catch (e) {
            setError(apiErrorMessage(e));
        } finally {
            setResending(false);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Text style={styles.title}>{t('auth.codePrompt', { phone })}</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder={t('auth.codePlaceholder')}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                value={otp}
                onChangeText={setOtp}
            />

            <TextInput
                style={styles.input}
                placeholder={t('auth.namePlaceholder')}
                value={name}
                onChangeText={setName}
            />

            <Button title={t('auth.verify')} onPress={submit} loading={loading} disabled={otp.length !== 6} />

            <Pressable onPress={resend} disabled={resending} style={styles.resend}>
                <Text style={styles.resendText}>{t('auth.resendCode')}</Text>
            </Pressable>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.surface },
    title: { fontSize: 17, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    otpInput: { fontSize: 26, letterSpacing: 6, textAlign: 'center', fontWeight: '700' },
    resend: { marginTop: 16, alignItems: 'center' },
    resendText: { color: colors.accent, fontWeight: '600' },
    error: {
        color: colors.danger,
        backgroundColor: colors.dangerBg,
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
        textAlign: 'center',
    },
});
