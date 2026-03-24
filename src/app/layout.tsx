// app/layout.tsx
import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import "./globals.css";

// 1. Import ApolloWrapper yang baru saja kita buat
import { ApolloWrapper } from "@/lib/apollo-provider";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
export const metadata: Metadata = {
  title: "Kas Pemuda RT 07",
  description: "Dashboard Pembukuan Kas Pemuda RT 07",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("font-sans", inter.variable)}>
      <body className="font-sans antialiased bg-slate-200 text-slate-900">
        <Toaster 
          position="top-right" 
          richColors 
          toastOptions={{
            style: { borderRadius: '0px', fontFamily: 'var(--font-sans)' },
          }} />
        <ApolloWrapper>
          <div className="flex flex-col md:flex-row min-h-screen">
            <Navbar />
            <main className="flex-1 w-full overflow-x-hidden">
                {children}
            </main>
          </div>




        </ApolloWrapper>
        
      </body>
    </html>
  );
}