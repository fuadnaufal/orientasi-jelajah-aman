// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import { bersihkanCacheLama, daftarKotaTersimpan, hapusCacheKota } from "../../services/cacheRepository";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { useAppTheme } from "../../context/ThemeContext";
import { tambahRiwayat } from "../../services/riwayatStorage";
import { tampilkanKonfirmasi } from "../../utils/dialog";

export default function HalamanUtama() {
  const { colors, isDark } = useAppTheme();
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0);

  const params = useLocalSearchParams<{
    kotaId?: string;
    kotaNama?: string;
    lat?: string;
    lon?: string;
  }>();

  async function muatKotaTersimpan() {
    try {
      const data = await daftarKotaTersimpan();
      setKotaTersimpan(data);
    } catch {}
  }

  // Refresh data tersimpan saat tab kembali fokus
  useFocusEffect(
    useCallback(() => {
      muatKotaTersimpan();
    }, [])
  );

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  // Tangani parameter dari tab riwayat / favorit
  useEffect(() => {
    if (params.kotaNama && params.lat && params.lon) {
      const kota: HasilGeocoding = {
        id: params.kotaId ? Number(params.kotaId) : Date.now(),
        name: params.kotaNama,
        latitude: Number(params.lat),
        longitude: Number(params.lon),
        country: "",
      };
      setTeksCari(params.kotaNama);
      pilihKota(kota);
    }
  }, [params.kotaNama, params.lat, params.lon, params.kotaId]);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda)
      .then(setHasilPencarian)
      .catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    setHasilPencarian([]);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    // Simpan ke riwayat pencarian terakhir (Tugas UTS no. 2)
    tambahRiwayat({
      id: kota.id,
      nama: kota.name,
      latitude: kota.latitude,
      longitude: kota.longitude,
      country: kota.country ?? "",
    }).catch(() => {});

    try {
      const data = await ambilCuacaOfflineFirst(
        { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }
    setPesanLokasi(null);
    try {
      const koordinat = await ambilKoordinatSaatIni();
      pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch (e) {
      setPesanLokasi("Gagal memperoleh koordinat lokasi saat ini.");
    }
  }

  function konfirmasiHapusCache(item: RingkasanKotaTersimpan) {
    tampilkanKonfirmasi({
      judul: "Hapus Cache Cuaca",
      pesan: `Hapus data cache cuaca untuk "${item.nama}" dari perangkat?`,
      teksKonfirmasi: "Hapus",
      onKonfirmasi: async () => {
        await hapusCacheKota(item.kunci);
        muatKotaTersimpan();
      },
    });
  }

  return (
    <SafeAreaView style={[styles.layar, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.kontainer}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBox onCari={setTeksCari} nilaiAwal={teksCari} />

        <TouchableOpacity
          style={[styles.tombolLokasi, { backgroundColor: colors.primaryContainer }]}
          onPress={gunakanLokasiSaatIni}
        >
          <Ionicons name="navigate-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.teksTombolLokasi, { color: colors.primary }]}>
            Gunakan Lokasi Saat Ini
          </Text>
        </TouchableOpacity>

        {pesanLokasi && (
          <View style={[styles.kotakPesan, { backgroundColor: colors.dangerContainer }]}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{pesanLokasi}</Text>
          </View>
        )}

        {/* Hasil Autocomplete Pencarian */}
        {hasilPencarian.length > 0 && (
          <View
            style={[
              styles.kotakHasil,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {hasilPencarian.map((kota, idx) => (
              <TouchableOpacity
                key={`${kota.id}-${idx}`}
                style={[
                  styles.itemPencarian,
                  idx < hasilPencarian.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => pilihKota(kota)}
              >
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={[styles.namaKotaCari, { color: colors.text }]}>
                    {kota.name}
                  </Text>
                  {kota.country ? (
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {kota.country}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Kota Tersimpan Offline */}
        {kotaTersimpan.length > 0 && (
          <View
            style={[
              styles.kartuTersimpan,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.headerTersimpan}>
              <Ionicons name="cloud-offline-outline" size={18} color={colors.primary} />
              <Text style={[styles.judulTersimpan, { color: colors.text }]}>
                Tersimpan di perangkat (bisa dibuka offline)
              </Text>
            </View>
            {kotaTersimpan.map((k) => (
              <View
                key={k.kunci}
                style={[
                  styles.itemTersimpan,
                  { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                  onPress={() =>
                    pilihKota({
                      id: k.id,
                      name: k.nama,
                      latitude: k.latitude,
                      longitude: k.longitude,
                      country: "",
                    })
                  }
                >
                  <Text style={[styles.namaKotaTersimpan, { color: colors.text }]}>
                    {k.nama}
                  </Text>
                  {k.suhu !== undefined && (
                    <Text style={[styles.suhuTersimpan, { color: colors.primary }]}>
                      {k.suhu}°C
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityLabel={`Hapus cache untuk ${k.nama}`}
                  onPress={() => konfirmasiHapusCache(k)}
                  style={styles.tombolHapusCache}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {sedangMemuat && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>
              Mengambil data cuaca...
            </Text>
          </View>
        )}

        {pesanError && (
          <View
            style={[
              styles.kotakError,
              { backgroundColor: colors.dangerContainer, borderColor: colors.danger },
            ]}
          >
            <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
            <Text style={[styles.teksError, { color: colors.danger }]}>{pesanError}</Text>
            <TouchableOpacity
              style={[styles.tombolCobaLagi, { backgroundColor: colors.danger }]}
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
            >
              <Text style={{ color: "#FFF", fontWeight: "bold" }}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 14 }}>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />
            <Text style={[styles.infoDetail, { color: colors.textSecondary }]}>
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "}
              {hasil.cuaca.saatIni.kecepatanAngin} km/j
            </Text>

            <View style={styles.barisAksi}>
              <TouchableOpacity
                style={[styles.tombolAksi, { backgroundColor: colors.surface }]}
                onPress={() => pilihKota(kotaTerpilih, true)}
              >
                <Ionicons name="refresh-outline" size={18} color={colors.text} />
                <Text style={[styles.teksAksi, { color: colors.text }]}>Perbarui</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tombolAksi, { backgroundColor: colors.primary }]}
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
              >
                <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                <Text style={[styles.teksAksi, { color: "#FFFFFF" }]}>+ Favorit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layar: {
    flex: 1,
  },
  kontainer: {
    padding: 16,
    gap: 16,
  },
  tombolLokasi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  teksTombolLokasi: {
    fontWeight: "700",
    fontSize: 14,
  },
  kotakPesan: {
    padding: 12,
    borderRadius: 8,
  },
  kotakHasil: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  itemPencarian: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  namaKotaCari: {
    fontSize: 15,
    fontWeight: "600",
  },
  kartuTersimpan: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  headerTersimpan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  judulTersimpan: {
    fontWeight: "bold",
    fontSize: 13,
  },
  itemTersimpan: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  namaKotaTersimpan: {
    fontSize: 14,
    fontWeight: "500",
  },
  suhuTersimpan: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  tombolHapusCache: {
    padding: 6,
  },
  loadingBox: {
    padding: 24,
    alignItems: "center",
  },
  kotakError: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  teksError: {
    textAlign: "center",
    fontSize: 14,
  },
  tombolCobaLagi: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  infoDetail: {
    fontSize: 13,
  },
  barisAksi: {
    flexDirection: "row",
    gap: 12,
  },
  tombolAksi: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  teksAksi: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
