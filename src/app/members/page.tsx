"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, Search, Trash2, ExternalLink, 
  ChevronLeft, Mail, Phone, Shield, Wallet, User as UserIcon
} from 'lucide-react';
import { toast } from "sonner";

// Komponen Anda
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ActionMenu from "@/components/ActionMenu";
import AddMemberModal from "@/components/AddMemberModal"; // Import Modal

// --- Interfaces ---
interface Member {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  phoneNumber?: string;
}

interface MembersData {
  getMembers: Member[];
}

interface MembersVars {
  year: number;
}

// --- GQL Queries ---
const GET_MEMBERS = gql`
  query GetMembers($year: Int!) {
    getMembers(year: $year) {
      id name email username role phoneNumber
    }
  }
`;

const DELETE_MEMBER = gql`
  mutation DeleteMember($id: Int!) {
    deleteMember(id: $id)
  }
`;

export default function MembersPage() {
  const router = useRouter();
  
  // State untuk Modal & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tempName, setTempName] = useState(''); // Nama yang diketik sebelum masuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, loading, refetch } = useQuery<MembersData, MembersVars>(GET_MEMBERS, {
    variables: { year: 2026 },
    fetchPolicy: 'cache-and-network'
  });

  const [deleteMember] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      refetch();
      toast.success("Data warga dihapus");
    }
  });

  // Saat tombol simpan di baris tabel diklik, buka Modal!
  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return toast.warning("Ketik nama warga terlebih dahulu!");
    setIsModalOpen(true);
  };

  const confirmDelete = (id: number, name: string) => {
    if(confirm(`Yakin ingin menghapus data warga "${name}"?`)) {
      deleteMember({ variables: { id } });
    }
  };

  const filteredMembers = data?.getMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield size={14} className="text-purple-500" />;
      case 'BENDAHARA': return <Wallet size={14} className="text-orange-500" />;
      default: return <UserIcon size={14} className="text-[#9da9bb]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafd] p-0 sm:p-6 font-sans">
      
      {/* --- MOUNT MODAL DISINI --- */}
      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialName={tempName}
        onSuccess={() => {
          setTempName(''); // Kosongkan inputan luar setelah sukses
          refetch(); // Ambil data terbaru
        }}
      />

      <div className="max-w-[1600px] mx-auto flex flex-col gap-0 sm:gap-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 pt-6 sm:px-0 sm:pt-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1 text-[#344050] flex items-center gap-2">
              <Users size={24} className="text-[#2c7be5]"/> Database Warga
            </h1>
            <p className="text-[#9da9bb] text-[11px] font-bold uppercase tracking-widest">Kelola direktori penduduk RT 07 secara terpusat</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-md text-sm font-semibold border-[#d8e2ef] text-[#4d5969] h-9 px-4 hover:bg-white hover:text-[#2c7be5] transition-colors shadow-sm hidden sm:flex" 
            onClick={() => router.push('/dashboard')}
          >
            <ChevronLeft size={16} className="mr-1"/> Dashboard
          </Button>
        </div>

        {/* FULL-WIDTH CARD */}
        <div className="bg-white sm:rounded-lg sm:border border-[#edf2f9] shadow-none sm:shadow-sm flex flex-col overflow-hidden">
          
          {/* TOOLBAR */}
          <div className="p-4 flex flex-col lg:flex-row justify-between items-center gap-3 bg-white border-b border-[#edf2f9]">
            <h2 className="text-[14px] font-semibold text-[#344050] tracking-wider uppercase w-full lg:w-auto hidden sm:block">Semua Warga</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9da9bb]" size={14} />
                <Input 
                  placeholder="Cari warga..." 
                  className="pl-9 h-9 text-xs bg-white border-[#d8e2ef] rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-[#2c7be5] text-[#4d5969] w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Form Memicu Buka Modal */}
              <form onSubmit={handleOpenModal} className="flex gap-2 w-full sm:w-auto">
                <Input 
                  placeholder="Nama Baru"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="h-9 text-xs border-[#d8e2ef] rounded-md shadow-sm focus-visible:ring-1 focus-visible:ring-[#2c7be5] text-[#4d5969] w-full sm:w-[180px]"
                />
                <Button 
                  type="submit" 
                  className="h-9 rounded-md bg-[#2c7be5] hover:bg-[#1b5cb3] text-white font-semibold text-xs px-3 sm:px-4 shadow-sm transition-colors whitespace-nowrap"
                >
                  <UserPlus size={14} className="sm:mr-1.5"/> <span className="hidden sm:inline">Tambah Data</span>
                </Button>
              </form>
            </div>
          </div>

          {/* TABLE AREA */}
          <div className="overflow-x-hidden overflow-y-auto max-h-[700px]">
            <table className="w-full text-left text-[13px] whitespace-nowrap font-sans">
              <thead className="sticky top-0 z-10 bg-[#f9fafd]">
                <tr>
                  <th className="bg-[#f9fafd] px-4 py-2.5 font-bold text-[#9da9bb] uppercase tracking-widest text-[10px] border-y border-[#edf2f9] max-w-[200px]">Profil Warga</th>
                  <th className="bg-[#f9fafd] px-4 py-2.5 font-bold text-[#9da9bb] uppercase tracking-widest text-[10px] border-y border-[#edf2f9] sm:table-cell">Kontak Warga</th>
                  <th className="bg-[#f9fafd] px-2 py-2.5 font-bold text-[#9da9bb] uppercase tracking-widest text-[10px] border-y border-[#edf2f9] text-center w-[40px]">Hak</th>
                  <th className="bg-[#f9fafd] px-4 py-2.5 font-bold text-[#9da9bb] uppercase tracking-widest text-[10px] border-y border-[#edf2f9] text-right w-[80px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2f9]">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-[#9da9bb] text-[10px] font-bold uppercase tracking-widest">Memuat database...</td></tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center text-[#9da9bb] gap-3">
                        <Users size={28} className="opacity-50" />
                        <p className="text-xs font-medium">Data warga tidak ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-[#f9fafd] transition-colors group">
                      
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2c7be5] flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0">
                            {getInitials(m.name)}
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-semibold text-[#344050] text-[13px] truncate">{m.name}</span>
                            <span className="text-[10px] text-[#9da9bb] font-medium tracking-tight truncate">@{m.username || 'user'}</span>
                            
                            {m.phoneNumber && (
                              <div className="flex items-center gap-1 mt-0.5 text-[#4d5969] sm:hidden">
                                <Phone size={8} className="text-[#9da9bb]" />
                                <span className="text-[9px]">{m.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 sm:table-cell">
                        <div className="flex flex-col gap-1 text-[11px] text-[#4d5969]">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail size={10} className="text-[#9da9bb]" /> 
                            {m.email || <span className="text-slate-300 italic">No Email</span>}
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Phone size={10} className="text-[#9da9bb]" /> 
                            {m.phoneNumber || <span className="text-slate-300 italic">No Phone</span>}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <div 
                          className="flex justify-center items-center w-full"
                          title={`Hak Akses: ${m.role}`} 
                        >
                          <div className={`p-1.5 rounded-md border bg-white shadow-sm ${
                            m.role === 'ADMIN' ? 'border-purple-200 bg-purple-50' : 
                            m.role === 'BENDAHARA' ? 'border-orange-200 bg-orange-50' : 
                            'border-slate-200'
                          }`}>
                            {getRoleIcon(m.role)}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                           <ActionMenu 
                              items={[
                                {
                                  label: "Detail Profil",
                                  icon: <ExternalLink size={14} />,
                                  onClick: () => router.push(`/members/${m.id}`),
                                },
                                {
                                  label: "Hapus Warga",
                                  icon: <Trash2 size={14} />,
                                  onClick: () => confirmDelete(m.id, m.name),
                                  isDanger: true, 
                                }
                              ]}
                            />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* FOOTER */}
          <div className="p-3 bg-[#f9fafd] border-t border-[#edf2f9] flex justify-center sm:justify-end items-center">
            <p className="text-[10px] font-bold text-[#9da9bb] uppercase tracking-widest">
              Menampilkan <span className="text-[#344050]">{filteredMembers.length}</span> warga
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}