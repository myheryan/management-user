"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mendefinisikan bentuk data untuk setiap opsi menu
export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isDanger?: boolean; // Jika true, teks akan berwarna merah
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export default function ActionMenu({ items }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {/* Gaya tombol transparan yang akan memunculkan border/background saat di-hover/diklik (mirip referensi gambar) */}
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 text-[#9da9bb] hover:text-[#344050] hover:bg-[#f9fafd] border border-transparent hover:border-[#edf2f9] transition-all focus-visible:ring-0 data-[state=open]:bg-[#f9fafd] data-[state=open]:border-[#edf2f9]"
        >
          <span className="sr-only">Buka menu aksi</span>
          {/* Ikon Titik Tiga Vertikal */}
          <MoreVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-40 font-sans border-[#edf2f9] shadow-sm rounded-lg p-1.5 bg-white">
        {items.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className={`text-xs font-semibold cursor-pointer rounded-md py-2 px-2.5 transition-colors ${
              item.isDanger
                ? "text-[#e63757] focus:bg-[#fff1f2] focus:text-[#e63757]" // Tema Merah untuk Hapus
                : "text-[#4d5969] focus:bg-blue-50 focus:text-[#2c7be5]"   // Tema Biru untuk Detail/Edit
            }`}
          >
            {item.icon && <span className="mr-2 opacity-80">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}