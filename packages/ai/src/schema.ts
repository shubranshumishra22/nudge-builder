import { z } from 'zod'

export const businessTypeSchema = z.enum([
  'cafe', 'bakery', 'clothing', 'fitness',
  'handmade', 'restaurant', 'beauty', 'generic',
])

export const fontStyleSchema = z.enum(['modern', 'classic', 'playful', 'minimal'])

export const sectionSchema = z.enum([
  'hero', 'products', 'about', 'contact', 'testimonials', 'faq',
])

export const storeConfigSchema = z.object({
  business_name: z.string().min(1),
  business_type: businessTypeSchema,
  tagline: z.string().max(80),
  description: z.string().max(300),
  theme: z.object({
    primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color'),
    accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a hex color'),
    font_style: fontStyleSchema,
  }),
  sections: z.array(sectionSchema),
  suggested_products: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
        description: z.string(),
        category: z.string(),
      }),
    )
    .max(5),
  seo: z.object({
    title: z.string(),
    description: z.string(),
  }),
})

export type StoreConfig = z.infer<typeof storeConfigSchema>
export type BusinessType = z.infer<typeof businessTypeSchema>
export type FontStyle = z.infer<typeof fontStyleSchema>
export type Section = z.infer<typeof sectionSchema>

export function parseStoreConfig(input: unknown) {
  return storeConfigSchema.parse(input)
}

export function safeParseStoreConfig(input: unknown) {
  return storeConfigSchema.safeParse(input)
}
