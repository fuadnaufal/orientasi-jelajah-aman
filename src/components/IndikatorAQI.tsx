import React from 'react';

export interface LaporanUdara {
  kota: string;
  indeksAQI: number;
  tingkat: "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";
  diperbaruiPada?: string;
}

const IndikatorAQI: React.FC<LaporanUdara> = ({ kota, indeksAQI, tingkat, diperbaruiPada }) => {
  let warna = "black";
  
  switch (tingkat) {
    case "BAIK":
      warna = "green";
      break;
    case "SEDANG":
      warna = "orange";
      break;
    case "TIDAK_SEHAT":
      warna = "red";
      break;
    case "BERBAHAYA":
      warna = "purple";
      break;
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", maxWidth: "300px" }}>
      <h2>{kota}</h2>
      <p style={{ color: warna, fontWeight: "bold", fontSize: "18px" }}>
        Status: {tingkat} (AQI: {indeksAQI})
      </p>
      {diperbaruiPada && (
        <p style={{ fontSize: "12px", color: "gray" }}>Diperbarui: {diperbaruiPada}</p>
      )}
    </div>
  );
};

export default IndikatorAQI;