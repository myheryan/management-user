"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ReceiptText, Trash2, Save, Loader2, Filter, Paperclip } from 'lucide-react';
import { formatDate, formatIDR } from '@/lib/utils';
import { toast } from "sonner";

// Shadcn UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Interfaces ---
interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  receiptPath?: string;
}

interface ExpenseData {
  getExpenses: Expense[];
  getDashboardSummary: { totalExpense: number };
  getAvailableYears: number[];
}

// --- GQL Queries (Disesuaikan dengan Skema Kompleks) ---
const GET_EXPENSES_PAGE = gql`
  query GetExpensesPage($year: Int!) {
    getExpenses(year: $year) { id description amount category date receiptPath }
    getDashboardSummary(year: $year) { totalExpense }
    getAvailableYears
  }
`;

const ADD_EXPENSE = gql`
  mutation AddExpense($input: ExpenseInput!) {
    addExpense(input: $input) { id }
  }
`;

const DELETE_EXPENSE = gql`
  mutation DeleteExpense($id: Int!) {
    deleteExpense(id: $id)
  }
`;

export default function ExpensePage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  
  // Form States
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('OPERASIONAL');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { data, loading, refetch } = useQuery<ExpenseData>(GET_EXPENSES_PAGE, {
    variables: { year: parseInt(selectedYear) },
    fetchPolicy: 'cache-and-network'
  });

  const [addExpense, { loading: saving }] = useMutation(ADD_EXPENSE, {
    onCompleted: () => {
      setDescription('');
      setAmount('');
      refetch();
      toast.success("Catatan disimpan", {
        description: "Data pengeluaran telah diperbarui.",
        style: { borderRadius: '0px', fontFamily: 'sans-serif' }
      });
    },
    onError: (err) => toast.error("Gagal: " + err.message)
  });

  const [deleteExpense] = useMutation(DELETE_EXPENSE, {
    onCompleted: () => {
      refetch();
      toast.success("Data dihapus", { style: { borderRadius: '0px' } });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return toast.warning("Lengkapi formulir");
    
    addExpense({
      variables: {
        input: {
          description,
          amount: parseFloat(amount),
          category,
          date: new Date(date).toISOString(),
          year: new Date(date).getFullYear()
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-white sm:bg-slate-50/30 font-sans font-normal text-slate-900">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-0 sm:gap-6 sm:p-6">
        
        {/* Header Section */}
        <div className="bg-white border-b sm:border border-slate-200 p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-none">
          <div className="space-y-1">
            <h1 className="text-xl font-normal text-slate-900 tracking-tighter uppercase flex items-center gap-2">
              <ReceiptText size={20} className="text-orange-600"/> Arus Kas Keluar
            </h1>
            <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em]">Pencatatan Biaya & Operasional RT</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-none text-[10px] uppercase tracking-widest border-slate-200 h-8 px-4 transition-none" 
            onClick={() => router.push('/dashboard')}
          >
            <ChevronLeft size={14} className="mr-2"/> Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6">
          
          {/* SISI KIRI: Form Input (Compact) */}
          <div className="lg:col-span-4 bg-white border-b sm:border border-slate-200 p-8 shadow-none h-fit">
            <h2 className="text-[9px] font-normal text-slate-400 uppercase tracking-[0.3em] mb-8">Registrasi Biaya</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-slate-400">Keterangan / Keperluan</label>
                <Input 
                  placeholder="Misal: Gaji Keamanan Januari" 
                  className="rounded-none border-slate-200 text-xs h-10 shadow-none focus-visible:ring-0 focus:border-slate-400 transition-none" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-widest text-slate-400">Nominal (IDR)</label>
                <Input 
                  type="number" 
                  className="rounded-none border-slate-200 text-sm h-10 shadow-none focus-visible:ring-0 transition-none" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400">Kategori</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-none border-slate-200 text-[10px] h-10 shadow-none uppercase tracking-tighter"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-none font-sans">
                      <SelectItem value="OPERASIONAL" className="text-xs">OPERASIONAL</SelectItem>
                      <SelectItem value="PERBAIKAN" className="text-xs">PERBAIKAN</SelectItem>
                      <SelectItem value="SOSIAL" className="text-xs">SOSIAL</SelectItem>
                      <SelectItem value="GAJI_PETUGAS" className="text-xs">GAJI PETUGAS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest text-slate-400">Tanggal</label>
                  <Input 
                    type="date" 
                    className="rounded-none border-slate-200 text-[10px] h-10 shadow-none" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={saving} 
                className="w-full rounded-none bg-slate-900 hover:bg-black text-white text-[10px] uppercase tracking-[0.2em] h-12 mt-4 transition-none"
              >
                {saving ? <Loader2 className="animate-spin" size={16}/> : "Simpan Pengeluaran"}
              </Button>
            </form>
          </div>

          {/* SISI KANAN: Table List (Sticky Header) */}
          <div className="lg:col-span-8 bg-white border-b sm:border border-slate-200 flex flex-col shadow-none">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center px-8 h-16">
              <div className="flex items-center gap-4">
                <h2 className="text-[9px] font-normal text-slate-400 uppercase tracking-[0.3em]">Riwayat Transaksi</h2>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px] h-7 text-[9px] bg-white border-slate-200 rounded-none shadow-none uppercase tracking-widest px-2 font-normal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-sans">
                    <SelectItem value="0" className="text-[10px]">ALL TIME</SelectItem>
                    {data?.getAvailableYears.map(y => (
                      <SelectItem key={y} value={y.toString()} className="text-[10px]">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-slate-400 uppercase tracking-widest">Subtotal Pengeluaran</p>
                <p className="text-sm font-normal text-orange-600 tracking-tighter">{formatIDR(data?.getDashboardSummary?.totalExpense || 0)}</p>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
              <table className="w-full text-left text-[11px] border-separate border-spacing-0 min-w-[700px] font-sans">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-sm">
                  <tr>
                    <th className="px-8 py-4 font-normal border-b border-slate-200 uppercase text-[9px] tracking-widest text-slate-400">Tanggal</th>
                    <th className="px-4 py-4 font-normal border-b border-slate-200 uppercase text-[9px] tracking-widest text-slate-400">Deskripsi & Kategori</th>
                    <th className="px-8 py-4 font-normal border-b border-slate-200 uppercase text-[9px] tracking-widest text-slate-400 text-right">Nominal</th>
                    <th className="px-6 py-4 font-normal border-b border-slate-200 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-300 uppercase tracking-[0.3em] text-[9px]">Syncing...</td></tr>
                  ) : data?.getExpenses.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-300 uppercase text-[9px]">No data found</td></tr>
                  ) : (
                    data?.getExpenses.map((exp: Expense) => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-none group">
                        <td className="px-8 py-4 text-slate-400 tabular-nums">{formatDate(exp.date)}</td>
                        <td className="px-4 py-4">
                          <div className="text-slate-900 leading-tight">{exp.description}</div>
                          <div className="text-[8px] text-slate-400 uppercase tracking-tighter mt-1">{exp.category}</div>
                        </td>
                        <td className="px-8 py-4 text-right text-orange-600 tabular-nums font-medium">{formatIDR(exp.amount)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {exp.receiptPath && <Paperclip size={12} className="text-slate-300" />}
                            <button 
                              onClick={() => {
                                if(confirm(`Hapus "${exp.description}"?`)) {
                                  deleteExpense({ variables: { id: exp.id } });
                                }
                              }} 
                              className="text-slate-200 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[8px] text-slate-400 text-center uppercase tracking-[0.2em]">
              Records Sync: {data?.getExpenses.length || 0} Transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}