import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/perp-ef/',
  optimizeDeps: {
    exclude: ['kokoro-js', '@huggingface/transformers', '@mintplex-labs/piper-tts-web', 'onnxruntime-web'],
  },
})
