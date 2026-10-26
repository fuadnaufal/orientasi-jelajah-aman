// src/app/(tabs)/tentang.tsx
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../context/ThemeContext";

export default function TabTentang() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.layar, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.konten}>
        {/* Header Kartu Aplikasi */}
        <View
          style={[
            styles.kartuUtama,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.lingkaranLogo,
              { backgroundColor: colors.primaryContainer },
            ]}
          >
            <Ionicons name="compass" size={44} color={colors.primary} />
          </View>
          <Text
            accessible
            accessibilityLabel="Judul halaman Tentang aplikasi Jelajah Aman"
            style={[styles.judulApp, { color: colors.text }]}
          >
            Jelajah Aman
          </Text>
          <Text style={[styles.versiApp, { color: colors.textSecondary }]}>
            Versi 1.0.0
          </Text>
          <Text style={[styles.deskripsiApp, { color: colors.textSecondary }]}>
            Aplikasi informasi cuaca dan kualitas udara (AQI) cerdas dengan dukungan mode offline,
            pencarian kota otomatis, dan personalisasi tema tampilan.
          </Text>
        </View>

        {/* Informasi Mahasiswa & Akademik */}
        <View
          style={[
            styles.kartuSeksi,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.judulSeksi, { color: colors.text }]}>
            Informasi Akademik
          </Text>

          <View style={styles.barisInfo}>
            <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.labelInfo, { color: colors.textSecondary }]}>
                Pengembang
              </Text>
              <Text style={[styles.nilaiInfo, { color: colors.text }]}>
                Fuad Naufal Ihsan
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.pembatas,
              { backgroundColor: colors.border },
            ]}
          />

          <View style={styles.barisInfo}>
            <Ionicons name="school-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.labelInfo, { color: colors.textSecondary }]}>
                Mata Kuliah
              </Text>
              <Text style={[styles.nilaiInfo, { color: colors.text }]}>
                Pemrograman Berbasis Platform (4 SKS)
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.pembatas,
              { backgroundColor: colors.border },
            ]}
          />

          <View style={styles.barisInfo}>
            <Ionicons name="business-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.labelInfo, { color: colors.textSecondary }]}>
                Institusi
              </Text>
              <Text style={[styles.nilaiInfo, { color: colors.text }]}>
                S1 Informatika UIN K.H. Abdurrahman Wahid Pekalongan
              </Text>
            </View>
          </View>
        </View>

        {/* Fitur Utama */}
        <View
          style={[
            styles.kartuSeksi,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.judulSeksi, { color: colors.text }]}>
            Fitur Penyempurnaan UTS
          </Text>

          <View style={styles.itemFitur}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={[styles.teksFitur, { color: colors.text }]}>
              Kustomisasi Ikon Tab Bar (@expo/vector-icons) & Label Navigasi Intuitif
            </Text>
          </View>

          <View style={styles.itemFitur}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={[styles.teksFitur, { color: colors.text }]}>
              Riwayat Pencarian Terakhir (Maks 10) & Navigasi Cepat
            </Text>
          </View>

          <View style={styles.itemFitur}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={[styles.teksFitur, { color: colors.text }]}>
              Penghapusan Cache Kota Offline dengan Konfirmasi Dialog
            </Text>
          </View>

          <View style={styles.itemFitur}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={[styles.teksFitur, { color: colors.text }]}>
              Tema Gelap / Terang Dinamis (Terang, Gelap, Ikuti Sistem)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layar: {
    flex: 1,
  },
  konten: {
    padding: 16,
    gap: 16,
  },
  kartuUtama: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    textAlign: "center",
    gap: 8,
  },
  lingkaranLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  judulApp: {
    fontSize: 22,
    fontWeight: "bold",
  },
  versiApp: {
    fontSize: 13,
    fontWeight: "600",
  },
  deskripsiApp: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 4,
  },
  kartuSeksi: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  judulSeksi: {
    fontSize: 15,
    fontWeight: "bold",
  },
  barisInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  labelInfo: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  nilaiInfo: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 1,
  },
  pembatas: {
    height: StyleSheet.hairlineWidth,
  },
  itemFitur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  teksFitur: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
