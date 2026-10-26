// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { hapusSemuaRiwayat } from "../../services/riwayatStorage";
import { useAppTheme, ThemeMode } from "../../context/ThemeContext";
import { tampilkanKonfirmasi } from "../../utils/dialog";

export default function TabPengaturan() {
  const { colors, themeMode, setThemeMode } = useAppTheme();
  const [pesan, setPesan] = useState<string | null>(null);

  const pilihanTema: {
    mode: ThemeMode;
    label: string;
    sublabel: string;
    ikon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      mode: "light",
      label: "Terang",
      sublabel: "Tampilan latar terang yang jernih dan nyaman di siang hari",
      ikon: "sunny-outline",
    },
    {
      mode: "dark",
      label: "Gelap",
      sublabel: "Tampilan latar gelap yang teduh dan hemat daya baterai",
      ikon: "moon-outline",
    },
    {
      mode: "system",
      label: "Ikuti Sistem",
      sublabel: "Otomatis menyesuaikan dengan pengaturan tema perangkat Anda",
      ikon: "phone-portrait-outline",
    },
  ];

  function konfirmasiHapusCache() {
    tampilkanKonfirmasi({
      judul: "Hapus Semua Cache Cuaca",
      pesan: "Apakah Anda yakin ingin menghapus seluruh data cuaca tersimpan?",
      teksKonfirmasi: "Hapus Semua",
      onKonfirmasi: async () => {
        await hapusSemuaCache();
        setPesan("Seluruh data cache cuaca tersimpan telah dibersihkan.");
      },
    });
  }

  function konfirmasiHapusRiwayat() {
    tampilkanKonfirmasi({
      judul: "Hapus Semua Riwayat",
      pesan: "Apakah Anda yakin ingin menghapus seluruh riwayat pencarian?",
      teksKonfirmasi: "Kosongkan",
      onKonfirmasi: async () => {
        await hapusSemuaRiwayat();
        setPesan("Seluruh riwayat pencarian telah dibersihkan.");
      },
    });
  }

  return (
    <SafeAreaView style={[styles.layar, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.konten}>
        {/* SEKSI TEMA TAMPILAN (Tugas UTS no. 4) */}
        <View style={styles.seksi}>
          <Text style={[styles.judulSeksi, { color: colors.text }]}>
            Tema Tampilan (Dark / Light Mode)
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>
            Pilih preferensi mode tampilan antarmuka aplikasi.
          </Text>

          <View
            style={[
              styles.kartuOpsiTema,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {pilihanTema.map((opsi, idx) => {
              const aktif = themeMode === opsi.mode;
              return (
                <TouchableOpacity
                  key={opsi.mode}
                  style={[
                    styles.itemOpsiTema,
                    idx < pilihanTema.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    setThemeMode(opsi.mode);
                    setPesan(`Tema diubah ke mode: ${opsi.label}`);
                  }}
                >
                  <View
                    style={[
                      styles.lingkaranIkonTema,
                      {
                        backgroundColor: aktif
                          ? colors.primaryContainer
                          : colors.surface,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opsi.ikon}
                      size={20}
                      color={aktif ? colors.primary : colors.textSecondary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.labelTema,
                        {
                          color: aktif ? colors.primary : colors.text,
                          fontWeight: aktif ? "bold" : "600",
                        },
                      ]}
                    >
                      {opsi.label}
                    </Text>
                    <Text style={[styles.sublabelTema, { color: colors.textSecondary }]}>
                      {opsi.sublabel}
                    </Text>
                  </View>

                  <Ionicons
                    name={aktif ? "radio-button-on" : "radio-button-off"}
                    size={22}
                    color={aktif ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SEKSI MANAJEMEN PENYIMPANAN & CACHE */}
        <View style={styles.seksi}>
          <Text style={[styles.judulSeksi, { color: colors.text }]}>
            Penyimpanan & Cache
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 8 }}>
            Kelola data offline dan riwayat pencarian yang tersimpan di perangkat.
          </Text>

          <View
            style={[
              styles.kartuOpsiTema,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.itemAksi,
                { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={konfirmasiHapusCache}
            >
              <Ionicons name="trash-bin-outline" size={20} color={colors.danger} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.teksAksiHapus, { color: colors.danger }]}>
                  Hapus Semua Cache Cuaca
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Mengosongkan semua data cuaca offline dari penyimpanan
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.itemAksi} onPress={konfirmasiHapusRiwayat}>
              <Ionicons name="time-outline" size={20} color={colors.danger} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.teksAksiHapus, { color: colors.danger }]}>
                  Hapus Semua Riwayat Pencarian
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Mengosongkan daftar riwayat kota yang pernah dicari
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* NOTIFIKASI PESAN */}
        {pesan && (
          <View
            style={[
              styles.kotakPesan,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={{ color: colors.text, flex: 1, fontSize: 13 }}>{pesan}</Text>
          </View>
        )}

        {/* TENTANG APLIKASI */}
        <View
          style={[
            styles.kartuInfoAplikasi,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          <Text style={[styles.namaAplikasi, { color: colors.text }]}>Jelajah Aman</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            Versi 1.0.0 (UTS Pemrograman Berbasis Platform)
          </Text>
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
    gap: 20,
  },
  seksi: {
    gap: 4,
  },
  judulSeksi: {
    fontSize: 16,
    fontWeight: "bold",
  },
  kartuOpsiTema: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  itemOpsiTema: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  lingkaranIkonTema: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  labelTema: {
    fontSize: 15,
  },
  sublabelTema: {
    fontSize: 12,
    marginTop: 2,
  },
  itemAksi: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  teksAksiHapus: {
    fontSize: 14,
    fontWeight: "600",
  },
  kotakPesan: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  kartuInfoAplikasi: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  namaAplikasi: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
