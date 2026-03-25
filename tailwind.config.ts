import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        falcon: {
          blue: "#2c7be5",      // Warna Brand Utama
          bg: "#f9fafd",        // Latar Belakang Body
          card: "#ffffff",      // Putih Bersih
          border: "#edf2f9",    // Garis Pemisah Tipis
          heading: "#344050",   // Judul (Dark Navy)
          body: "#4d5969",      // Teks Konten
          muted: "#9da9bb",     // Teks Label/Kecil
          success: "#00d27a",   // Hijau Falcon
        }
      },
      fontFamily: {
        // Falcon menggunakan Poppins & Public Sans
        sans: ["Poppins", "Public Sans", "sans-serif"],
      },
      boxShadow: {
        // Shadow khas Falcon yang sangat halus
        'falcon': '0 7px 14px 0 rgba(65, 69, 88, 0.1), 0 3px 6px 0 rgba(0, 0, 0, 0.07)',
      }
    },
  },
};
export default config;