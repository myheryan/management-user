"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { 
  ResponsiveContainer, ComposedChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar
} from "recharts"
import { Download, ArrowRight, Activity, Wallet, Users } from "lucide-react"

// Shadcn UI Components
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

// --- Interface ---
interface Payment { month: number; amount: number; }
interface Member { id: number; name: string; username: string; payments: Payment[]; }
interface DashboardData {
  getDashboardSummary: { totalIncome: number; totalExpense: number; totalLoans: number; balance: number; };
  allTimeSummary: { balance: number; };
  getMembers: Member[];
  getAvailableYears: number[];
}

const GET_ANALYTICS = gql`
  query GetAnalytics($year: Int!) {
    getDashboardSummary(year: $year) { 
      totalIncome totalExpense totalLoans balance 
    }
    allTimeSummary: getDashboardSummary(year: 0) { 
      balance 
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

  if (loading) return <div className="p-10 font-sans text-[10px] text-slate-400 uppercase tracking-[0.2em]">Sinkronisasi Data...</div>;
  if (error) return <div className="p-10 text-red-500 font-sans text-[10px] uppercase tracking-widest text-center border border-red-100 bg-red-50">Error: {error.message}</div>;

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
    <div className="min-h-screen p-0 sm:p-6 font-sans font-normal text-slate-900 bg-white sm:bg-slate-50/30">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-0 sm:gap-6">
        
        {/* ================= SECTION 1: TOP ANALYTICS GRID ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 sm:gap-6">
          
          <div className="xl:col-span-5 flex flex-col gap-0 sm:gap-6">
            {/* Main Balance Card */}
            <div className="bg-white rounded-none border-b sm:border border-slate-200 p-8 flex flex-col justify-between shadow-none">
              <div>
                <h1 className="text-xl font-normal text-slate-900 tracking-tighter uppercase mb-1">Kas RT 07 Kencana</h1>
                <p className="text-slate-400 text-[10px] uppercase tracking-[0.3em]">Sistem Keuangan Warga</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">Kas Tersedia</p>
                    <h3 className="text-2xl font-normal text-blue-600 leading-none tracking-tighter">{formatIDR(allTimeBalance)}</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em]">Total Database</p>
                    <h3 className="text-2xl font-normal text-slate-800 leading-none tracking-tighter">{members.length} Warga</h3>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] uppercase tracking-[0.2em]">
                <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" /> System Active</span>
                <Link href="/members" className="text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors">Data Warga <ArrowRight size={10}/></Link>
              </div>
            </div>

            {/* Mini Summary Cards */}
            <div className="grid grid-cols-2 gap-0 border-b sm:border-none border-slate-200">
               <div className="bg-slate-900 text-white p-6 h-32 flex flex-col justify-between border-r border-slate-800">
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-50">In {selectedYear}</p>
                  <h3 className="text-base font-normal tracking-tight">{formatIDR(summary?.totalIncome)}</h3>
                  <div className="w-full h-[1px] bg-slate-700"><div className="bg-blue-500 h-full w-1/3" /></div>
               </div>
               <div className="bg-white p-6 h-32 flex flex-col justify-between sm:border border-slate-200 shadow-none">
                  <p className="text-[9px] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5"><Activity size={10}/> Activity</p>
                  <div className="h-8 w-full opacity-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData.slice(0, 6)}><Bar dataKey="income" fill="#cbd5e1" radius={0} barSize={3} /></BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[9px] text-slate-400 uppercase tracking-tighter italic">Year-to-date Sync</p>
               </div>
            </div>
          </div>

          <div className="xl:col-span-7 flex flex-col gap-0 sm:gap-6">
            {/* Stat Item Row */}
            <div className="grid grid-cols-3 bg-white border-b sm:border border-slate-200 shadow-none">
              <StatItem title="Pemasukan" val={formatIDR(summary?.totalIncome)} color="text-slate-900" />
              <StatItem title="Pengeluaran" val={formatIDR(summary?.totalExpense)} color="text-orange-600" />
              <StatItem title="Pinjaman" val={formatIDR(summary?.totalLoans)} color="text-emerald-600" />
            </div>

            {/* MAIN CHART AREA */}
            <div className="bg-white p-8 sm:border border-slate-200 min-h-[300px] flex flex-col shadow-none">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Visualisasi Arus Kas {selectedYear}</h2>
                <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val)}>
                  <SelectTrigger className="w-[100px] h-7 text-[10px] bg-slate-50 border-none rounded-none ring-0 shadow-none uppercase tracking-widest px-2 font-normal font-sans">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-slate-200 font-sans shadow-xl">
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-[10px] uppercase font-normal">{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyData} margin={{ left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'sans-serif' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'sans-serif' }} />
                    <Tooltip 
                      cursor={{stroke: '#f1f5f9', strokeWidth: 1}}
                      formatter={formatIDR} 
                      contentStyle={{ fontSize: '9px', borderRadius: '0', border: '1px solid #f1f5f9', textTransform: 'uppercase', fontFamily: 'sans-serif' }} 
                    />
                    <Area type="monotone" dataKey="income" stroke="#2563eb" fill="#eff6ff" fillOpacity={0.6} strokeWidth={1} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: COMPACT STICKY TABLE ================= */}
        <div className="mt-4 sm:mt-0 space-y-4">
          <div className="px-6 py-4 flex items-center justify-between bg-white sm:bg-transparent border-b sm:border-none border-slate-100">
            <h2 className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">Rincian Kontribusi Bulanan</h2>
            <button className="text-[9px] text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-1.5 uppercase tracking-widest">
              <Download size={12} strokeWidth={1.5}/> Unduh CSV
            </button>
          </div>
          
          <div className="bg-white sm:border border-slate-200 rounded-none shadow-none overflow-hidden flex flex-col">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative border-separate border-spacing-0">
              <table className="w-full text-left text-[11px] whitespace-nowrap table-fixed min-w-[1000px] font-sans">
                <thead className="sticky top-0 z-30 bg-slate-50 border-b border-slate-200">
                  <tr className="font-normal">
                    <th className="px-6 py-4 font-normal sticky left-0 top-0 bg-slate-50 z-40 w-[180px] border-r border-slate-200 uppercase tracking-[0.1em] text-[9px] text-slate-400">
                      Nama Warga
                    </th>
                    {MONTHS_SHORT.map((m) => (
                      <th key={m} className="px-2 py-4 font-normal text-center w-[75px] border-r border-slate-100/50 uppercase tracking-widest text-[9px] text-slate-400">
                        {m}
                      </th>
                    ))}
                    <th className="px-6 py-4 font-normal text-right w-[120px] bg-slate-50 uppercase tracking-widest text-[9px] text-slate-400">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => {
                    const totalIuranOrang = member.payments.reduce((sum, p) => sum + p.amount, 0);
                    return (
                      <tr key={member.id} className="hover:bg-slate-50/50 transition-none group">
                        {/* Sticky Name Column */}
                        <td className="px-6 py-3 font-normal text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50/80 z-20 border-r border-slate-200 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col">
                            <span className="leading-tight text-slate-900 font-medium">{member.name}</span>
                            <span className="text-[8px] text-slate-400 uppercase tracking-tighter">@{member.username}</span>
                          </div>
                        </td>
                        
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((monthIndex) => {
                          const payment = member.payments.find(p => p.month === monthIndex);
                          return (
                            <td key={monthIndex} className="px-2 py-3 text-center font-normal border-r border-slate-50 last:border-0">
                              {payment ? (
                                // LOGIKA WARNA: >= 20000 Hijau, < 20000 Orange
                                <span className={payment.amount < 20000 ? 'text-orange-400' : 'text-emerald-500'}>
                                  {payment.amount.toLocaleString('id-ID')}
                                </span>
                              ) : <span className="text-slate-100">---</span>}
                            </td>
                          );
                        })}

                        <td className="px-6 py-3 font-medium text-blue-600 text-right bg-slate-50/20 group-hover:bg-blue-50/30 transition-none">
                          {totalIuranOrang > 0 ? totalIuranOrang.toLocaleString('id-ID') : '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Scroll Indicator Mobile */}
            <div className="sm:hidden p-3 bg-slate-50 text-center text-[8px] text-slate-400 uppercase tracking-widest border-t border-slate-100 font-sans italic">
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
    <div className="bg-white p-6 border-r border-slate-100 last:border-0 flex flex-col justify-center transition-none font-sans shadow-none">
      <p className="text-[9px] font-normal text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <h4 className={`text-sm font-normal tracking-tight truncate ${color}`}>{val}</h4>
    </div>
  )
}