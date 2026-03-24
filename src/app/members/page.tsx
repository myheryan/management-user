
"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  ExternalLink, 
  Loader2,
  UserCircle
} from 'lucide-react';
import { toast } from "sonner";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// --- 1. Definisi Interface (Solusi Error Anda) ---
interface Member {
  id: number;
  name: string;
}

interface MembersData {
  getMembers: Member[];
}

interface MembersVars {
  year: number;
}

// --- 2. GQL Queries ---
const GET_MEMBERS = gql`
  query GetMembers($year: Int!) {
    getMembers(year: $year) {
      id
      name
    }
  }
`;

const ADD_MEMBER = gql`
  mutation AddMember($name: String!) {
    addMember(name: $name) {
      id
      name
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
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // --- 3. Terapkan Interface pada useQuery ---
  const { data, loading, refetch } = useQuery<MembersData, MembersVars>(GET_MEMBERS, {
    variables: { year: 2026 },
  });

  const [addMember, { loading: adding }] = useMutation(ADD_MEMBER, {
    onCompleted: () => {
      setNewName('');
      refetch();
      toast.success("Warga berhasil ditambahkan", {
        description: "Data telah disinkronkan ke database.",
      });
    },
    onError: (err) => toast.error("Gagal: " + err.message)
  });

  const [deleteMember] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      refetch();
      toast.success("Data warga dihapus");
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.warning("Isi nama warga");
    addMember({ variables: { name: newName } });
  };

  const confirmDelete = (id: number, name: string) => {
    toast(`Hapus data ${name}?`, {
      action: {
        label: 'Hapus',
        onClick: () => deleteMember({ variables: { id } }),
      },
    });
  };

  // Logic Pencarian (Sekarang TypeScript tahu data.getMembers ada)
  const filteredMembers = data?.getMembers.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-blue-600" /> Manajemen Warga
          </h1>
          <p className="text-sm text-slate-500">Kelola daftar penduduk RT 07 secara terpusat.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Tambah */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden">
              <CardHeader className="bg-white">
                <CardTitle className="text-base font-semibold">Registrasi Baru</CardTitle>
                <CardDescription className="text-xs">Input nama lengkap warga baru.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdd} className="space-y-4">
                  <Input 
                    placeholder="Nama Lengkap"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="rounded-lg bg-white"
                  />
                  <Button disabled={adding} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">
                    {adding ? <Loader2 className="animate-spin" size={16} /> : <><UserPlus size={16} className="mr-2"/> Simpan</>}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tabel Daftar */}
          <div className="lg:col-span-8">
            <Card className="shadow-sm border-slate-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input 
                    placeholder="Cari warga..." 
                    className="pl-10 h-10 bg-slate-50/50 border-slate-200 rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Total: {filteredMembers.length}
                </div>
              </div>

              <div className="bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-semibold">Nama Warga</TableHead>
                      <TableHead className="text-right font-semibold">Opsi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-32 text-center text-slate-400">Memuat...</TableCell>
                      </TableRow>
                    ) : filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="h-32 text-center text-slate-400 italic">Tidak ada data.</TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((m) => (
                        <TableRow key={m.id} className="group hover:bg-slate-50/50 transition-colors">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                <UserCircle size={18} />
                              </div>
                              <span className="font-semibold text-slate-700">{m.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-lg h-8 text-xs font-semibold"
                                onClick={() => router.push(`/members/${m.id}`)}
                              >
                                <ExternalLink size={14} className="mr-1.5" /> Detail
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="rounded-lg h-8 px-2 text-slate-300 hover:text-red-600 hover:bg-red-50"
                                onClick={() => confirmDelete(m.id, m.name)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}