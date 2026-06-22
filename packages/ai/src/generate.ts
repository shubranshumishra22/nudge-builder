import { buildGenerationPrompt, type GenerationInput } from './prompts'
import { safeParseStoreConfig, type StoreConfig } from './schema'
import { getDefaultConfig } from './defaults'

interface GenerateResult {
  config: StoreConfig
  model: string
  tokensUsed: number
  durationMs: number
}

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1/chat/completions'

const MODELS = [
  'meta-llama/llama-3-8b-instruct',
  'mistralai/mistral-7b-instruct',
  'qwen/qwen-3-8b-instruct',
] as const

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
          { role: 'user', content: user },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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

function extractAndParse(text: string): { config: StoreConfig } | { error: string } {
  const cleaned = text.replace(/```json\s*|\s*```/g, '').trim()
  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return { error: 'Invalid JSON from model' }
  }
  const result = safeParseStoreConfig(parsed)
  if (!result.success) {
    return { error: `Zod validation failed: ${result.error.issues.map((i) => i.message).join(', ')}` }
  }
  return { config: result.data }
}

export async function generateStoreConfig(input: GenerationInput): Promise<GenerateResult> {
  const startTime = Date.now()
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    const defaults = getDefaultConfig(input.type as StoreConfig['business_type'])
    return {
      config: {
        ...defaults,
        business_name: input.name,
        description: input.description,
        theme: {
          ...defaults.theme,
          primary_color: input.colors.primary,
          accent_color: input.colors.accent ?? defaults.theme.accent_color,
        },
      },
      model: 'defaults',
      tokensUsed: 0,
      durationMs: Date.now() - startTime,
    }
  }

  const { system, user } = buildGenerationPrompt(input)

  for (const model of MODELS) {
    const result = await callOpenRouter(model, system, user, apiKey)
    if (!result) continue

    const parsed = extractAndParse(result.text)
    if ('config' in parsed) {
      return {
        config: parsed.config,
        model,
        tokensUsed: result.tokens,
        durationMs: Date.now() - startTime,
      }
    }

    const retryPrompt = `${user}\n\nYour previous response had validation errors: ${parsed.error}. Fix them and return ONLY valid JSON.`
    const retryResult = await callOpenRouter(model, system, retryPrompt, apiKey)
    if (retryResult) {
      const retryParsed = extractAndParse(retryResult.text)
      if ('config' in retryParsed) {
        return {
          config: retryParsed.config,
          model,
          tokensUsed: result.tokens + retryResult.tokens,
          durationMs: Date.now() - startTime,
        }
      }
    }
  }

  const defaults = getDefaultConfig(input.type as StoreConfig['business_type'])
  return {
    config: {
      ...defaults,
      business_name: input.name,
      description: input.description,
      theme: {
        ...defaults.theme,
        primary_color: input.colors.primary,
        accent_color: input.colors.accent ?? defaults.theme.accent_color,
      },
    },
    model: 'defaults',
    tokensUsed: 0,
    durationMs: Date.now() - startTime,
  }
}
