"use client";

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, User, Printer, CalendarDays, CheckCircle2, XCircle } from 'lucide-react';
import { formatIDR, formatDate } from '@/lib/utils';
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

const GET_MEMBER_DETAIL = gql`
  query GetMemberDetail($id: Int!) {
    getMemberDetail(id: $id) {
      id name
      payments { month year amount }
    }
  }
`;

export default function MemberDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { data, loading, error } = useQuery<MemberDetailData, MemberDetailVars>(GET_MEMBER_DETAIL, {
    variables: { id: parseInt(id as string) },
    fetchPolicy: 'network-only'
  });

  const handlePrint = () => window.print();

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;
  if (error) return <div className="p-10 text-red-500">Error: {error.message}</div>;
  if (!data?.getMemberDetail) return <div className="p-10 text-center">Data warga tidak ditemukan.</div>;

  const member = data.getMemberDetail;
  const totalPaid = member.payments.reduce((acc, p) => acc + p.amount, 0);
  const years = Array.from(new Set(member.payments.map(p => p.year))).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Action */}
        <div className="flex justify-between items-center print:hidden">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ChevronLeft size={16} /> Kembali
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer size={16} /> Cetak Laporan
          </Button>
        </div>

        {/* --- Card Profil Utama --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{member.name}</h1>
                <p className="text-sm text-slate-500 italic">ID Warga: #RT07-{member.id}</p>
              </div>
            </div>
            <div className="bg-slate-900 text-white p-4 px-6 rounded-lg text-right w-full md:w-auto">
              <p className="text-xs opacity-70 uppercase font-semibold tracking-wider mb-1">Total Kontribusi</p>
              <p className="text-2xl font-bold">{formatIDR(totalPaid)}</p>
            </div>
          </div>
        </div>

        {/* --- Riwayat Per Tahun --- */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Riwayat Pembayaran Iuran</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          {years.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400">
              Belum ada riwayat iuran yang tercatat untuk warga ini.
            </div>
          ) : (
            years.map((year) => (
              <div key={year} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Tahun */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <CalendarDays size={18} className="text-blue-500" />
                    Tahun {year}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    Total Tahun ini: <span className="text-blue-600 font-bold">{formatIDR(member.payments.filter(p => p.year === year).reduce((acc, p) => acc + p.amount, 0))}</span>
                  </div>
                </div>

                {/* Grid 12 Bulan */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                    const p = member.payments.find(pay => pay.year === year && pay.month === m);
                    return (
                      <div 
                        key={m} 
                        className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                          p 
                          ? 'border-emerald-200 bg-emerald-50/50' 
                          : 'border-slate-100 bg-slate-50 opacity-60'
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase text-slate-400">Bulan {m}</span>
                        <div className="flex items-center gap-1">
                          {p ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              <span className="text-sm font-semibold text-emerald-700">{p.amount.toLocaleString('id-ID')}</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="text-slate-300" />
                              <span className="text-sm font-medium text-slate-300">Kosong</span>
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

        {/* Footer Cetak (Hanya muncul saat Print) */}
        <div className="hidden print:grid grid-cols-2 gap-20 pt-20 text-center text-sm font-medium">
          <div className="space-y-20">
            <p>Bendahara RT 07</p>
            <div className="border-t border-slate-400 pt-2">( .................................... )</div>
          </div>
          <div className="space-y-20">
            <p>Warga</p>
            <div className="border-t border-slate-400 pt-2">{member.name}</div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          aside, nav, button, .print-hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}