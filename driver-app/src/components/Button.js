import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme';

export default function Button({ title, onPress, variant = 'primary', loading = false, disabled = false }) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            style={({ pressed }) => [
                styles.base,
                variant === 'danger' && styles.danger,
                variant === 'secondary' && styles.secondary,
                isDisabled && styles.disabled,
                pressed && !isDisabled && styles.pressed,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'secondary' ? colors.text : '#fff'} />
            ) : (
                <Text style={[styles.text, variant === 'secondary' && styles.textSecondary]}>{title}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    danger: { backgroundColor: colors.danger },
    secondary: { backgroundColor: colors.surfaceMuted },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
    text: { color: '#fff', fontSize: 16, fontWeight: '600' },
    textSecondary: { color: colors.text },
});
