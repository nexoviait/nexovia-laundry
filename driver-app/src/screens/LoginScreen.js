import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../api/client';
import Button from '../components/Button';
import { colors } from '../theme';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function submit() {
        setError(null);
        setLoading(true);
        try {
            await login(email.trim(), password);
        } catch (e) {
            setError(apiErrorMessage(e, 'Could not sign in. Check your credentials.'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text style={styles.title}>Clean Quick Laundry</Text>
            <Text style={styles.subtitle}>Driver sign in</Text>

            {error && <Text style={styles.error}>{error}</Text>}

            <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Sign in" onPress={submit} loading={loading} disabled={!email || !password} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.surface },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center' },
    subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 24 },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 12,
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
