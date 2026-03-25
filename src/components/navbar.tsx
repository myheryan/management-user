"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Users, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronRight,
  PieChart,
  Settings
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pengeluaran', href: '/expenses', icon: ReceiptText },
  { name: 'Data Warga', href: '/members', icon: Users },
];

export default function FalconSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* MOBILE HEADER (Identik Falcon Navbar) */}
      <header className="md:hidden flex items-center justify-between h-12 px-4 bg-white border-b border-[#edf2f9] sticky top-0 z-[100] font-sans">
        <div className="flex items-center gap-2">
          <div className="bg-[#2c7be5] p-1 rounded-md text-white">
            <ShieldCheck size={16} />
          </div>
          <span className="text-base font-bold text-[#2c7be5] tracking-tighter">falcon</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="p-1.5 text-[#748194] hover:bg-[#f9fafd] rounded-md transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[90] bg-white pt-16 font-sans">
          <div className="flex flex-col gap-1 px-3">
             <p className="px-4 text-[10px] font-bold text-[#9da9bb] uppercase tracking-widest mb-2">Main Menu</p>
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-[#2c7be5] text-white shadow-sm' : 'text-[#5e6e82] hover:bg-[#f9fafd]'
                  }`}
                >
                  <link.icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-[#edf2f9] bg-white font-sans">
        
        {/* Brand Section */}
        <div className="h-16 px-6 flex items-center gap-2 border-b border-[#f9fafd]">
          <div className="bg-[#2c7be5] p-1 rounded-md text-white shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <span className="text-xl font-bold text-[#2c7be5] tracking-tighter">falcon</span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
          
          <div>
            <p className="px-4 text-[10px] font-bold text-[#9da9bb] uppercase tracking-[0.2em] mb-3">Management</p>
            <div className="space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-4 py-2 rounded-md text-[13px] font-medium transition-all group ${
                      isActive 
                        ? 'bg-[#edf2f9] text-[#2c7be5]' 
                        : 'text-[#5e6e82] hover:bg-[#f9fafd] hover:text-[#2c7be5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon 
                        size={16} 
                        className={isActive ? 'text-[#2c7be5]' : 'text-[#9da9bb] group-hover:text-[#2c7be5]'} 
                      />
                      {link.name}
                    </div>
                    {isActive && <ChevronRight size={12} className="opacity-50" />}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Additional Section (Persis Falcon) */}
          <div>
            <p className="px-4 text-[10px] font-bold text-[#9da9bb] uppercase tracking-[0.2em] mb-3">Reports</p>
            <div className="space-y-1">
               <SidebarLink icon={<PieChart size={16}/>} label="Statistik Kas" />
               <SidebarLink icon={<Settings size={16}/>} label="Pengaturan" />
            </div>
          </div>
        </nav>

        {/* User Footer Section */}
        <div className="p-4 border-t border-[#edf2f9] bg-[#f9fafd]/50">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#2c7be5] flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-semibold text-[#344050] truncate">Admin Bendahara</span>
              <span className="text-[10px] text-[#9da9bb] truncate tracking-tight">admin@rt07.com</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarLink({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-md text-[13px] font-medium text-[#5e6e82] hover:bg-[#f9fafd] hover:text-[#2c7be5] cursor-pointer group transition-all">
      <div className="text-[#9da9bb] group-hover:text-[#2c7be5]">
        {icon}
      </div>
      {label}
    </div>
  )
}