// src/components/StatusData.tsx
import { View, Text } from "react-native";
import { SumberData } from "../types/cache";
import { useAppTheme } from "../context/ThemeContext";

interface StatusDataProps {
    sumber: SumberData;
    disimpanPada: number;
}

function formatUmur(disimpanPada: number): string {
    const menit = Math.floor((Date.now() - disimpanPada) / 60000);
    if (menit < 1) return "baru saja";
    if (menit < 60) return menit + " menit lalu";
    const jam = Math.floor(menit / 60);
    if (jam < 24) return jam + " jam lalu";
    return Math.floor(jam / 24) + " hari lalu";
}

function labelSumber(sumber: SumberData): string {
    if (sumber === "jaringan") return "Data terbaru dari internet";
    if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
    return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
    const { isDark } = useAppTheme();
    const basi = sumber === "cache-basi";
    const label = labelSumber(sumber);
    const umur = formatUmur(disimpanPada);

    const bgLight = basi ? "#FEF3E2" : "#EAFBF6";
    const textLight = basi ? "#B45309" : "#13795F";

    const bgDark = basi ? "#451A03" : "#064E3B";
    const textDark = basi ? "#FDBA74" : "#6EE7B7";

    return (
        <View
            accessible
            accessibilityLabel={label + ", diperbarui " + umur}
            style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: isDark ? bgDark : bgLight,
            }}
        >
            <Text style={{ fontSize: 13, fontWeight: "600", color: isDark ? textDark : textLight }}>
                {label}
            </Text>
            <Text style={{ fontSize: 11, color: isDark ? "#94A3B8" : "#64748B", marginTop: 2 }}>
                Diperbarui {umur}
            </Text>
        </View>
    );
}
