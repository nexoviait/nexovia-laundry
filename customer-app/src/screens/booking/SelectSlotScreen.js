import { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { fetchTimeSlots } from '../../api/catalogue';
import { apiErrorMessage } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import Button from '../../components/Button';
import { colors } from '../../theme';
import { t } from '../../i18n';

export default function SelectSlotScreen({ navigation }) {
    const { timeSlotId, setTimeSlotId } = useBooking();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTimeSlots()
            .then(setSlots)
            .catch((e) => setError(apiErrorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
    }

    const sections = Object.values(
        slots.reduce((acc, slot) => {
            acc[slot.date] = acc[slot.date] || { title: slot.date, data: [] };
            acc[slot.date].data.push(slot);
            return acc;
        }, {})
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('booking.selectSlot')}</Text>
            {error && <Text style={styles.error}>{error}</Text>}

            <SectionList
                sections={sections}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                renderItem={({ item }) => {
                    const full = item.available === 0;
                    const selected = item.id === timeSlotId;
                    return (
                        <Pressable
                            disabled={full}
                            onPress={() => setTimeSlotId(item.id)}
                            style={[styles.slot, selected && styles.slotSelected, full && styles.slotFull]}
                        >
                            <Text style={[styles.slotText, selected && styles.slotTextSelected]}>
                                {item.window} · {item.service_area?.name}
                            </Text>
                            <Text style={[styles.slotAvailability, selected && styles.slotTextSelected]}>
                                {full ? 'Full' : `${item.available} left`}
                            </Text>
                        </Pressable>
                    );
                }}
            />

            <View style={styles.footer}>
                <Button
                    title={t('common.continue')}
                    onPress={() => navigation.navigate('BookingSelectAddress')}
                    disabled={!timeSlotId}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, padding: 16, paddingBottom: 8 },
    list: { paddingHorizontal: 16 },
    sectionHeader: {
        fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase',
        marginTop: 14, marginBottom: 6,
    },
    slot: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 8,
    },
    slotSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    slotFull: { opacity: 0.4 },
    slotText: { fontSize: 15, color: colors.text, fontWeight: '500' },
    slotTextSelected: { color: '#fff' },
    slotAvailability: { fontSize: 12, color: colors.textMuted },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    error: { color: colors.danger, textAlign: 'center', marginBottom: 8 },
});
