import { defineConfig } from 'rolldown'
import swc from 'unplugin-swc'
import obfuscator from 'rollup-plugin-obfuscator'

export default defineConfig({
  input: 'src/index.ts',
  output: {
    file: 'dist/_worker.js',
    minify: true,
    format: 'esm',
  },
  external: ['cloudflare:sockets'],
  plugins: [
    swc.rolldown(),
    obfuscator({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 1,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
      },
    }),
  ],
})
