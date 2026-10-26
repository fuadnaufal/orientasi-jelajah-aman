// src/types/riwayat.ts
export interface ItemRiwayatPencarian {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  country?: string;
  waktu: number;
}
