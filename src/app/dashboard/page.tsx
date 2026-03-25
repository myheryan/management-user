"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { 
  ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar
} from "recharts"
import { Download, ArrowRight, Activity, ShieldCheck } from "lucide-react"

// Shadcn UI Components
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

// --- Interface ---
interface Payment { month: number; amount: number; }
interface Member { id: number; name: string; username: string; payments: Payment[]; }
interface DashboardData {
  getDashboardSummary: { totalIncome: number; totalExpense: number; totalLoans: number; balance: number; };
  allTimeSummary: { balance: number;  totalIncome: number; };
  getMembers: Member[];
  getAvailableYears: number[];
}

const GET_ANALYTICS = gql`
  query GetAnalytics($year: Int!) {
    getDashboardSummary(year: $year) { 
      totalIncome totalExpense totalLoans balance 
    }
    allTimeSummary: getDashboardSummary(year: 0) { 
      totalIncome balance
    }
    getMembers(year: $year) { 
      id name username payments { month amount } 
    }
    getAvailableYears
  }
`;

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function ProfessionalDashboard() {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  const { data, loading, error } = useQuery<DashboardData>(GET_ANALYTICS, {
    variables: { year: parseInt(selectedYear) },
    fetchPolicy: 'cache-and-network'
  });

  if (loading) return <div className="p-10 font-sans text-[11px] text-[#9da9bb] uppercase tracking-[0.2em] font-bold text-center">Sinkronisasi Data...</div>;
  if (error) return <div className="p-10 text-[#e63757] font-sans text-[11px] font-bold uppercase tracking-widest text-center border border-[#fbe9eb] bg-[#fff1f2] rounded-lg m-6">Error: {error.message}</div>;

  const summary = data?.getDashboardSummary;
  const allTimeBalance = data?.allTimeSummary?.balance || 0;
  const members = data?.getMembers || [];
  const availableYears = data?.getAvailableYears || [2024, 2025, 2026];

  const formatIDR = (val: any) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;

  const monthlyData = MONTHS_SHORT.map((m, i) => ({
    name: m,
    income: members.reduce((acc, mem) => acc + (mem.payments.find(p => p.month === i + 1)?.amount || 0), 0),
  }));

  return (
    <div className="min-h-screen p-0 sm:p-6">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-0 sm:gap-6">
        
        {/* ================= SECTION 1: TOP ANALYTICS GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 sm:gap-6">
          
          <div className="xl:col-span-5 flex flex-col gap-0 sm:gap-6">
            {/* Main Balance Card */}
            <div className="bg-white rounded-none sm:rounded-lg border-b sm:border border-[#edf2f9] p-8 flex flex-col justify-between shadow-none sm:shadow-sm">
              <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1">Kas RT 07 Kencana</h1>
                <p className="text-slate-500 text-xs font-light">Sistem Keuangan Warga</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-5">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700 font-medium">Kas Tersedia</p>
                    <h3 className="text-2xl text-sky-500 tracking-tighter font-medium">{formatIDR(data?.allTimeSummary.totalIncome)}</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700 font-medium">Total Anggota</p>
                    <h3 className="text-2xl text-orange-500 tracking-tighter font-medium">{members.length} Orang</h3>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-between items-center text-sm font-medium">
                <span className="text-[#00d27a] flex items-center gap-1.5"><ShieldCheck size={14} /> System Active</span>
                <Link href="/members" className="text-[#9da9bb] hover:text-[#2c7be5] flex items-center gap-1 transition-colors">Data Anggota <ArrowRight size={12}/></Link>
              </div>
            </div>

            {/* Mini Summary Cards */}
            <div className="grid grid-cols-2 gap-0 sm:gap-6 border-b sm:border-none border-[#edf2f9]">
                <div className="bg-sky-600 text-white p-6 h-32 flex flex-col justify-between sm:rounded-lg shadow-sm border-r sm:border-none border-[#0b1727]">
                  <p className="text-sm font-medium opacity-70">Kas Tersedia</p>
                  <h3 className="text-lg font-normal tracking-tight">{formatIDR(allTimeBalance)}</h3>
                  <div className="w-full h-[2px] bg-white rounded-full overflow-hidden"><div className="bg-[#ffbb00] h-full w-1/3" /></div>
               </div>
               <div className="bg-[#344050] text-white p-6 h-32 flex flex-col justify-between sm:rounded-lg shadow-sm border-r sm:border-none border-[#0b1727]">
                  <p className="text-sm font-medium opacity-70">Masuk {selectedYear}</p>
                  <h3 className="text-lg font-normal tracking-tight">{formatIDR(summary?.totalIncome)}</h3>
                  <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden"><div className="bg-[#2c7be5] h-full w-1/3" /></div>
               </div>

            </div>
          </div>

          <div className="xl:col-span-7 flex flex-col gap-0 sm:gap-6">
            {/* Stat Item Row */}
            <div className="grid grid-cols-3 bg-white border-b sm:border border-[#edf2f9] sm:rounded-lg shadow-none sm:shadow-sm">
              <StatItem title="Pemasukan" val={formatIDR(summary?.totalIncome)} color="text-[#344050]" />
              <StatItem title="Pengeluaran" val={formatIDR(summary?.totalExpense)} color="text-[#e63757]" />
              <StatItem title="Pinjaman" val={formatIDR(summary?.totalLoans)} color="text-[#00d27a]" />
            </div>

            {/* MAIN CHART AREA */}
            <div className="bg-white sm:rounded-lg min-h-[300px] flex flex-col shadow-none sm:shadow-sm overflow-hidden">
              <div className="bg-slate-100 px-6 py-4  flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-[#344050]  tracking-wider">Visualisasi Arus Kas {selectedYear}</h2>
                <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val || new Date().getFullYear().toString())} >
                  <SelectTrigger className="w-[100px] h-8 text-xs font-semibold bg-white border-[#d8e2ef] rounded-md shadow-none focus:ring-1 focus:ring-[#2c7be5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg border-[#edf2f9] font-sans shadow-lg">
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-xs">{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full min-h-[220px] p-6">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData} margin={{ left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9da9bb', fontSize: 11, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9da9bb', fontSize: 11, fontWeight: 500 }} />
                    <Tooltip 
                      cursor={{stroke: '#edf2f9', strokeWidth: 1}}
                      formatter={formatIDR} 
                      contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #edf2f9', boxShadow: '0 7px 14px 0 rgba(65, 69, 88, 0.1)', fontFamily: 'sans-serif' }} 
                    />
                    <Area type="monotone" dataKey="income" stroke="#2c7be5" fill="#2c7be5" fillOpacity={0.05} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: COMPACT STICKY TABLE ================= */}
        <div className="bg-white sm:border border-[#edf2f9] rounded-none sm:rounded-lg shadow-none sm:shadow-sm overflow-hidden mt-6 sm:mt-0 space-y-0">
          <div className="p-4 flex items-center justify-between sm:bg-transparent">
            <h2 className="text-[16px] font-semibold text-[#344050] uppercase tracking-wider">Rincian Bulanan ({selectedYear})</h2>
            <button className="text-[11px] font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 uppercase tracking-widest">
              <Download size={14} strokeWidth={2}/> Unduh CSV
            </button>
          </div>
          
          <div className="flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative border-separate border-spacing-0">
              {/* Tabel dibuat lebih padat (text-[11px] dan padding lebih tipis) */}
              <table className="w-full text-left text-[11px] whitespace-nowrap table-fixed min-w-[900px] font-sans">
                <thead className="sticky top-0 z-30 bg-blue-200 border-b border-bluw-400">
                  <tr>
                    {/* Padding dikurangi dari px-6 py-4 menjadi px-4 py-3 */}
                    <th className=" bg-blue-200 px-4 py-3 font-semibold sticky left-0 top-0 z-50 w-[150px] border-r border-[#edf2f9] text-sm">
                      Nama Warga
                    </th>
                    {MONTHS_SHORT.map((m) => (
                      <th key={m} className="px-2 py-3 font-semibold text-center border-r border-[#edf2f9]/50 z-30 text-sm">
                        {m}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-right w-[100px] text-sm">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f9]">
                  {members.map((member) => {
                    const totalIuranOrang = member.payments.reduce((sum, p) => sum + p.amount, 0);
                    return (
                      <tr key={member.id} className="hover:bg-slate-100 transition-colors group">
          
                        <td className="px-4 py-2.5 font-normal text-[#4d5969] sticky left-0 bg-white group-hover:bg-slate-100 z-20 border-r border-[#edf2f9] shadow-[5px_0_10px_-5px_rgba(0,0,0,0.05)]">
                          <span className="leading-tight text-[#344050] text-sm font-normal block truncate w-[130px]" title={member.name}>
                            {member.name}
                          </span>
                        </td>
                        
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthIndex) => {
                          const payment = member.payments.find(p => p.month === monthIndex);
                          return (
                            <td key={monthIndex} className="px-2 py-2.5 text-center font-normal border-r border-[#edf2f9]/30 last:border-0">
                              {payment ? (
                                <span className={`font-normal ${payment.amount < 20000 ? 'text-[#f5803e]' : 'text-emerald-600'}`}>
                                  {payment.amount.toLocaleString('id-ID')}
                                </span>
                              ) : <span className="text-[#d8e2ef]">---</span>}
                            </td>
                          );
                        })}

                        <td className="px-4 py-2.5 font-bold text-[#2c7be5] text-right bg-slate-100/30 group-hover:bg-slate-100 transition-colors">
                          {totalIuranOrang > 0 ? totalIuranOrang.toLocaleString('id-ID') : '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Scroll Indicator Mobile */}
            <div className="sm:hidden p-2 bg-slate-100 text-center text-xs text-slate-500 tracking-widest border-t border-[#edf2f9]">
              Geser untuk detail bulan →
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function StatItem({ title, val, color }: any) {
  return (
    <div className="bg-white p-6 border-r border-[#edf2f9] last:border-0 flex flex-col justify-center transition-none font-sans shadow-none">
      <p className="text-sm font-medium text-gray-700 uppercase mb-2">{title}</p>
      <h4 className={`text-base font-light tracking-tighter truncate ${color}`}>{val}</h4>
    </div>
  )
}