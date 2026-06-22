export async function rateLimit(identifier: string, limit = 10, window = '60 s'): Promise<{ allowed: boolean; resetAt: number | null }> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) return { allowed: true, resetAt: null }

  const { Ratelimit } = await import('@upstash/ratelimit')
  const { Redis } = await import('@upstash/redis')

  const ratelimit = new Ratelimit({
    redis: new Redis({ url: redisUrl, token: redisToken }),
    limiter: Ratelimit.slidingWindow(limit, window as any),
    analytics: true,
    prefix: 'nudge:api',
  })

  const { success, reset } = await ratelimit.limit(identifier)
  return { allowed: success, resetAt: reset }
}
