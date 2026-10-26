// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilSemuaRiwayat,
  hapusSatuRiwayat,
  hapusSemuaRiwayat,
} from "../../services/riwayatStorage";
import {
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import { KotaFavorit } from "../../types/favorit";
import { ItemRiwayatPencarian } from "../../types/riwayat";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { useAppTheme } from "../../context/ThemeContext";
import { tampilkanKonfirmasi } from "../../utils/dialog";

type TabKategori = "riwayat" | "cache" | "favorit";

function formatWaktu(ms: number): string {
  const diff = Date.now() - ms;
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "Baru saja";
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return `${hari} hari lalu`;
}

export default function TabRiwayat() {
  const { colors } = useAppTheme();
  const [tabAktif, setTabAktif] = useState<TabKategori>("riwayat");
  const [daftarRiwayat, setDaftarRiwayat] = useState<ItemRiwayatPencarian[]>([]);
  const [daftarCache, setDaftarCache] = useState<RingkasanKotaTersimpan[]>([]);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  const muatData = useCallback(async () => {
    try {
      const [riwayat, cache, favorit] = await Promise.all([
        ambilSemuaRiwayat(),
        daftarKotaTersimpan(),
        ambilSemuaFavorit(),
      ]);
      setDaftarRiwayat(riwayat);
      setDaftarCache(cache);
      setDaftarFavorit(favorit);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
  );

  function bukaPencarian(kota: {
    id: number;
    nama: string;
    latitude: number;
    longitude: number;
  }) {
    router.push({
      pathname: "/",
      params: {
        kotaId: String(kota.id),
        kotaNama: kota.nama,
        lat: String(kota.latitude),
        lon: String(kota.longitude),
      },
    });
  }

  function aksiHapusCache(item: RingkasanKotaTersimpan) {
    tampilkanKonfirmasi({
      judul: "Konfirmasi Hapus Cache",
      pesan: `Apakah Anda yakin ingin menghapus data cache cuaca untuk kota "${item.nama}" dari perangkat?`,
      teksKonfirmasi: "Hapus",
      onKonfirmasi: async () => {
        await hapusCacheKota(item.kunci);
        await muatData();
      },
    });
  }

  function aksiHapusSatuRiwayat(item: ItemRiwayatPencarian) {
    tampilkanKonfirmasi({
      judul: "Hapus Riwayat",
      pesan: `Hapus "${item.nama}" dari riwayat pencarian?`,
      teksKonfirmasi: "Hapus",
      onKonfirmasi: async () => {
        await hapusSatuRiwayat(item.id, item.nama);
        await muatData();
      },
    });
  }

  function aksiKosongkanRiwayat() {
    tampilkanKonfirmasi({
      judul: "Kosongkan Riwayat",
      pesan: "Hapus semua riwayat pencarian terakhir?",
      teksKonfirmasi: "Kosongkan",
      onKonfirmasi: async () => {
        await hapusSemuaRiwayat();
        await muatData();
      },
    });
  }

  function aksiHapusFavorit(item: KotaFavorit) {
    tampilkanKonfirmasi({
      judul: "Hapus Favorit",
      pesan: `Hapus "${item.nama}" dari daftar favorit?`,
      teksKonfirmasi: "Hapus",
      onKonfirmasi: async () => {
        await hapusFavorit(item.id);
        await muatData();
      },
    });
  }

  return (
    <SafeAreaView style={[styles.layar, { backgroundColor: colors.background }]}>
      {/* Segment Tab Pengalih Kategori */}
      <View
        style={[
          styles.segmentContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.segmentTombol,
            tabAktif === "riwayat" && {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => setTabAktif("riwayat")}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={tabAktif === "riwayat" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: tabAktif === "riwayat" ? colors.primary : colors.textSecondary,
                fontWeight: tabAktif === "riwayat" ? "bold" : "500",
              },
            ]}
          >
            Riwayat ({daftarRiwayat.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentTombol,
            tabAktif === "cache" && {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => setTabAktif("cache")}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={16}
            color={tabAktif === "cache" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: tabAktif === "cache" ? colors.primary : colors.textSecondary,
                fontWeight: tabAktif === "cache" ? "bold" : "500",
              },
            ]}
          >
            Cache ({daftarCache.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentTombol,
            tabAktif === "favorit" && {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
          onPress={() => setTabAktif("favorit")}
        >
          <Ionicons
            name="heart-outline"
            size={16}
            color={tabAktif === "favorit" ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.segmentText,
              {
                color: tabAktif === "favorit" ? colors.primary : colors.textSecondary,
                fontWeight: tabAktif === "favorit" ? "bold" : "500",
              },
            ]}
          >
            Favorit ({daftarFavorit.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.kontenScroll}>
        {/* KONTEN TAB 1: RIWAYAT PENCARIAN TERAKHIR (Tugas UTS no. 2) */}
        {tabAktif === "riwayat" && (
          <View style={{ gap: 12 }}>
            <View style={styles.barisHeaderSection}>
              <View>
                <Text style={[styles.judulSection, { color: colors.text }]}>
                  Riwayat Pencarian Terakhir
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                  Maksimal 10 pencarian terakhir di perangkat. Klik kota untuk mencari lagi.
                </Text>
              </View>
              {daftarRiwayat.length > 0 && (
                <TouchableOpacity
                  onPress={aksiKosongkanRiwayat}
                  style={[styles.tombolHapusSemua, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "600" }}>
                    Bersihkan
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {daftarRiwayat.length === 0 ? (
              <View
                style={[
                  styles.kotakKosong,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons name="search-outline" size={42} color={colors.textSecondary} />
                <Text style={[styles.teksKosong, { color: colors.textSecondary }]}>
                  Belum ada riwayat pencarian. Cari nama kota di Beranda untuk memulainya.
                </Text>
              </View>
            ) : (
              daftarRiwayat.map((item) => (
                <View
                  key={`${item.id}-${item.waktu}`}
                  style={[
                    styles.kartuItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.areaKlikKota}
                    onPress={() => bukaPencarian(item)}
                  >
                    <View
                      style={[
                        styles.lingkaranIkon,
                        { backgroundColor: colors.primaryContainer },
                      ]}
                    >
                      <Ionicons name="location" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.namaKota, { color: colors.text }]}>
                        {item.nama}
                      </Text>
                      <Text style={[styles.subteksKota, { color: colors.textSecondary }]}>
                        {item.country ? `${item.country} \u2022 ` : ""}
                        {formatWaktu(item.waktu)}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.tombolHapusItem}
                    onPress={() => aksiHapusSatuRiwayat(item)}
                    accessibilityLabel={`Hapus riwayat ${item.nama}`}
                  >
                    <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* KONTEN TAB 2: CACHE KOTA TERSIMPAN (Tugas UTS no. 3) */}
        {tabAktif === "cache" && (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={[styles.judulSection, { color: colors.text }]}>
                Data Cache Cuaca Offline
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Data cuaca tersimpan saat online. Dapat dibuka saat tidak ada internet.
              </Text>
            </View>

            {daftarCache.length === 0 ? (
              <View
                style={[
                  styles.kotakKosong,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons name="cloud-offline-outline" size={42} color={colors.textSecondary} />
                <Text style={[styles.teksKosong, { color: colors.textSecondary }]}>
                  Belum ada data cache cuaca tersimpan di perangkat.
                </Text>
              </View>
            ) : (
              daftarCache.map((item) => (
                <View
                  key={item.kunci}
                  style={[
                    styles.kartuItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.areaKlikKota}
                    onPress={() =>
                      bukaPencarian({
                        id: item.id,
                        nama: item.nama,
                        latitude: item.latitude,
                        longitude: item.longitude,
                      })
                    }
                  >
                    <View
                      style={[
                        styles.lingkaranIkon,
                        { backgroundColor: colors.primaryContainer },
                      ]}
                    >
                      <Ionicons name="partly-sunny" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.namaKota, { color: colors.text }]}>
                        {item.nama}
                      </Text>
                      <Text style={[styles.subteksKota, { color: colors.textSecondary }]}>
                        Disimpan: {formatWaktu(item.disimpanPada)}
                      </Text>
                    </View>

                    {item.suhu !== undefined && (
                      <Text style={[styles.badgeSuhu, { color: colors.primary }]}>
                        {item.suhu}°C
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Tombol Hapus Cache dengan konfirmasi Alert (Tugas UTS no. 3) */}
                  <TouchableOpacity
                    style={[styles.tombolHapusCacheBadge, { backgroundColor: colors.dangerContainer }]}
                    onPress={() => aksiHapusCache(item)}
                    accessibilityLabel={`Hapus cache ${item.nama}`}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    <Text style={[styles.teksHapusCache, { color: colors.danger }]}>
                      Hapus Cache
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* KONTEN TAB 3: KOTA FAVORIT */}
        {tabAktif === "favorit" && (
          <View style={{ gap: 12 }}>
            <View>
              <Text style={[styles.judulSection, { color: colors.text }]}>
                Daftar Kota Favorit
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                Kota-kota yang Anda simpan sebagai favorit.
              </Text>
            </View>

            {daftarFavorit.length === 0 ? (
              <View
                style={[
                  styles.kotakKosong,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Ionicons name="heart-outline" size={42} color={colors.textSecondary} />
                <Text style={[styles.teksKosong, { color: colors.textSecondary }]}>
                  Belum ada kota favorit. Simpan kota favorit dari halaman Beranda.
                </Text>
              </View>
            ) : (
              daftarFavorit.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.kartuItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.areaKlikKota}
                    onPress={() =>
                      bukaPencarian({
                        id: item.id,
                        nama: item.nama,
                        latitude: item.latitude,
                        longitude: item.longitude,
                      })
                    }
                  >
                    <View
                      style={[
                        styles.lingkaranIkon,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons name="heart" size={18} color="#EF4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.namaKota, { color: colors.text }]}>
                        {item.nama}
                      </Text>
                      <Text style={[styles.subteksKota, { color: colors.textSecondary }]}>
                        {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.tombolHapusItem}
                    onPress={() => aksiHapusFavorit(item)}
                    accessibilityLabel={`Hapus favorit ${item.nama}`}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layar: {
    flex: 1,
  },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  segmentTombol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  segmentText: {
    fontSize: 12,
  },
  kontenScroll: {
    padding: 16,
    gap: 16,
  },
  barisHeaderSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  judulSection: {
    fontSize: 17,
    fontWeight: "bold",
  },
  tombolHapusSemua: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  kotakKosong: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  teksKosong: {
    fontSize: 14,
    textAlign: "center",
  },
  kartuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  areaKlikKota: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lingkaranIkon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  namaKota: {
    fontSize: 15,
    fontWeight: "bold",
  },
  subteksKota: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeSuhu: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 6,
  },
  tombolHapusItem: {
    padding: 8,
  },
  tombolHapusCacheBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  teksHapusCache: {
    fontSize: 12,
    fontWeight: "700",
  },
});
