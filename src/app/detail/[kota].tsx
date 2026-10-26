// src/app/detail/[kota].tsx
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import WeatherCard from "../../components/WeatherCard";
import { useAppTheme } from "../../context/ThemeContext";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{ kota: string }>();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WeatherCard kota={kota ?? "Kota"} suhu={29} tingkatAQI="BAIK" />
      <TouchableOpacity
        style={[styles.tombol, { backgroundColor: colors.primary }]}
        onPress={() =>
          router.push({
            pathname: "/tambah-favorit",
            params: {
              id: "0",
              nama: kota ?? "Kota",
              lat: "0",
              lon: "0",
            },
          })
        }
      >
        <Ionicons name="heart" size={18} color="#FFFFFF" />
        <Text style={styles.teksTombol}>Tambahkan ke Favorit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  tombol: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  teksTombol: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
