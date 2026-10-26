// src/services/riwayatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ItemRiwayatPencarian } from "../types/riwayat";

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
export const MAKS_RIWAYAT = 10;

export async function ambilSemuaRiwayat(): Promise<ItemRiwayatPencarian[]> {
  try {
    const json = await AsyncStorage.getItem(KUNCI_RIWAYAT);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function tambahRiwayat(kota: Omit<ItemRiwayatPencarian, "waktu">): Promise<void> {
  try {
    const daftar = await ambilSemuaRiwayat();
    // Filter item yang sudah ada agar dipindah ke urutan teratas tanpa duplikasi
    const disaring = daftar.filter(
      (item) =>
        (kota.id !== -1 && item.id !== kota.id) ||
        (kota.id === -1 && item.nama.toLowerCase() !== kota.nama.toLowerCase())
    );
    const itemBaru: ItemRiwayatPencarian = {
      ...kota,
      waktu: Date.now(),
    };
    // Maksimal 10 pencarian terakhir
    const daftarBaru = [itemBaru, ...disaring].slice(0, MAKS_RIWAYAT);
    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftarBaru));
  } catch (e) {
    console.error("Gagal menambah riwayat pencarian:", e);
  }
}

export async function hapusSatuRiwayat(id: number, nama?: string): Promise<void> {
  try {
    const daftar = await ambilSemuaRiwayat();
    const daftarBaru = daftar.filter((item) => {
      if (id !== -1 && item.id !== -1) return item.id !== id;
      return item.nama !== nama;
    });
    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(daftarBaru));
  } catch (e) {
    console.error("Gagal menghapus item riwayat:", e);
  }
}

export async function hapusSemuaRiwayat(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KUNCI_RIWAYAT);
  } catch (e) {
    console.error("Gagal mengosongkan riwayat:", e);
  }
}
