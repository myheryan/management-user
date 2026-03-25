"use client";

import * as React from 'react';
import { Plus, Download, Wallet, Heart, Landmark, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActionMenu from "@/components/ActionMenu"; // Menggunakan komponen yang kita buat tadi

// Mock Data untuk preview 2023-2026
const MOCK_EXTRA_INCOME = [
  { id: 1, source: "H. Sulaiman", category: "DONATUR", amount: 5000000, date: "2023-05-12", description: "Infaq Gapura" },
  { id: 2, source: "Bank Mandiri", category: "BUNGA_BANK", amount: 45000, date: "2024-01-30", description: "Bunga Januari" },
  { id: 3, source: "PT. Maju Jaya", category: "SPONSOR", amount: 2000000, date: "2025-08-10", description: "Sponsor 17an" },
];

export default function ExtraIncomePage() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatIDR = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <div className="min-h-screen bg-[#f9fafd] p-6 font-sans text-[#344050]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Pemasukan Eksternal</h1>
            <p className="text-sm text-[#9da9bb]">Kelola dana donatur, sponsor, dan pendapatan non-iuran (2023-2026)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 border-[#edf2f9] bg-white text-xs font-semibold uppercase tracking-wider">
              <Download size={14} /> Ekspor CSV
            </Button>
            <Button className="flex items-center gap-2 bg-[#2c7be5] hover:bg-[#1a5fbc] text-white text-xs font-semibold uppercase tracking-wider">
              <Plus size={14} /> Tambah Data
            </Button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Donasi" amount={8000000} icon={<Heart className="text-red-500" />} color="border-l-red-500" />
          <StatCard title="Sponsor" amount={4500000} icon={<Wallet className="text-blue-500" />} color="border-l-blue-500" />
          <StatCard title="Bunga Bank" amount={320000} icon={<Landmark className="text-emerald-500" />} color="border-l-emerald-500" />
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white border border-[#edf2f9] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#edf2f9] bg-slate-50/50">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#4d5969]">Riwayat Pemasukan Lainnya</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#edf2f9]">
                  <th className="px-6 py-4 font-semibold text-[#9da9bb] uppercase text-[11px] tracking-wider">Sumber Dana</th>
                  <th className="px-6 py-4 font-semibold text-[#9da9bb] uppercase text-[11px] tracking-wider">Kategori</th>
                  <th className="px-6 py-4 font-semibold text-[#9da9bb] uppercase text-[11px] tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 font-semibold text-[#9da9bb] uppercase text-[11px] tracking-wider text-right">Nominal</th>
                  <th className="px-6 py-4 font-semibold text-[#9da9bb] uppercase text-[11px] tracking-wider w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f9]">
                {MOCK_EXTRA_INCOME.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f9fafd] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#344050]">{item.source}</div>
                      <div className="text-[11px] text-[#9da9bb]">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-none text-[10px] font-bold uppercase tracking-tighter bg-slate-100 text-slate-600 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#4d5969] text-xs font-medium">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#2c7be5]">
                      {formatIDR(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {/* Menggunakan ActionMenu Base UI yang sudah kita buat */}
                      <ActionMenu items={[
                        { label: "Edit Data", onClick: () => console.log("edit"), icon: null },
                        { label: "Hapus", isDanger: true, onClick: () => console.log("delete"), icon: null },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-komponen StatCard
function StatCard({ title, amount, icon, color }: any) {
  return (
    <div className={`bg-white p-6 border border-[#edf2f9] border-l-4 ${color} shadow-sm flex items-center justify-between`}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#9da9bb] mb-1">{title}</p>
        <h3 className="text-xl font-bold text-[#344050]">Rp {amount.toLocaleString('id-ID')}</h3>
      </div>
      <div className="p-3 bg-slate-50 border border-[#edf2f9]">
        {icon}
      </div>
    </div>
  );
}