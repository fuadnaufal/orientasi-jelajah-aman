// components/IndikatorAQI.tsx
import { View, Text, useColorScheme } from "react-native";
import { LaporanUdara } from "../types/cuaca";

export default function IndikatorAQI({
    kota,
    indeksAQI,
    tingkat,
    diperbaruiPada,
}: LaporanUdara) {
    const isDark = useColorScheme() === "dark";

  // Penentuan warna berdasarkan nilai tingkat AQI
    const getWarnaTingkat = (status: LaporanUdara["tingkat"]) => {
        switch (status) {
            case "BAIK":
                return "#16A34A"; // Hijau
            case "SEDANG":
                return "#CA8A04"; // Kuning/Oranye hangat
            case "TIDAK_SEHAT":
                return "#EA580C"; // Oranye/Merah bata
            case "BERBAHAYA":
                return "#DC2626"; // Merah pekat
            default:
                return isDark ? "#F9FAFB" : "#111827";
        }
    };

    const warnaStatus = getWarnaTingkat(tingkat);

    return (
        <View
        style={{
            padding: 16,
            borderRadius: 8,
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            borderWidth: 1,
            borderColor: isDark ? "#374151" : "#E5E7EB",
            gap: 6,
        }}
        >
        <Text
            style={{
            fontSize: 16,
            fontWeight: "bold",
            color: isDark ? "#F9FAFB" : "#111827",
            }}
        >
            {kota}
        </Text>
        <Text
            style={{
            fontSize: 14,
            color: isDark ? "#9CA3AF" : "#6B7280",
            }}
        >
            Indeks AQI: <Text style={{ fontWeight: "600" }}>{indeksAQI}</Text>
        </Text>
        <Text
            style={{
            fontSize: 14,
            fontWeight: "bold",
            color: warnaStatus,
            }}
        >
            Status: {tingkat}
        </Text>
        {diperbaruiPada && (
            <Text
            style={{
                fontSize: 12,
                color: isDark ? "#6B7280" : "#9CA3AF",
                marginTop: 4,
            }}
            >
            Diperbarui: {diperbaruiPada}
            </Text>
        )}
        </View>
    );
}