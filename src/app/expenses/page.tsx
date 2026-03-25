"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ReceiptText, Trash2, Save, Loader2, Info, Paperclip } from 'lucide-react';
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

// --- GQL Queries ---
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
  const [selectedYear, setSelectedYear] = useState<string>("0");  
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
        description: "Data pengeluaran telah diperbarui di database.",
      });
    },
    onError: (err) => toast.error("Gagal: " + err.message)
  });

  const [deleteExpense] = useMutation(DELETE_EXPENSE, {
    onCompleted: () => {
      refetch();
      toast.success("Data berhasil dihapus");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return toast.warning("Mohon lengkapi formulir");
    
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
    <div className="min-h-screen bg-[#f9fafd] p-0 sm:p-6 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-0 sm:gap-6">
        
        {/* Header Section */}
        <div className="bg-white sm:rounded-lg border-b sm:border border-[#edf2f9] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-none sm:shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-[#344050] flex items-center gap-2">
              <ReceiptText size={24} className="text-orange-500"/> Arus Kas Keluar
            </h1>
            <p className="text-slate-500 text-xs font-light">Pencatatan Biaya & Operasional RT</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-md text-sm border-[#d8e2ef] h-10 px-4 hover:bg-slate-50 transition-colors" 
            onClick={() => router.push('/dashboard')}
          >
            <ChevronLeft size={16} className="mr-1"/> Kembali ke Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6">
          
          {/* SISI KIRI: Form Input */}
          <div className="lg:col-span-4 bg-white sm:rounded-lg border-b sm:border border-[#edf2f9] shadow-none sm:shadow-sm h-fit overflow-hidden">
            <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-b border-[#edf2f9]">
              <h2 className="text-[16px] font-semibold text-[#344050] tracking-wider">Registrasi Biaya</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Keterangan / Keperluan</label>
                  <Input 
                    placeholder="Misal: Perbaikan Pompa Air" 
                    className="rounded-md border-[#d8e2ef] text-sm h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-[#2c7be5]" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nominal (Rp)</label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    className="rounded-md border-[#d8e2ef] text-sm h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-[#2c7be5]" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Kategori</label>
                    <Select value={category} onValueChange={(val) => setCategory(val || 'OPERASIONAL')}>
                      <SelectTrigger className="rounded-md border-[#d8e2ef] text-sm h-10 shadow-sm focus:ring-1 focus:ring-[#2c7be5]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-md font-sans">
                        <SelectItem value="OPERASIONAL" className="text-sm">Operasional</SelectItem>
                        <SelectItem value="PERBAIKAN" className="text-sm">Perbaikan</SelectItem>
                        <SelectItem value="SOSIAL" className="text-sm">Sosial / Warga</SelectItem>
                        <SelectItem value="GAJI_PETUGAS" className="text-sm">Gaji Petugas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Tanggal</label>
                    <Input 
                      type="date" 
                      className="rounded-md border-[#d8e2ef] text-sm h-10 shadow-sm focus-visible:ring-1 focus-visible:ring-[#2c7be5]" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)} 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full rounded-md bg-[#2c7be5] hover:bg-blue-600 text-white font-medium text-sm h-11 mt-2 transition-all shadow-sm"
                >
                  {saving ? <Loader2 className="animate-spin" size={18}/> : "Simpan Pengeluaran"}
                </Button>
              </form>
            </div>
          </div>

          {/* SISI KANAN: Table List */}
          <div className="lg:col-span-8 bg-white sm:rounded-lg sm:border border-[#edf2f9] shadow-none sm:shadow-sm flex flex-col overflow-hidden mt-6 sm:mt-0">
            
            {/* Table Header Controls */}
            <div className="bg-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#edf2f9] gap-4">
              <h2 className="text-[16px] font-semibold text-[#344050] tracking-wider">Riwayat Transaksi</h2>
              
              <div className="flex items-center gap-4">
                <Select value={selectedYear} onValueChange={(val) => setSelectedYear(val || "0")}>
                  <SelectTrigger className="w-[130px] h-9 text-sm font-semibold bg-white border-[#d8e2ef] rounded-md shadow-sm focus:ring-1 focus:ring-[#2c7be5]">
                    <SelectValue placeholder="Semua Tahun" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md font-sans border-[#edf2f9]">
                    <SelectItem value="0" className="text-sm font-semibold text-[#2c7be5]">Semua Tahun</SelectItem>
                    {data?.getAvailableYears.map(y => (
                      <SelectItem key={y} value={y.toString()} className="text-sm">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subtotal Summary */}
            <div className="px-6 py-4 border-b border-[#edf2f9] bg-white flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-700 font-medium">Total Pengeluaran ({selectedYear === "0" ? "Semua Waktu" : selectedYear})</p>
                <p className="text-2xl text-orange-500 tracking-tighter font-medium">{formatIDR(data?.getDashboardSummary?.totalExpense || 0)}</p>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
              <table className="w-full text-left text-sm whitespace-nowrap table-fixed min-w-[600px] font-sans">
                <thead className="sticky top-0 z-10 bg-blue-200 border-b border-blue-300">
                  <tr>
                    <th className="bg-blue-200 px-6 py-3 font-semibold text-[#344050] w-[140px] border-r border-blue-300/50">Tanggal</th>
                    <th className="bg-blue-200 px-6 py-3 font-semibold text-[#344050] border-r border-blue-300/50">Deskripsi Transaksi</th>
                    <th className="bg-blue-200 px-6 py-3 font-semibold text-[#344050] text-right w-[160px] border-r border-blue-300/50">Nominal</th>
                    <th className="bg-blue-200 px-4 py-3 font-semibold text-[#344050] w-16">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf2f9]">
                  {loading ? (
                    <tr><td colSpan={4} className="p-12 text-center text-slate-400 font-medium">Memuat data...</td></tr>
                  ) : data?.getExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Info size={24} className="text-slate-300" />
                          <p>Belum ada catatan pengeluaran di tahun ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data?.getExpenses.map((exp: Expense) => (
                      <tr key={exp.id} className="hover:bg-slate-100 transition-colors group">
                        <td className="px-6 py-3 text-slate-500 border-r border-[#edf2f9]/50">{formatDate(exp.date)}</td>
                        <td className="px-6 py-3 border-r border-[#edf2f9]/50">
                          <div className="text-[#344050] font-medium leading-tight">{exp.description}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{exp.category.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-3 text-right font-medium text-orange-500 border-r border-[#edf2f9]/50">
                          {formatIDR(exp.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center items-center gap-3">
                            {exp.receiptPath && <Paperclip size={14} className="text-slate-400" />}
                            <button 
                              onClick={() => {
                                if(confirm(`Yakin ingin menghapus pengeluaran "${exp.description}"?`)) {
                                  deleteExpense({ variables: { id: exp.id } });
                                }
                              }} 
                              className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                              title="Hapus Catatan"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-[#edf2f9] text-xs text-slate-500 text-center font-medium">
              Menampilkan {data?.getExpenses.length || 0} catatan pengeluaran
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}