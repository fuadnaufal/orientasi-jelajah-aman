// src/components/WeatherCard.tsx
import { View, Text, StyleSheet } from "react-native";
import { WeatherCardProps, TingkatAQI } from "../types/cuaca";
import { typeScale, spacing } from "../constants/styles";
import { useAppTheme } from "../context/ThemeContext";

const warnaPerTingkat: Record<TingkatAQI, { text: string; bg: string }> = {
  BAIK: { text: "#16A34A", bg: "#DCFCE7" },
  SEDANG: { text: "#CA8A04", bg: "#FEF9C3" },
  TIDAK_SEHAT: { text: "#EA580C", bg: "#FFEDD5" },
  BERBAHAYA: { text: "#DC2626", bg: "#FEE2E2" },
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const { colors, isDark } = useAppTheme();

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${tingkatAQI})`
      : `AQI: ${tingkatAQI}`;
  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`;

  const infoAQI = warnaPerTingkat[tingkatAQI] ?? warnaPerTingkat.SEDANG;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.kota, { color: colors.text }]}>{kota}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark ? "#334155" : infoAQI.bg,
            },
          ]}
        >
          <Text
            style={[
              styles.aqiText,
              { color: isDark ? infoAQI.text : infoAQI.text },
            ]}
          >
            {teksAQI}
          </Text>
        </View>
      </View>

      <Text style={[styles.suhu, { color: colors.primary }]}>{suhu}°C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.sedang,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  kota: {
    fontWeight: "bold",
    fontSize: typeScale.judul,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  aqiText: {
    fontWeight: "700",
    fontSize: 12,
  },
  suhu: {
    fontSize: 42,
    fontWeight: "800",
  },
});
