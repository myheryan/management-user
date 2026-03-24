"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Users, Wallet, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pengeluaran', href: '/expenses', icon: ReceiptText },
  { name: 'Data Warga', href: '/members', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* MOBILE HEADER (Hanya muncul di Mobile) */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 sticky top-0 z-50 font-normal">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 flex items-center justify-center text-white">
            <Wallet size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-tighter">Kas RT 07</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 text-slate-500">
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16 font-normal">
          <div className="flex flex-col gap-1 px-4">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 text-xs uppercase tracking-widest border-l-2 ${
                    isActive ? 'bg-blue-50 text-blue-600 border-blue-600' : 'border-transparent text-slate-500'
                  }`}
                >
                  <link.icon size={16} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (Hanya muncul di Desktop) */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200 bg-white font-normal">
        <div className="p-8 flex items-center gap-3 border-b border-slate-50">
          <div className="w-8 h-8 bg-blue-600 flex items-center justify-center text-white">
            <Wallet size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-tighter leading-none">Kas Warga</span>
            <span className="text-[10px] text-blue-600 uppercase font-normal">Rukun Tetangga 07</span>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 mt-4">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.15em] transition-none group ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50 border-r-2 border-transparent'
                }`}
              >
                <link.icon size={14} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-800'} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50 p-4 rounded-none border border-slate-100">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mb-1">Status Sistem</p>
            <p className="text-[10px] text-emerald-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Terhubung Cloud
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}