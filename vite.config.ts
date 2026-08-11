import { defineConfig, loadEnv, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** وسيط تطوير: يوفّر /api/generate-game محليًا عبر خادم Vite (dev فقط). */
function apiDevServer(env: Record<string, string>): PluginOption {
  return {
    name: 'nashat-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/generate-game') || req.method !== 'POST') return next()
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', async () => {
          res.setHeader('content-type', 'application/json')
          try {
            const mod = await server.ssrLoadModule('/server/generateGame.ts')
            const data = JSON.parse(body || '{}')
            const result = await mod.generateGame(
              { prompt: data.prompt, stage: data.stage, gender: data.gender },
              env.ANTHROPIC_API_KEY,
            )
            res.statusCode = 200
            res.end(JSON.stringify(result))
          } catch (e) {
            const msg = (e && (e as Error).message) || 'ERROR'
            res.statusCode = msg === 'NO_API_KEY' ? 503 : 500
            res.end(JSON.stringify({ error: String(msg) }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), apiDevServer(env)],
    server: {
      watch: {
        // ملفات الوزارة ليست جزءًا من التطبيق، ومراقبتها أثناء التنزيل
        // تُسقط الخادم بخطأ EBUSY على ويندوز.
        ignored: ['**/ministry-files/**'],
      },
    },
  }
})
