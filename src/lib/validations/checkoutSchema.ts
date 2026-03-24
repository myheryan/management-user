import { z } from 'zod'

export const checkoutSchema = z.object({
  name: z.string().min(3, "Minimal 3 karakter"),
  phone: z.string().min(10, "Minimal 10 digit").regex(/^[0-9]+$/, "Hanya angka"),
  address: z.string().min(15, "Alamat terlalu pendek"),
  city: z.string().min(2, "Wajib diisi"),
  province: z.string().min(2, "Wajib diisi"),
  postalCode: z.string().min(5, "Kode pos tidak valid"),
  notes: z.string().optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>