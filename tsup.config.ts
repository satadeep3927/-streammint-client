import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'es2020',
  outDir: 'dist',
  splitting: false,
  treeshake: true,
  external: ['eventemitter3'],
  banner: {
    js: '/* StreamMint Client Library */',
  },
})
