// lib/validations/product.ts
import * as z from "zod"

// Helper agar input angka dari form tidak dibaca sebagai string oleh TypeScript/Zod
const numericString = z.union([z.string(), z.number()]).transform((val) => Number(val))

export const productSchema = z.object({
  // --- BASIC INFO ---
  name: z.string().min(5, { message: "Product name must be at least 5 characters." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  description: z.string().optional(),
  
  // --- VARIANTS ENGINE ---
  hasVariants: z.boolean().default(false),
  
  // Dipakai jika hasVariants === false (Single Product)
  price: numericString.optional(),
  stock: numericString.optional(),
  sku: z.string().optional(),

  // Dipakai jika hasVariants === true (Multi Variant)
  variants: z.array(
    z.object({
      name: z.string().min(1, "Variant name required (e.g., Merah - XL)"),
      price: numericString.refine((val) => val > 0, { message: "Price required" }),
      stock: numericString.refine((val) => val >= 0, { message: "Stock required" }),
      sku: z.string().optional(),
    })
  ).optional(),
  
  // --- LOGISTICS ---
  weight: numericString.refine((val) => val > 0, { message: "Weight (Grams) is required" }),
  length: numericString.optional(),
  width: numericString.optional(),
  height: numericString.optional(),

  // --- SERVICES & SETTINGS ---
  isCOD: z.boolean().default(true),
  isPreOrder: z.boolean().default(false),
  preOrderDays: numericString.optional(),
  
  // --- MEDIA ---
  images: z.array(
    z.object({
      file: z.any().optional(), // Objek File asli browser
      previewUrl: z.string(),   // URL lokal untuk render UI
      isPrimary: z.boolean().default(false)
    })
  ).optional(),
  videoUrl: z.string().optional(),

  customAttributes: z.array(
    z.object({
      name: z.string().min(1, { message: "Name required" }),
      value: z.string().min(1, { message: "Value required" })
    })
  ).optional(),

  // --- PUBLISHING ---
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),

  type: z.enum(["PHYSICAL", "DIGITAL", "BUNDLE"]).default("PHYSICAL"),
})
// ==========================================
// 🛡️ CONDITIONAL VALIDATION (SUPER REFINE)
// ==========================================
.superRefine((data, ctx) => {
  
  // 1. Validasi Harga & Stok berdasarkan toggle Varian
  if (!data.hasVariants) {
    if (!data.price || data.price <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Retail price is required.", path: ["price"] })
    }
    if (data.stock === undefined || data.stock < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Stock quantity is required.", path: ["stock"] })
    }
  } else {
    if (!data.variants || data.variants.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please add at least one variant combination.", path: ["variants"] })
    }
  }

  // 2. Validasi Pre-Order (Jika aktif, wajib isi hari dan minimal 7 hari)
  if (data.isPreOrder) {
    if (!data.preOrderDays || data.preOrderDays < 7) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Pre-order must be at least 7 days.", path: ["preOrderDays"] })
    }
  }
})

// Ekspor tipe yang sudah diperbarui
export type ProductFormValues = z.infer<typeof productSchema>