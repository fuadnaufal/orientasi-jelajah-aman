// src/services/cacheRepository.ts
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ambilDatabase } from "../db/database";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";
import {
    DataTersimpan,
    KotaUntukCache,
    RingkasanKotaTersimpan,
} from "../types/cache";

interface BarisCache {
    kunci: string;
    kota_id: number;
    nama_kota: string;
    latitude: number;
    longitude: number;
    cuaca_json: string;
    aqi_json: string;
    disimpan_pada: number;
}

const KUNCI_ASYNC_STORAGE_CACHE = "@jelajah_aman:cache_cuaca_fallback";

export function buatKunci(latitude: number, longitude: number): string {
    return latitude.toFixed(2) + "," + longitude.toFixed(2);
}

// Helper untuk fallback AsyncStorage jika SQLite gagal (e.g. pada Browser Web)
async function ambilCacheAsyncStorage(): Promise<Record<string, BarisCache>> {
    try {
        const json = await AsyncStorage.getItem(KUNCI_ASYNC_STORAGE_CACHE);
        return json ? JSON.parse(json) : {};
    } catch {
        return {};
    }
}

async function simpanCacheAsyncStorage(map: Record<string, BarisCache>): Promise<void> {
    try {
        await AsyncStorage.setItem(KUNCI_ASYNC_STORAGE_CACHE, JSON.stringify(map));
    } catch {}
}

export async function simpanCache(
    kota: KotaUntukCache,
    cuaca: DataCuacaLengkap,
    kualitasUdara: DataKualitasUdara
): Promise<void> {
    const kunci = buatKunci(kota.latitude, kota.longitude);
    const sekarang = Date.now();
    const baris: BarisCache = {
        kunci,
        kota_id: kota.id,
        nama_kota: kota.nama,
        latitude: kota.latitude,
        longitude: kota.longitude,
        cuaca_json: JSON.stringify(cuaca),
        aqi_json: JSON.stringify(kualitasUdara),
        disimpan_pada: sekarang,
    };

    if (Platform.OS !== "web") {
        try {
            const db = await ambilDatabase();
            await db.runAsync(
                `INSERT OR REPLACE INTO cache_cuaca
(kunci, kota_id, nama_kota, latitude, longitude, cuaca_json, aqi_json, disimpan_pada)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    baris.kunci,
                    baris.kota_id,
                    baris.nama_kota,
                    baris.latitude,
                    baris.longitude,
                    baris.cuaca_json,
                    baris.aqi_json,
                    baris.disimpan_pada,
                ]
            );
            return;
        } catch (e) {
            console.warn("SQLite simpanCache gagal, beralih ke fallback penyimpanan lokal:", e);
        }
    }

    // Fallback AsyncStorage untuk web
    const map = await ambilCacheAsyncStorage();
    map[kunci] = baris;
    await simpanCacheAsyncStorage(map);
}

export async function ambilCache(
    latitude: number,
    longitude: number
): Promise<DataTersimpan | null> {
    const kunci = buatKunci(latitude, longitude);

    if (Platform.OS !== "web") {
        try {
            const db = await ambilDatabase();
            const baris = await db.getFirstAsync<BarisCache>(
                "SELECT * FROM cache_cuaca WHERE kunci = ?",
                [kunci]
            );
            if (baris) {
                return {
                    cuaca: JSON.parse(baris.cuaca_json) as DataCuacaLengkap,
                    kualitasUdara: JSON.parse(baris.aqi_json) as DataKualitasUdara,
                    disimpanPada: baris.disimpan_pada,
                };
            }
            return null;
        } catch (e) {
            console.warn("SQLite ambilCache gagal, beralih ke fallback penyimpanan lokal:", e);
        }
    }

    // Fallback AsyncStorage
    const map = await ambilCacheAsyncStorage();
    const baris = map[kunci];
    if (!baris) return null;
    return {
        cuaca: JSON.parse(baris.cuaca_json) as DataCuacaLengkap,
        kualitasUdara: JSON.parse(baris.aqi_json) as DataKualitasUdara,
        disimpanPada: baris.disimpan_pada,
    };
}

export async function daftarKotaTersimpan(): Promise<RingkasanKotaTersimpan[]> {
    if (Platform.OS !== "web") {
        try {
            const db = await ambilDatabase();
            const semua = await db.getAllAsync<BarisCache>(
                `SELECT kunci, kota_id, nama_kota, latitude, longitude, cuaca_json, disimpan_pada
FROM cache_cuaca ORDER BY disimpan_pada DESC`
            );
            return semua.map((b) => {
                let suhu: number | undefined;
                try {
                    const parsed = JSON.parse(b.cuaca_json);
                    suhu = parsed?.saatIni?.suhu;
                } catch {}
                return {
                    kunci: b.kunci,
                    id: b.kota_id,
                    nama: b.nama_kota,
                    latitude: b.latitude,
                    longitude: b.longitude,
                    disimpanPada: b.disimpan_pada,
                    suhu,
                };
            });
        } catch (e) {
            console.warn("SQLite daftarKotaTersimpan gagal, beralih ke fallback penyimpanan lokal:", e);
        }
    }

    // Fallback AsyncStorage
    const map = await ambilCacheAsyncStorage();
    const list = Object.values(map);
    list.sort((a, b) => b.disimpan_pada - a.disimpan_pada);
    return list.map((b) => {
        let suhu: number | undefined;
        try {
            const parsed = JSON.parse(b.cuaca_json);
            suhu = parsed?.saatIni?.suhu;
        } catch {}
        return {
            kunci: b.kunci,
            id: b.kota_id,
            nama: b.nama_kota,
            latitude: b.latitude,
            longitude: b.longitude,
            disimpanPada: b.disimpan_pada,
            suhu,
        };
    });
}

// Hapus satu kota dari cache (Tugas UTS no. 3)
export async function hapusCacheKota(kunci: string): Promise<void> {
    if (Platform.OS !== "web") {
        try {
            const db = await ambilDatabase();
            await db.runAsync("DELETE FROM cache_cuaca WHERE kunci = ?", [kunci]);
        } catch (e) {
            console.warn("SQLite hapusCacheKota gagal, beralih ke fallback penyimpanan lokal:", e);
        }
    }

    const map = await ambilCacheAsyncStorage();
    if (map[kunci]) {
        delete map[kunci];
        await simpanCacheAsyncStorage(map);
    }
}

// Invalidation otomatis: buang cache yang lebih tua dari batas umur
export async function bersihkanCacheLama(batasUmurMs: number): Promise<void> {
    const batasWaktu = Date.now() - batasUmurMs;

    if (Platform.OS !== "web") {
        try {
            const db = await ambilDatabase();
            await db.runAsync("DELETE FROM cache_cuaca WHERE disimpan_pada < ?", [batasWaktu]);
        } catch (e) {
            console.warn("SQLite bersihkanCacheLama gagal, beralih ke fallback:", e);
        }
    }

    const map = await ambilCacheAsyncStorage();
    let adaPerubahan = false;
    for (const k in map) {
        if (map[k].disimpan_pada < batasWaktu) {
            delete map[k];
            adaPerubahan = true;
        }
    }
    if (adaPerubahan) {
        await simpanCacheAsyncStorage(map);
    }
}

// Invalidation manual: kosongkan seluruh cache
export async function hapusSemuaCache(): Promise<void> {
    if (Platform.OS !== "web") {
        try {
            const db = await ambilDatabase();
            await db.runAsync("DELETE FROM cache_cuaca");
        } catch (e) {
            console.warn("SQLite hapusSemuaCache gagal, beralih ke fallback:", e);
        }
    }

    await AsyncStorage.removeItem(KUNCI_ASYNC_STORAGE_CACHE);
}
