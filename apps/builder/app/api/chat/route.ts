import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const db = createClient(supabaseUrl, supabaseKey)

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1/chat/completions'

const MODELS = [
  'meta-llama/llama-3.1-8b-instruct',
  'mistralai/mistral-7b-instruct',
  'qwen/qwen-3-8b-instruct',
]

async function callOpenRouter(
  model: string,
  system: string,
  user: string,
  apiKey: string,
): Promise<{ text: string; tokens: number } | null> {
  try {
    const res = await fetch(OPENROUTER_API_BASE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nudge.store',
        'X-Title': 'Nudge Commerce',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          ...(model === MODELS[0]
            ? [{ role: 'user', content: user }]
            : [{ role: 'user', content: user }]),
        ],
        temperature: 0.5,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error(`OpenRouter ${model} returned ${res.status}:`, errBody)
      return null
    }

    const json = await res.json()
    const text: string = json.choices?.[0]?.message?.content ?? ''
    const tokens: number = json.usage?.total_tokens ?? 0
    if (!text) return null
    return { text, tokens }
  } catch (err) {
    console.error(`OpenRouter ${model} call failed:`, err)
    return null
  }
}

interface CustomSectionData {
  name: string
  html: string
  css?: string
}

interface ChatAction {
  type: 'update_theme' | 'update_store' | 'update_css' | 'generate_section' | 'add_product' | 'update_product' | 'delete_product' | 'update_social' | 'noop'
  changes?: Record<string, unknown>
  css?: string
  section?: CustomSectionData
  product?: Record<string, unknown>
  productId?: string
  [key: string]: unknown
}

const THEME_FIELDS = ['primary_color', 'accent_color', 'background_color', 'font_style', 'hero_headline', 'hero_subheading', 'about_text', 'sections_order', 'social_links'] as const
const STORE_FIELDS = ['name', 'tagline', 'description', 'whatsapp_number', 'contact_email', 'contact_address', 'delivery_fee', 'free_delivery_above'] as const

interface AIResponse {
  reply: string
  steps: string[]
  actions: ChatAction[]
}

function buildSystemPrompt(store: any, theme: any, products: any[]) {
  const productList = products.map((p: any) =>
    `- ${p.name} (₹${p.price / 100})${p.category ? ` [${p.category}]` : ''}${p.stock_status === 'in_stock' ? ' — in stock' : p.stock_status === 'limited' ? ` — limited (${p.stock_quantity} left)` : ' — out of stock'}`
  ).join('\n')

  return `You are a world-class designer + developer AI for "${store.name}". You design like Emil Kowalski — impeccable taste, pixel-perfect, refined, minimal, and beautiful. Every color, every spacing, every animation is intentional and elegant.

YOUR DESIGN PHILOSOPHY (Emil Kowalski style):
- **Whitespace is a feature** — generous padding, breathing room, content doesn't feel cramped
- **Typography first** — proper hierarchy (size/weight/letter-spacing), good line-height (1.6+ for body, 1.1 for headings), refined font choices
- **Subtlety over flash** — micro-interactions (0.2s ease hover transitions), subtle shadows (use box-shadow with spread/blur), gentle color shifts
- **Consistent rhythm** — use a spacing scale (4/8/12/16/24/32/48/64/96px), consistent border-radius (8px cards, 12px buttons, 16px containers)
- **Refined colors** — muted, sophisticated palettes. Avoid pure black (#000), use near-black (#1a1a1a). Use opacity for depth (backgrounds at 5-10% opacity of primary). Gradients should be subtle (same hue, 10-20% shift).
- **Glassmorphism & depth** — subtle backdrop-blur, semi-transparent backgrounds, layered depth with shadows
- **Smooth transitions** — 0.2s-0.3s ease for hovers, 0.5s ease for page elements. Use transform + opacity for performant animations.
- **Borders are optional** — use spacing to separate content instead of borders. When using borders, keep them thin (1px) and subtle (at 10% opacity).
- **Mobile-first** — responsive by default, touch-friendly targets (min 44px), smooth on mobile

You handle both design and development — you write the CSS to make it real.

CURRENT STORE STATE (read carefully before responding):
--- Store ---
Name: ${store.name}
Tagline: ${store.tagline || '(none)'}
Description: ${store.description || '(none)'}
Business type: ${store.business_type} | Status: ${store.status} | Slug: ${store.slug}
WhatsApp: ${store.whatsapp_number || '(none)'} | Email: ${store.contact_email || '(none)'} | Address: ${store.contact_address || '(none)'}
Currency: ${store.currency} | Delivery fee: ₹${store.delivery_fee / 100} | Free delivery above: ${store.free_delivery_above ? '₹' + (store.free_delivery_above / 100) : 'not set'}

--- Theme ---
Primary: ${theme.primary_color} | Accent: ${theme.accent_color} | Background: ${theme.background_color} | Font: ${theme.font_style}
Hero: "${theme.hero_headline || 'none'}" / "${theme.hero_subheading || 'none'}"
About: "${theme.about_text ? theme.about_text.slice(0, 80) + '...' : 'none'}"
Sections: ${(theme.sections_order || []).join(', ')}
Social: ${JSON.stringify(theme.social_links || {})}
Custom CSS length: ${(theme.custom_css || '').length} chars

--- Products (${products.length}) ---
${productList || '(no products)'}

AVAILABLE ACTIONS (ALL field changes go inside a "changes" object):
1. "update_theme" — changes: primary_color, accent_color, background_color, font_style, hero_headline, hero_subheading, about_text, sections_order. Convert color names to hex (pink→#FF69B4, light pink→#FFB6C1, blue→#3B82F6, red→#EF4444, green→#22C55E, purple→#A855F7, orange→#F97316, yellow→#EAB308). Always use # prefix.
2. "update_store" — changes: name, tagline, description, whatsapp_number, contact_email, contact_address, delivery_fee (₹), free_delivery_above (₹).
3. "update_css" — write raw CSS via the "css" field (not inside changes). You can write any CSS to customize layout, animations, spacing, hover effects, borders, shadows, etc. This is the most powerful action for custom frontend work.
4. "generate_section" — **Generate a complete, custom HTML section for the storefront**. Use the "section" field: { name, html, css }. The HTML should be styled with Tailwind CSS classes (the storefront uses Tailwind). Include responsive design, proper semantic HTML, and Emil Kowalski design principles. The section becomes a new part of the store's page. Example: request a "testimonials" section, a "features grid", a "newsletter signup", a "pricing table", etc.
5. "add_product" — product: { name, price (₹), description, category }.
6. "update_product" — productId + changes with fields to update.
7. "delete_product" — productId OR changes.name.
8. "update_social" — changes: instagram, facebook, twitter, youtube.
9. "noop" — just respond.

DESIGN + DEV RULES:
- **Design first**: Before writing code, think about the visual result. Apply Emil Kowalski principles to every change.
- **Write elegant CSS**: Use CSS custom properties for maintainability. Prefer transform/opacity animations (GPU-accelerated). Use backdrop-filter for modern glass effects.
- **Spacing is critical**: Always add proper padding/margin. Cards need 16-24px padding. Sections need 64-96px vertical spacing. Text needs comfortable line-height.
- **Typography**: Good font-sizes (16px body, 24-32px headings). Proper letter-spacing (-0.02em for headings, normal for body). Line-height 1.6 for readability.
- **Colors**: Create cohesive palettes. Use opacity variants for depth.
- **Animations**: Keep them subtle and purposeful. 0.2s-0.3s for micro-interactions. Use ease-out for entrances, ease-in-out for hover states.
- **Section generation rules**: When using generate_section, the HTML must use Tailwind CSS classes (the storefront uses Tailwind). Use semantic HTML (section, article, header, etc.). Make it responsive (mobile-first). Self-contained — don't reference external resources. Use the existing theme colors via inline styles or CSS variables where appropriate. Generate complete, production-quality sections.
- **Explain like a designer+dev**: "Added 16px padding and 12px border-radius to product cards with a subtle box-shadow (0 2px 8px rgba(0,0,0,0.06)) and a 0.2s ease hover lift effect."
- **Complex requests**: Break into multiple steps. First design, then implement.
- **Prices**: ₹ amounts ×100 for paise storage.
- Return ONLY valid JSON.

RESPONSE FORMAT:
{
  "reply": "Your developer-style response explaining what you did",
  "steps": ["Step 1: what you're doing", "Step 2: ..."],
  "actions": [{ "type": "...", ...fields }]
}

For CSS updates, the action format is:
{ "type": "update_css", "css": ".my-class { ... }" }
The CSS will be APPENDED to existing custom CSS. Include complete CSS rules.

Always include meaningful steps. For noop: steps: ["Analyzing request..."]`
}

function parseActions(text: string): AIResponse | null {
  try {
    const cleaned = text.replace(/```json\s*|\s*```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (typeof parsed.reply !== 'string') return null
    if (!Array.isArray(parsed.actions)) return null
    return parsed as AIResponse
  } catch {
    return null
  }
}

function extractChanges(action: ChatAction, validFields: readonly string[]): Record<string, unknown> {
  if (action.changes && typeof action.changes === 'object') {
    const changes: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(action.changes)) {
      if ((validFields as readonly string[]).includes(key)) {
        changes[key] = value
      }
    }
    return changes
  }
  const changes: Record<string, unknown> = {}
  for (const key of validFields) {
    if (key in action && action[key] !== undefined) {
      changes[key] = action[key]
    }
  }
  return changes
}

async function executeAction(action: ChatAction, storeId: string): Promise<string> {
  switch (action.type) {
    case 'update_theme': {
      const updates = extractChanges(action, THEME_FIELDS)
      if (Object.keys(updates).length > 0) {
        await db.from('store_themes').update(updates).eq('store_id', storeId)
      }
      const changed = Object.keys(updates).join(', ')
      return changed ? `Updated theme: ${changed}` : ''
    }

    case 'update_store': {
      const raw = action.changes && typeof action.changes === 'object' ? action.changes : action
      const updates: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(raw)) {
        if ((STORE_FIELDS as readonly string[]).includes(key)) {
          updates[key] = value
        }
        if (key === 'delivery_fee') {
          updates.delivery_fee = Math.round(Number(value) * 100)
        }
        if (key === 'free_delivery_above') {
          updates.free_delivery_above = value ? Math.round(Number(value) * 100) : null
        }
      }
      if (Object.keys(updates).length > 0) {
        await db.from('stores').update(updates).eq('id', storeId)
      }
      const changed = Object.keys(updates).join(', ')
      return changed ? `Updated store: ${changed}` : ''
    }

    case 'add_product': {
      if (action.product?.name && action.product?.price) {
        const slug = (action.product.name as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        const price = Math.round(Number(action.product.price) * 100)
        await db.from('products').insert({
          store_id: storeId,
          name: action.product.name as string,
          slug,
          price,
          description: (action.product.description as string) || null,
          category: (action.product.category as string) || null,
          stock_status: 'in_stock',
        })
        return `Added product: ${action.product.name}`
      }
      return ''
    }

    case 'update_product': {
      if (!action.changes) return ''
      const { data: products } = await db.from('products').select('id, name').eq('store_id', storeId)
      let target = products?.find((p: any) => p.id === action.productId)
      if (!target && action.changes.name) {
        target = products?.find((p: any) => p.name === action.changes!.name)
      }
      if (target) {
        const updates: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(action.changes)) {
          if (['name', 'description', 'category'].includes(key)) {
            updates[key] = value
          }
          if (key === 'price') {
            updates.price = Math.round(Number(value) * 100)
          }
        }
        if (Object.keys(updates).length > 0) {
          await db.from('products').update(updates).eq('id', target.id)
        }
        return `Updated product: ${target.name}`
      }
      return `Product not found`
    }

    case 'delete_product': {
      const changes = action.changes
      if (!changes) return ''
      const { data: products } = await db.from('products').select('id, name').eq('store_id', storeId)
      let target = products?.find((p: any) => p.id === action.productId)
      if (!target && changes.name) {
        target = products?.find((p: any) => p.name === changes.name as string)
      }
      if (target) {
        await db.from('products').delete().eq('id', target.id)
        return `Deleted product: ${target.name}`
      }
      return `Product not found`
    }

    case 'update_social': {
      const { data: theme } = await db.from('store_themes').select('social_links').eq('store_id', storeId).single()
      const existing = (theme?.social_links as Record<string, string>) || {}
      const merged = { ...existing, ...action.changes } as Record<string, unknown>
      await db.from('store_themes').update({ social_links: merged }).eq('store_id', storeId)
      return `Updated social links`
    }

    case 'update_css': {
      if (!action.css) return ''
      const { data: existingTheme } = await db.from('store_themes').select('custom_css').eq('store_id', storeId).single()
      const existingCss = (existingTheme?.custom_css as string) || ''
      const newCss = existingCss ? existingCss + '\n\n/* AI update */\n' + action.css : action.css
      await db.from('store_themes').update({ custom_css: newCss }).eq('store_id', storeId)
      return `Applied custom CSS (${action.css.length} chars)`
    }

    case 'generate_section': {
      if (!action.section?.html || !action.section?.name) return ''
      const { data: existingTheme } = await db.from('store_themes').select('custom_sections, sections_order, sections_enabled').eq('store_id', storeId).single()
      const sections: any[] = (existingTheme?.custom_sections as any[]) || []
      const newId = `custom_${Date.now()}`
      const newSection = {
        id: newId,
        name: action.section.name,
        html: action.section.html,
        css: action.section.css || '',
        enabled: true,
        order: sections.length,
      }
      sections.push(newSection)
      const sectionsOrder: string[] = (existingTheme?.sections_order as string[]) || []
      const sectionsEnabled: Record<string, boolean> = (existingTheme?.sections_enabled as Record<string, boolean>) || {}
      sectionsOrder.push(newId)
      sectionsEnabled[newId] = true
      await db.from('store_themes').update({
        custom_sections: sections,
        sections_order: sectionsOrder,
        sections_enabled: sectionsEnabled,
      }).eq('store_id', storeId)
      return `Added custom section: ${action.section.name}`
    }

    default:
      return ''
  }
}

export async function POST(request: Request) {
  try {
    const { storeId, message } = await request.json()
    if (!storeId || !message) {
      return NextResponse.json({ error: 'storeId and message are required' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        reply: 'AI assistant is not configured yet. Please set up your OpenRouter API key.',
        steps: [],
        actions: [{ type: 'noop' }],
      })
    }

    const { data: store } = await db.from('stores').select('*').eq('id', storeId).single()
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const { data: theme } = await db.from('store_themes').select('*').eq('store_id', storeId).single()
    const { data: products } = await db.from('products').select('*').eq('store_id', storeId)

    const system = buildSystemPrompt(store, theme, products || [])
    const startTime = Date.now()
    let result: { text: string; tokens: number } | null = null
    let usedModel = ''

    for (const model of MODELS) {
      result = await callOpenRouter(model, system, message, apiKey)
      if (result) {
        usedModel = model
        break
      }
    }

    const durationMs = Date.now() - startTime
    let aiResponse: AIResponse

    if (!result) {
      aiResponse = {
        reply: "I'm having trouble connecting to my AI backend right now. Please try again in a moment.",
        steps: [],
        actions: [{ type: 'noop' }],
      }
    } else {
      const parsed = parseActions(result.text)
      if (!parsed) {
        const retryPrompt = `${message}\n\nYour previous response was not valid JSON. Return ONLY valid JSON with the format: {"reply": "...", "steps": [...], "actions": [...]}`
        const retryResult = await callOpenRouter(usedModel, system, retryPrompt, apiKey)
        if (retryResult) {
          aiResponse = parseActions(retryResult.text) || {
            reply: "I understood your request but had trouble processing it. Could you rephrase?",
            steps: [],
            actions: [{ type: 'noop' }],
          }
        } else {
          aiResponse = {
            reply: "I understood your request but had trouble processing it. Could you rephrase?",
            steps: [],
            actions: [{ type: 'noop' }],
          }
        }
      } else {
        aiResponse = parsed
      }
    }

    const executedActions: string[] = []
    for (const action of aiResponse.actions) {
      const result = await executeAction(action, storeId)
      if (result) executedActions.push(result)
    }

    await db.from('ai_generation_logs').insert({
      owner_id: store.owner_id,
      store_id: storeId,
      input_payload: { message, type: 'chat' },
      output_config: { reply: aiResponse.reply, actions: aiResponse.actions, executed: executedActions },
      model_used: usedModel || 'none',
      tokens_used: result?.tokens ?? 0,
      duration_ms: durationMs,
      success: true,
    })

    if (executedActions.length > 0 && store.slug) {
      try {
        await fetch(`http://localhost:3000/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: store.slug }),
        })
      } catch {}
    }

    return NextResponse.json({
      reply: aiResponse.reply,
      steps: aiResponse.steps || [],
      actions: executedActions,
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
