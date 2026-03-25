"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- GraphQL Mutation ---
const ADD_FULL_MEMBER = gql`
  mutation AddMember($input: CreateMemberInput!) {
    addMember(input: $input) {
      id
      name
    }
  }
`;

// --- Zod Schema Validation ---
const memberSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  username: z.string().min(3, { message: "Username minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
  role: z.string().min(1, { message: "Pilih hak akses" }),
  phoneNumber: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, initialName, onSuccess }: AddMemberModalProps) {
  // Setup React Hook Form dengan Zod
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      role: "USER",
      phoneNumber: "",
    },
  });

  // Saat modal dibuka, isi otomatis nama dari input di halaman utama
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: initialName,
        username: initialName.toLowerCase().replace(/\s+/g, ''), // Generate otomatis username
        email: "",
        password: "",
        role: "USER",
        phoneNumber: "",
      });
    }
  }, [isOpen, initialName, form]);

  const [addMember, { loading }] = useMutation(ADD_FULL_MEMBER, {
    onCompleted: () => {
      toast.success("Registrasi Berhasil", {
        description: "Data warga baru telah disimpan ke database.",
      });
      onSuccess(); // Refetch data di halaman utama
      onClose();   // Tutup modal
    },
    onError: (err) => {
      toast.error("Gagal menambahkan warga", {
        description: err.message,
      });
    },
  });

  const onSubmit = (values: MemberFormValues) => {
    addMember({
      variables: {
        input: {
          name: values.name,
          username: values.username,
          email: values.email,
          password: values.password,
          role: values.role,
          phoneNumber: values.phoneNumber,
        }
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Menggunakan padding nol agar bisa di-style manual dengan warna Falcon */}
      <DialogContent className="sm:max-w-[500px] p-0 font-sans border-[#edf2f9] overflow-hidden rounded-xl shadow-lg bg-white">
        
        <DialogHeader className="bg-[#f9fafd] px-6 py-4 border-b border-[#edf2f9]">
          <DialogTitle className="text-lg font-bold text-[#344050] flex items-center gap-2">
            <UserPlus size={20} className="text-[#2c7be5]" /> Registrasi Warga Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-[#9da9bb] font-medium mt-1">
            Lengkapi data diri untuk menambahkan warga ke dalam sistem.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-[#9da9bb] tracking-wider">Nama Lengkap *</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama..." className="h-9 text-sm border-[#d8e2ef] shadow-none focus-visible:ring-1 focus-visible:ring-[#2c7be5] text-[#4d5969]" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs text-[#e63757]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-[#9da9bb] tracking-wider">Username *</FormLabel>
                      <FormControl>
                        <Input placeholder="username" className="h-9 text-sm border-[#d8e2ef] shadow-none focus-visible:ring-1 focus-visible:ring-[#2c7be5] text-[#4d5969]" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-[#e63757]" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-[#9da9bb] tracking-wider">Password *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" className="h-9 text-sm border-[#d8e2ef] shadow-none focus-visible:ring-1 focus-visible:ring-[#2c7be5] text-[#4d5969]" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-[#e63757]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-[#9da9bb] tracking-wider">Email Akun *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@domain.com" className="h-9 text-sm border-[#d8e2ef] shadow-none focus-visible:ring-1 focus-visible:ring-[#2c7be5] text-[#4d5969]" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-[#e63757]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold uppercase text-[#9da9bb] tracking-wider">No. WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="08123..." className="h-9 text-sm border-[#d8e2ef] shadow-none focus-visible:ring-1 focus-visible:ring-[#2c7be5] text-[#4d5969]" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs text-[#e63757]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase text-[#9da9bb] tracking-wider">Hak Akses *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm border-[#d8e2ef] shadow-none focus:ring-1 focus:ring-[#2c7be5] text-[#4d5969]">
                          <SelectValue placeholder="Pilih Akses" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-[#edf2f9] font-sans rounded-md">
                        <SelectItem value="USER" className="text-sm">Warga Biasa (USER)</SelectItem>
                        <SelectItem value="BENDAHARA" className="text-sm">Bendahara</SelectItem>
                        <SelectItem value="ADMIN" className="text-sm">Ketua RT (ADMIN)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-[#e63757]" />
                  </FormItem>
                )}
              />

            </form>
          </Form>
        </div>

        <DialogFooter className="bg-[#f9fafd] px-6 py-4 border-t border-[#edf2f9] flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="h-9 text-xs border-[#d8e2ef] text-[#4d5969] hover:bg-white shadow-none">
            Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={loading} className="h-9 text-xs bg-[#2c7be5] hover:bg-[#1b5cb3] text-white shadow-none px-6">
            {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
            Simpan Warga
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}