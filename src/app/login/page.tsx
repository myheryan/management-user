"use client";

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user { username role }
    }
  }
`;
interface LoginResponse {
  login: {
    token: string;
    user: {
      username: string;
      role: string;
    };
  };
}

// 2. Definisikan variabel input (opsional, tapi disarankan)
interface LoginVariables {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });

const [login, { loading }] = useMutation<LoginResponse, LoginVariables>(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // Sekarang TypeScript tahu 'data' punya properti 'login'
      const { token, user } = data.login;
      
      localStorage.setItem('token', token);
      toast.success(`Selamat datang, ${user.username}`, {
        description: `Anda masuk sebagai ${user.role}`
      });
      
      router.push('/dashboard');
    },
    onError: (err) => toast.error(err.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) return toast.warning("Isi semua kolom");
    login({ variables: form });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-normal">
      <Card className="w-full max-w-[350px] shadow-sm border-slate-200 rounded-xl overflow-hidden">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="mx-auto w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-2 shadow-blue-200 shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Login Sistem RT</CardTitle>
          <CardDescription className="text-[11px] uppercase tracking-widest text-slate-400">
            Akses Panel Bendahara RT 07
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input 
                  placeholder="Username" 
                  className="pl-9 h-10 text-sm rounded-lg border-slate-200 focus-visible:ring-blue-500"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input 
                  type="password"
                  placeholder="Password" 
                  className="pl-9 h-10 text-sm rounded-lg border-slate-200 focus-visible:ring-blue-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>
            <Button 
              disabled={loading} 
              type="submit" 
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-sm font-semibold rounded-lg shadow-md shadow-blue-100 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : "Masuk ke Dashboard"}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">
              &copy; 2026 Pengurus RT 07 Mandiri
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}