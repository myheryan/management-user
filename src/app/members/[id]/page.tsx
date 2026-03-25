"use client";

import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, User, Printer, CalendarDays, CheckCircle2, XCircle, Trash2, Loader2, Info } from 'lucide-react';
import { formatIDR } from '@/lib/utils';
import { toast } from "sonner";

// Shadcn UI
import { Button } from "@/components/ui/button";

// --- Interfaces ---
interface Payment {
  month: number;
  year: number;
  amount: number;
}

interface MemberDetail {
  id: number;
  name: string;
  payments: Payment[];
}

interface MemberDetailData {
  getMemberDetail: MemberDetail;
}

interface MemberDetailVars {
  id: number;
}

// --- GQL Queries & Mutations ---
const GET_MEMBER_DETAIL = gql`
  query GetMemberDetail($id: Int!) {
    getMemberDetail(id: $id) {
      id name
      payments { month year amount }
    }
  }
`;

const DELETE_MEMBER = gql`
  mutation DeleteMember($id: Int!) {
    deleteMember(id: $id)
  }
`;

// Array bulan yang di-reverse (12 ke 1)
const MONTHS_REVERSED = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { data, loading, error } = useQuery<MemberDetailData, MemberDetailVars>(GET_MEMBER_DETAIL, {
    variables: { id: parseInt(id as string) },
    fetchPolicy: 'network-only'
  });

  const [deleteMember, { loading: deleting }] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      toast.success("Warga berhasil dihapus", {
        description: "Data dan riwayat iuran telah bersih dari sistem."
      });
      router.push('/members');
    },
    onError: (err) => toast.error("Gagal menghapus: " + err.message)
  });

  const handlePrint = () => window.print();

  const handleDelete = () => {
    if(confirm("Yakin ingin menghapus warga ini beserta seluruh riwayat iurannya? Tindakan ini tidak dapat dibatalkan.")) {
      deleteMember({ variables: { id: parseInt(id as string) } });
    }
  };

  if (loading) return <div className="p-10 font-sans text-[11px] text-[#9da9bb] uppercase tracking-[0.2em] font-bold text-center">Memuat Data Warga...</div>;
  if (error) return <div className="p-10 text-[#e63757] font-sans text-[11px] font-bold uppercase tracking-widest text-center border border-[#fbe9eb] bg-[#fff1f2] rounded-lg m-6">Error: {error.message}</div>;
  if (!data?.getMemberDetail) return <div className="p-10 text-center font-sans text-[#9da9bb] text-sm font-medium">Data warga tidak ditemukan.</div>;

  const member = data.getMemberDetail;
  const totalPaid = member.payments.reduce((acc, p) => acc + p.amount, 0);
  const years = Array.from(new Set(member.payments.map(p => p.year))).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-[#f9fafd] p-0 sm:p-6 font-sans print:bg-white print:p-0">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-0 sm:gap-6">
        
        {/* Header Section */}
        <div className="bg-white sm:rounded-lg border-b sm:border border-[#edf2f9] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-none sm:shadow-sm print:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-[#344050] flex items-center gap-2">
              <User size={24} className="text-[#2c7be5]"/> Profil & Riwayat Warga
            </h1>
            <p className="text-slate-500 text-xs font-light">Detail informasi dan kontribusi kas bulanan</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()} 
            className="rounded-md text-sm border-[#d8e2ef] h-10 px-4 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={16} className="mr-1"/> Kembali ke Daftar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6">
          
          {/* SISI KIRI: Sidebar Profil Warga */}
          <div className="lg:col-span-4 bg-white sm:rounded-lg border-b sm:border border-[#edf2f9] shadow-none sm:shadow-sm h-fit overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-b border-[#edf2f9]">
              <h2 className="text-[16px] font-semibold text-[#344050] tracking-wider">Informasi Warga</h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center text-center gap-4 mb-6">
                <div className="w-24 h-24 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-[#2c7be5] shadow-sm">
                  <User size={40} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#344050] tracking-tight leading-none mb-1.5">{member.name}</h2>
                  <p className="text-xs font-medium text-slate-500">ID Warga: #RT07-{member.id}</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-[#edf2f9] p-4 rounded-md text-center mb-6">
                <p className="text-sm text-gray-700 font-medium mb-1">Total Kontribusi Keseluruhan</p>
                <p className="text-2xl font-semibold text-[#00d27a] tracking-tighter">{formatIDR(totalPaid)}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 border-t border-[#edf2f9] print:hidden">
                <Button 
                  variant="outline" 
                  onClick={handlePrint} 
                  className="w-full rounded-md text-sm border-[#d8e2ef] h-10 hover:bg-slate-50 text-[#344050]"
                >
                  <Printer size={16} className="mr-2" /> Cetak Laporan
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full rounded-md text-sm border-[#fbe9eb] h-10 bg-[#fff1f2] text-[#e63757] hover:bg-[#e63757] hover:text-white transition-colors"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                  Hapus Warga
                </Button>
              </div>
            </div>
          </div>

          {/* SISI KANAN: Daftar Riwayat Pembayaran */}
          <div className="lg:col-span-8 bg-white sm:rounded-lg sm:border border-[#edf2f9] shadow-none sm:shadow-sm flex flex-col overflow-hidden mt-6 sm:mt-0">
            <div className="bg-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#edf2f9] gap-4">
              <h2 className="text-[16px] font-semibold text-[#344050] tracking-wider">Riwayat Pembayaran Bulanan</h2>
            </div>

            {/* Dihapus max-h dan overflow-y agar komponen bisa memanjang ke bawah dengan natural */}
            <div className="p-6 space-y-6 bg-white">
              {years.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-12">
                  <Info size={32} className="opacity-50 mb-2" />
                  <p className="text-sm font-medium">Belum ada riwayat iuran yang tercatat untuk warga ini.</p>
                </div>
              ) : (
                years.map((year) => (
                  <div key={year} className="border border-[#edf2f9] rounded-md overflow-hidden shadow-sm">
                    
                    {/* Header Tahun (Di-style identik dengan header tabel di Expense) */}
                    <div className="bg-blue-200 px-6 py-3 border-b border-blue-300 flex justify-between items-center">
                      <span className="font-semibold text-sm text-[#344050] flex items-center gap-2">
                        <CalendarDays size={16} className="text-[#344050]"/> Tahun {year}
                      </span>
                      <span className="font-semibold text-sm text-[#344050]">
                        Subtotal: {formatIDR(member.payments.filter(p => p.year === year).reduce((acc, p) => acc + p.amount, 0))}
                      </span>
                    </div>

                    {/* Grid 12 Bulan (Di-reverse agar bulan 12 di atas) */}
                    <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 bg-[#f9fafd]">
                      {MONTHS_REVERSED.map(m => {
                        const p = member.payments.find(pay => pay.year === year && pay.month === m);
                        return (
                          <div 
                            key={m} 
                            className={`p-3 rounded-md border flex flex-col justify-center items-center gap-1.5 transition-all text-center bg-white ${
                              p ? 'border-emerald-200 shadow-sm' : 'border-[#edf2f9] opacity-70'
                            }`}
                          >
                            <span className={`text-[11px] font-bold uppercase tracking-widest ${p ? 'text-[#00d27a]' : 'text-slate-400'}`}>
                              Bulan {m}
                            </span>
                            <div className="flex items-center justify-center gap-1.5 w-full mt-0.5">
                              {p ? (
                                <>
                                  <CheckCircle2 size={14} className="text-[#00d27a]" />
                                  <span className="text-sm font-semibold text-[#344050]">{p.amount.toLocaleString('id-ID')}</span>
                                </>
                              ) : (
                                <>
                                  <XCircle size={14} className="text-slate-300" />
                                  <span className="text-xs font-medium text-slate-400">Kosong</span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Cetak (Hanya muncul saat CTRL+P / Print PDF) */}
        <div className="hidden print:grid grid-cols-2 gap-20 pt-20 text-center text-sm font-medium text-[#344050]">
          <div className="space-y-20">
            <p className="font-bold">Bendahara RT 07</p>
            <div className="border-t border-[#344050] pt-2">( .................................... )</div>
          </div>
          <div className="space-y-20">
            <p className="font-bold">Warga</p>
            <div className="border-t border-[#344050] pt-2">{member.name}</div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; -webkit-print-color-adjust: exact; }
          aside, nav, button, .print-hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}