import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme';

const MAX_PHOTOS = 4;

export default function PhotoPicker({ photos, onChange }) {
    async function addPhoto() {
        if (photos.length >= MAX_PHOTOS) return;

        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return;

        const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
        if (!result.canceled && result.assets?.[0]) {
            onChange([...photos, result.assets[0]]);
        }
    }

    function removePhoto(index) {
        onChange(photos.filter((_, i) => i !== index));
    }

    return (
        <View>
            <View style={styles.grid}>
                {photos.map((photo, index) => (
                    <View key={photo.uri} style={styles.thumbWrap}>
                        <Image source={{ uri: photo.uri }} style={styles.thumb} />
                        <Pressable style={styles.remove} onPress={() => removePhoto(index)}>
                            <Text style={styles.removeText}>✕</Text>
                        </Pressable>
                    </View>
                ))}
                {photos.length < MAX_PHOTOS && (
                    <Pressable style={styles.add} onPress={addPhoto}>
                        <Text style={styles.addText}>+ Photo</Text>
                    </Pressable>
                )}
            </View>
            <Text style={styles.hint}>{photos.length} / {MAX_PHOTOS} photos</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    thumbWrap: { position: 'relative' },
    thumb: { width: 80, height: 80, borderRadius: 10, backgroundColor: colors.surfaceMuted },
    remove: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.danger,
        borderRadius: 999,
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    add: {
        width: 80,
        height: 80,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addText: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
    hint: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
});
