import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error shared runtime module is plain ESM for both Vite and Railway server
import { buildSystemConfig, createAppProxyHandlers } from './server/appProxy.mjs'

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
) => void | Promise<void>

const appProxyPlugin = (mode: string) => {
  const systemConfig = buildSystemConfig(loadEnv(mode, process.cwd(), ''))
  const handlers = createAppProxyHandlers(systemConfig)

  const attachMiddlewares = (server: {
    middlewares: {
      use: (path: string, fn: Middleware) => void
    }
  }) => {
    server.middlewares.use('/api/archive', (req, res) =>
      handlers.archive(req, res),
    )
    server.middlewares.use('/api/fish/tts', (req, res) =>
      handlers.fishAudio(req, res),
    )
    server.middlewares.use('/api/story/generate', (req, res) =>
      handlers.storyGeneration(req, res),
    )
  }

  return {
    configurePreviewServer(server: {
      middlewares: {
        use: (path: string, fn: Middleware) => void
      }
    }) {
      attachMiddlewares(server)
    },
    configureServer(server: {
      middlewares: {
        use: (path: string, fn: Middleware) => void
      }
    }) {
      attachMiddlewares(server)
    },
    name: 'app-proxy',
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), appProxyPlugin(mode)],
}))
