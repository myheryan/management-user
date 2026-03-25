import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatIDR = (val: number | undefined) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`; 

export const formatDate = (dateValue: any) => {
  if (!dateValue) return "---";
  
  // Mencoba parsing tanggal
  const d = new Date(dateValue);
  
  // Jika gagal (Invalid Date), coba cek apakah ini timestamp angka
  if (isNaN(d.getTime())) {
    const timestamp = Number(dateValue);
    if (!isNaN(timestamp)) {
      const dt = new Date(timestamp);
      return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return "---";
  }

  return d.toLocaleDateString('id-ID', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};