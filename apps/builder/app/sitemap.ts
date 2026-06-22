import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://nudge.store', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://nudge.store/dashboard/upgrade', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
