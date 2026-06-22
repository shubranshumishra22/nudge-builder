import type { Config } from 'tailwindcss'
import sharedConfig from '@nudge/ui/tailwind.config'

const config: Config = {
  presets: [sharedConfig],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}

export default config
