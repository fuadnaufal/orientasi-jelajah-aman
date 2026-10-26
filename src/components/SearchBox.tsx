// src/components/SearchBox.tsx
import { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  nilaiAwal?: string;
}

export default function SearchBox({ onCari, nilaiAwal = "" }: SearchBoxProps) {
  const [teks, setTeks] = useState(nilaiAwal);
  const { colors } = useAppTheme();

  useEffect(() => {
    if (nilaiAwal !== undefined && nilaiAwal !== teks) {
      setTeks(nilaiAwal);
    }
  }, [nilaiAwal]);

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru);
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={colors.textSecondary}
        style={{ marginRight: 8 }}
      />
      <TextInput
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.textSecondary}
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={[styles.input, { color: colors.text }]}
      />
      {teks.length > 0 && (
        <TouchableOpacity onPress={() => handleChange("")}>
          <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
});
