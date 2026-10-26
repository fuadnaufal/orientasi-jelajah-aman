// src/app/tambah-favorit.tsx
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { tambahFavorit } from "../services/favoritStorage";
import { useAppTheme } from "../context/ThemeContext";

export default function ModalTambahFavorit() {
  const { colors } = useAppTheme();
  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    await tambahFavorit({
      id: Number(id),
      nama: nama ?? "Kota Tanpa Nama",
      latitude: Number(lat),
      longitude: Number(lon),
    });
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.lingkaranIkon,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <Ionicons name="heart" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.judul, { color: colors.text }]}>
          Tambah ke Favorit
        </Text>

        <Text style={[styles.deskripsi, { color: colors.textSecondary }]}>
          Tambahkan kota <Text style={{ fontWeight: "bold", color: colors.text }}>{nama}</Text> ke dalam daftar kota favorit Anda untuk akses cepat?
        </Text>

        <View style={styles.barisTombol}>
          <TouchableOpacity
            style={[styles.tombol, { backgroundColor: colors.surface }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.teksTombol, { color: colors.textSecondary }]}>
              Batal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tombol, { backgroundColor: colors.primary }]}
            onPress={simpan}
          >
            <Text style={[styles.teksTombol, { color: "#FFFFFF" }]}>
              Simpan Favorit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 16,
  },
  lingkaranIkon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  judul: {
    fontSize: 18,
    fontWeight: "bold",
  },
  deskripsi: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  barisTombol: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  tombol: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  teksTombol: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
