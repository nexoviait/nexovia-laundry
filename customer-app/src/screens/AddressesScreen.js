import { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchAddresses, deleteAddress } from '../api/addresses';
import { apiErrorMessage } from '../api/client';
import AddressForm from '../components/AddressForm';
import { colors } from '../theme';
import { t } from '../i18n';

export default function AddressesScreen() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(() => {
        fetchAddresses()
            .then(setAddresses)
            .catch((e) => setError(apiErrorMessage(e)))
            .finally(() => setLoading(false));
    }, []);

    useFocusEffect(useCallback(() => { load(); }, [load]));

    function confirmDelete(address) {
        Alert.alert(t('addresses.deleteConfirm'), '', [
            { text: t('common.cancel'), style: 'cancel' },
            {
                text: t('addresses.delete'),
                style: 'destructive',
                onPress: async () => {
                    await deleteAddress(address.id);
                    setAddresses((current) => current.filter((a) => a.id !== address.id));
                },
            },
        ]);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{t('addresses.title')}</Text>
            {error && <Text style={styles.error}>{error}</Text>}

            <FlatList
                data={addresses}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.rowLabel}>{item.label}</Text>
                            <Text style={styles.rowMeta}>{item.postcode} · {item.service_area?.name}</Text>
                        </View>
                        <Pressable onPress={() => confirmDelete(item)}>
                            <Text style={styles.delete}>{t('addresses.delete')}</Text>
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={!loading && <Text style={styles.empty}>{t('addresses.empty')}</Text>}
                ListFooterComponent={
                    <View style={{ marginTop: 16 }}>
                        <AddressForm onCreated={(address) => setAddresses((a) => [...a, address])} />
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.surface },
    title: { fontSize: 22, fontWeight: '700', color: colors.text, padding: 16, paddingBottom: 8 },
    list: { paddingHorizontal: 16, paddingBottom: 24 },
    row: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    rowLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
    rowMeta: { fontSize: 13, color: colors.textMuted },
    delete: { color: colors.danger, fontWeight: '600', fontSize: 13 },
    empty: { textAlign: 'center', color: colors.textMuted, marginTop: 20 },
    error: { color: colors.danger, textAlign: 'center', marginBottom: 8 },
});
