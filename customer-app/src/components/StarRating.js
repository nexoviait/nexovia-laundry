import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function StarRating({ value, onChange, size = 32 }) {
    return (
        <View style={styles.row}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
                    <Text style={{ fontSize: size, color: star <= value ? '#f59e0b' : colors.border }}>★</Text>
                </Pressable>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 6 },
});
