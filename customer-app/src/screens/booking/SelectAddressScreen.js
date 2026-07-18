import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAddresses } from '../../api/addresses';
import { apiErrorMessage } from '../../api/client';
import { useBooking } from '../../context/BookingContext';
import AddressForm from '../../components/AddressForm';
import Button from '../../components/Button';
import { colors } from '../../theme';
import { t } from '../../i18n';

export default function SelectAddressScreen({ navigation }) {
    const { addressId, setAddressId } = useBooking();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        fetchAddresses()
            .then(setAddresses)
            .catch((e) => setError(apiErrorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    if (loading) {
        return <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.primary} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('booking.selectAddress')}</Text>
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={addresses}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const selected = item.id === addressId;
                    return (
                        <Pressable
                            onPress={() => setAddressId(item.id)}
                            style={[styles.address, selected && styles.addressSelected]}
                        >
                            <Text style={[styles.addressLabel, selected && styles.textSelected]}>{item.label}</Text>
                            <Text style={[styles.addressMeta, selected && styles.textSelected]}>
                                {item.postcode} · {item.service_area?.name}
                            </Text>
                        </Pressable>
                    );
                }}
                ListFooterComponent={
                    <View style={{ marginTop: 12 }}>
                        {showForm ? (
                            <AddressForm onCreated={(address) => { setAddresses((a) => [...a, address]); setAddressId(address.id); setShowForm(false); }} />
                        ) : (
                            <Pressable onPress={() => setShowForm(true)}>
                                <Text style={styles.addNew}>+ {t('booking.addAddress')}</Text>
                            </Pressable>
                        )}
                    </View>
                }
            />

            <View style={styles.footer}>
                <Button
                    title={t('common.continue')}
                    onPress={() => navigation.navigate('BookingConfirm')}
                    disabled={!addressId}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    title: { fontSize: 20, fontWeight: '700', color: colors.text, padding: 16, paddingBottom: 8 },
    list: { paddingHorizontal: 16 },
    address: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 12, marginBottom: 8 },
    addressSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
    addressLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
    addressMeta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    textSelected: { color: '#fff' },
    addNew: { color: colors.accent, fontWeight: '600', textAlign: 'center', paddingVertical: 8 },
    footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
    error: { color: colors.danger, textAlign: 'center', marginBottom: 8 },
});
