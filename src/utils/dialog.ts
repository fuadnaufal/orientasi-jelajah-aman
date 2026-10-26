// src/utils/dialog.ts
import { Alert, Platform } from "react-native";

interface OpsiKonfirmasi {
  judul: string;
  pesan: string;
  teksBatal?: string;
  teksKonfirmasi?: string;
  onKonfirmasi: () => void;
}

export function tampilkanKonfirmasi({
  judul,
  pesan,
  teksBatal = "Batal",
  teksKonfirmasi = "Hapus",
  onKonfirmasi,
}: OpsiKonfirmasi) {
  if (Platform.OS === "web") {
    const disetujui = typeof window !== "undefined" && window.confirm
      ? window.confirm(`${judul}\n\n${pesan}`)
      : true;
    if (disetujui) {
      onKonfirmasi();
    }
  } else {
    Alert.alert(
      judul,
      pesan,
      [
        { text: teksBatal, style: "cancel" },
        { text: teksKonfirmasi, style: "destructive", onPress: onKonfirmasi },
      ],
      { cancelable: true }
    );
  }
}
