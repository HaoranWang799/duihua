import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { buildSystemConfig, createAppProxyHandlers, sendJson } from './server/appProxy.mjs'

const distDir = path.resolve(process.cwd(), 'dist')
const port = Number(process.env.PORT || 3000)
const systemConfig = buildSystemConfig(process.env)
const handlers = createAppProxyHandlers(systemConfig)

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
}

const resolveDistPath = (pathname) => {
  const safePath = pathname === '/' ? '/index.html' : pathname
  const absolutePath = path.resolve(distDir, `.${safePath}`)

  if (!absolutePath.startsWith(distDir)) {
    return null
  }

  return absolutePath
}

const serveFile = async (req, res, filePath) => {
  const file = await readFile(filePath)
  const extension = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[extension] ?? 'application/octet-stream'

  res.statusCode = 200
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable')

  if (req.method === 'HEAD') {
    res.end()
    return
  }

  res.end(file)
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`)
  const pathname = decodeURIComponent(requestUrl.pathname)

  if (pathname === '/health') {
    sendJson(res, 200, { ok: true })
    return
  }

  if (pathname === '/api/fish/tts') {
    await handlers.fishAudio(req, res)
    return
  }

  if (pathname === '/api/story/generate') {
    await handlers.storyGeneration(req, res)
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  try {
    const directFilePath = resolveDistPath(pathname)

    if (directFilePath && path.extname(pathname)) {
      await stat(directFilePath)
      await serveFile(req, res, directFilePath)
      return
    }

    const indexFilePath = resolveDistPath('/index.html')

    if (!indexFilePath) {
      throw new Error('dist/index.html not found')
    }

    await serveFile(req, res, indexFilePath)
  } catch {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Not Found')
  }
})

server.listen(port, '0.0.0.0', () => {
  console.log(`server listening on :${port}`)
})
