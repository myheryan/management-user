// prisma/generate-users.ts
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';


async function main() {
  console.log("Mencari data warga...");
  const members = await prisma.member.findMany();
  
  // Buat password default "pemuda123" yang dienkripsi
  const defaultPassword = await bcrypt.hash('pemuda123', 10);

  let successCount = 0;

  for (const member of members) {
    // Ubah nama jadi format email (misal: "Ade Jaelani" -> "adejaelani@rt07.com")
    const formatEmail = member.name.toLowerCase().replace(/\s+/g, '') + '@rt07.com';

    try {
      // Masukkan ke tabel User (untuk NextAuth)
      await prisma.user.upsert({
        where: { email: formatEmail },
        update: {},
        create: {
          email: formatEmail,
          name: member.name,
          password: defaultPassword,
          role: 'USER', // Role USER (Warga biasa), bukan ADMIN
        },
      });
      successCount++;
      console.log(`✅ Berhasil membuat akun untuk: ${member.name} (${formatEmail})`);
    } catch (error) {
      console.error(`❌ Gagal membuat akun untuk ${member.name}`);
    }
  }

  // Buat 1 Akun Khusus ADMIN (Untuk Anda / Pengurus)
  const adminPassword = await bcrypt.hash('adminrt07', 10);
  await prisma.user.upsert({
    where: { email: 'admin@rt07.com' },
    update: {},
    create: {
      email: 'admin@rt07.com',
      name: 'Pengurus Kas',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log("✅ Berhasil membuat akun ADMIN (admin@rt07.com)");

  console.log(`\n🎉 Selesai! ${successCount} akun warga berhasil dibuat.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });