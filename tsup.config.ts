import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['cjs'],
  target: 'es2022',
  outDir: 'dist',
  loader: {
    '.md': 'text'
  },
  noExternal: ['@supabase/supabase-js']
})
