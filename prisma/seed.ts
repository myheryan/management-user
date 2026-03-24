import prisma from '@/lib/prisma';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const monthMap: { [key: string]: number } = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12
};

async function importIuran(fileName: string, year: number) {
  const filePath = path.join(process.cwd(), 'prisma', 'data', fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File ${fileName} tidak ditemukan, melewati...`);
    return;
  }

  const results: any[] = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({
        separator: ';', 
        mapHeaders: ({ header }) => header.toLowerCase().replace(/[^a-z0-9]/g, '')
      }))
      .on('data', (data) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`\n▶️ Memproses data tahun ${year}...`);
  let berhasilDisimpan = 0;

  for (const row of results) {
    const nama = row['nama'];
    if (!nama || nama.toUpperCase().includes('TOTAL')) continue; 

    // GENERATE USERNAME & EMAIL (Karena field ini required di skema baru)
    // Contoh: "Budi Santoso" -> "budi_santoso"
    const username = nama.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const email = `${username}@rt07.com`;

    // 1. Upsert Member dengan field kompleks
    const member = await prisma.member.upsert({
      where: { username: username }, // Menggunakan username sebagai kunci unik
      update: { name: nama },
      create: { 
        name: nama,
        username: username,
        email: email,
        password: 'password123', // Password default untuk semua warga
        role: 'USER'
      },
    });

    // 2. Masukkan data iuran
    for (const [monthName, monthNum] of Object.entries(monthMap)) {
      let amountStr = row[monthName];

      if (amountStr) {
        amountStr = amountStr.replace(/\./g, '');
        const amount = parseInt(amountStr);

        if (!isNaN(amount) && amount > 0) {
          const category = "IURAN_WAJIB"; // Kategori default

          await prisma.payment.upsert({
            where: {
              // Menyesuaikan dengan @@unique([memberId, month, year, category])
              memberId_month_year_category: {
                memberId: member.id,
                month: monthNum,
                year: year,
                category: category
              }
            },
            update: { amount },
            create: {
              memberId: member.id,
              amount,
              month: monthNum,
              year: year,
              category: category
            }
          });
        }
      }
    }
    berhasilDisimpan++;
  }
  console.log(`✅ ${berhasilDisimpan} warga diproses untuk tahun ${year}`);
}

async function main() {
  try {
    // 1. Buat Akun Admin Utama jika belum ada
    console.log("🔐 Menyiapkan akun admin...");
    await prisma.member.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        name: 'Bendahara RT 07',
        username: 'admin',
        email: 'admin@rt07.com',
        password: 'adminpassword',
        role: 'ADMIN'
      }
    });

    // 2. Import Data Iuran dari CSV
    await importIuran('2023.csv', 2023);
    await importIuran('2024.csv', 2024);
    await importIuran('2025.csv', 2025);
    await importIuran('2026.csv', 2026);
    
    console.log("\n🎉 SEEDING SELESAI!");
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();