"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, User, Calendar, Check, ChevronRight, 
  ShieldCheck, Info, Loader2 
} from 'lucide-react';
import { toast } from "sonner";

// Shadcn UI (Hanya mengambil elemen input/select)
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// --- Interfaces ---
interface MembersData {
  getMembers: {
    id: number;
    name: string;
    username: string;
    payments: { month: number; amount: number; year: number; }[];
  }[];
}

// --- GQL ---
const GET_MEMBERS_LIST = gql`
  query GetMembersList($year: Int!) {
    getMembers(year: $year) {
      id name username
      payments { month amount year }
    }
  }
`;

const ADD_PAYMENT = gql`
  mutation AddPayment($input: PaymentInput!) {
    addPayment(input: $input)
  }
`;

const MONTHS = [
  { id: 1, name: 'Januari' }, { id: 2, name: 'Februari' }, { id: 3, name: 'Maret' },
  { id: 4, name: 'April' }, { id: 5, name: 'Mei' }, { id: 6, name: 'Juni' },
  { id: 7, name: 'Juli' }, { id: 8, name: 'Agustus' }, { id: 9, name: 'September' },
  { id: 10, name: 'Oktober' }, { id: 11, name: 'November' }, { id: 12, name: 'Desember' }
];

export default function CompactCheckout() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMember, setSelectedMember] = useState<number | ''>('');
  const [amount, setAmount] = useState<number>(25000);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  
  const { data, loading } = useQuery<MembersData>(GET_MEMBERS_LIST, {
    variables: { year: selectedYear },
    fetchPolicy: 'cache-and-network',
  });

  const [addPayment, { loading: saving }] = useMutation(ADD_PAYMENT, {
    onCompleted: () => {
      toast.success("Pembayaran Berhasil Dicatat");
      router.push('/dashboard');
    },
    onError: (err) => toast.error(err.message),
  });

  const activeMember = data?.getMembers.find(m => m.id === selectedMember);
  const paidMonths = activeMember?.payments.filter(p => p.year === selectedYear).map(p => p.month) || [];

  const toggleMonth = (id: number) => {
    if (paidMonths.includes(id)) return;
    setSelectedMonths(prev => {
      if (prev.includes(id)) return prev.filter(m => m < id);
      const isPrevValid = id === 1 || paidMonths.includes(id - 1) || prev.includes(id - 1);
      if (!isPrevValid) return prev;
      return [...prev, id].sort((a, b) => a - b);
    });
  };

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || selectedMonths.length === 0) return toast.error("Data belum lengkap");
    addPayment({
      variables: {
        input: { memberId: selectedMember, year: selectedYear, months: selectedMonths, amount, category: "IURAN_WAJIB" }
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f9fafd] font-sans">
      {/* Header Kecil */}
      <header className="bg-white border-b border-[#edf2f9] px-6 py-2.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#2c7be5]" />
          <span className="text-sm font-bold text-[#2c7be5] tracking-tight">FALCON CHECKOUT</span>
        </div>
        <button onClick={() => router.back()} className="text-[11px] font-medium text-slate-500 hover:text-[#2c7be5] flex items-center gap-1">
          <ChevronLeft size={14}/> BACK TO DASHBOARD
        </button>
      </header>

      <main className="max-w-6xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* SISI KIRI: Form List */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Detail Billing */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#2c7be5]">1</span>
                <h2 className="text-sm font-bold uppercase tracking-wider">Detail Penagihan</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Pilih Warga</Label>
                  <Select value={selectedMember.toString()} onValueChange={(v) => { setSelectedMember(parseInt(v)); setSelectedMonths([]); }}>
                    <SelectTrigger className="h-9 rounded-md border-[#d8e2ef] bg-white text-xs">
                      <SelectValue placeholder="Pilih Nama..." />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.getMembers.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()} className="text-xs">{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-400">Tahun</Label>
                  <Select value={selectedYear.toString()} onValueChange={(v) => { setSelectedYear(parseInt(v)); setSelectedMonths([]); }}>
                    <SelectTrigger className="h-9 rounded-md border-[#d8e2ef] bg-white text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* 2. Pemilihan Bulan */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#2c7be5]">2</span>
                <h2 className="text-sm font-bold uppercase tracking-wider">Periode Pembayaran</h2>
              </div>
              
              <div className="ml-8">
                {!selectedMember ? (
                  <div className="flex items-center gap-2 p-3 bg-blue-50/50 text-[#2c7be5] rounded border border-blue-100/50 text-[11px]">
                    <Info size={14} /> Pilih warga untuk melihat status iuran.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {MONTHS.map(m => {
                      const isPaid = paidMonths.includes(m.id);
                      const isSelected = selectedMonths.includes(m.id);
                      const isPrevValid = m.id === 1 || paidMonths.includes(m.id - 1) || selectedMonths.includes(m.id - 1);
                      const disabled = isPaid || (!isSelected && !isPrevValid);

                      return (
                        <button
                          key={m.id}
                          disabled={disabled}
                          onClick={() => toggleMonth(m.id)}
                          className={`
                            h-14 rounded border flex flex-col items-center justify-center transition-all text-center
                            ${isPaid ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50' : 
                              isSelected ? 'bg-[#2c7be5] border-[#2c7be5] text-white shadow-sm' : 
                              disabled ? 'bg-white border-slate-100 opacity-30 cursor-not-allowed' : 
                              'bg-white border-[#d8e2ef] hover:border-[#2c7be5] text-slate-600'}
                          `}
                        >
                          <span className="text-[8px] font-bold uppercase opacity-60">BLN {m.id}</span>
                          <span className="text-[11px] font-semibold">{m.name.slice(0, 3)}</span>
                          {isPaid && <Check size={10} className="mt-0.5 text-emerald-500" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* SISI KANAN: Order Summary (Sidebar) */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#edf2f9] rounded-lg p-6 sticky top-20 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Ringkasan Pesanan</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium tracking-tight">Warga</span>
                  <span className="text-slate-800 font-semibold">{activeMember?.name || '-'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-medium tracking-tight">Kuantitas</span>
                  <span className="text-slate-800 font-semibold">{selectedMonths.length} Bulan</span>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Nominal / Bulan</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-semibold">Rp</span>
                    <Input 
                      type="number" 
                      className="h-8 pl-8 rounded border-[#d8e2ef] text-xs font-semibold focus-visible:ring-[#2c7be5]" 
                      value={amount} 
                      onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <Separator className="my-4 bg-[#edf2f9]" />

                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Total Due</span>
                  <span className="text-xl font-bold text-[#2c7be5] tracking-tighter">
                    Rp {(amount * selectedMonths.length).toLocaleString('id-ID')}
                  </span>
                </div>

                <Button 
                  onClick={handleProcess}
                  disabled={saving || selectedMonths.length === 0}
                  className="w-full bg-[#2c7be5] hover:bg-[#1b5cb3] text-white rounded h-11 text-xs font-bold shadow-none mt-4 uppercase tracking-widest transition-all"
                >
                  {saving ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Proses Pembayaran"}
                </Button>
                
                <div className="flex items-center justify-center gap-1.5 mt-4 opacity-40">
                  <ShieldCheck size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">Secure RT 07 System</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}