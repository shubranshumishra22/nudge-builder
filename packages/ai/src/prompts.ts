export const SYSTEM_PROMPT = `You are a store configuration engine for small Indian businesses. Given a business description, return ONLY valid JSON matching the StoreConfig schema. No markdown, no explanation, no preamble. Ensure suggested product prices are realistic for the Indian market.

The StoreConfig schema:
{
  business_name: string,
  business_type: "cafe" | "bakery" | "clothing" | "fitness" | "handmade" | "restaurant" | "beauty" | "generic",
  tagline: string (max 80 chars),
  description: string (max 300 chars),
  theme: {
    primary_color: string (hex, e.g. "#8B4513"),
    accent_color: string (hex),
    font_style: "modern" | "classic" | "playful" | "minimal"
  },
  sections: array of "hero" | "products" | "about" | "contact" | "testimonials" | "faq",
  suggested_products: array (max 5) of { name: string, price: number (in INR), description: string, category: string },
  seo: { title: string, description: string }
}`

export interface GenerationInput {
  name: string
  type: string
  description: string
  colors: {
    primary: string
    accent?: string
  }
  products?: Array<{
    name: string
    price: number
    description?: string
  }>
}

export function buildGenerationPrompt(input: GenerationInput): { system: string; user: string } {
  const productsSection =
    input.products && input.products.length > 0
      ? `\nThe user has already provided these products (incorporate them as suggested_products):\n${input.products
          .map((p) => `  - ${p.name} (₹${p.price})${p.description ? `: ${p.description}` : ''}`)
          .join('\n')}`
      : ''

  const userPrompt = `Generate a store configuration for:

Business name: ${input.name}
Business type: ${input.type}
Description: ${input.description}
Primary color: ${input.colors.primary}
${input.colors.accent ? `Accent color: ${input.colors.accent}` : ''}
${productsSection}

Return ONLY valid JSON.`

  return { system: SYSTEM_PROMPT, user: userPrompt }
}
