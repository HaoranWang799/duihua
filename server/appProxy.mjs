import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  readArchiveSnapshotFromDatabase,
  readBucketObject,
  writeArchiveSnapshotToDatabase,
  writeBucketObject,
} from './persistence.mjs'

const FISH_AUDIO_API_URL = 'https://api.fish.audio/v1/tts'
const XAI_RESPONSES_API_URL = 'https://api.x.ai/v1/responses'
const FISH_AUDIO_CACHE_DIR = path.resolve(process.cwd(), '.cache', 'fish-audio')
const CLIENT_COOKIE_NAME = 'duihua_client_id'

const STORY_GENERATION_SCHEMA = {
  additionalProperties: false,
  properties: {
    story: {
      additionalProperties: false,
      properties: {
        nodes: {
          items: {
            additionalProperties: false,
            properties: {
              choices: {
                items: {
                  additionalProperties: false,
                  properties: {
                    next: { minLength: 1, type: 'string' },
                    text: { minLength: 1, type: 'string' },
                  },
                  required: ['text', 'next'],
                  type: 'object',
                },
                minItems: 0,
                type: 'array',
              },
              id: { minLength: 1, type: 'string' },
              subtitle: { minLength: 1, type: 'string' },
              tone: { minLength: 1, type: 'string' },
            },
            required: ['id', 'subtitle', 'tone', 'choices'],
            type: 'object',
          },
          minItems: 12,
          type: 'array',
        },
      },
      required: ['nodes'],
      type: 'object',
    },
    summary: { minLength: 1, type: 'string' },
    title: { minLength: 1, type: 'string' },
  },
  required: ['title', 'summary', 'story'],
  type: 'object',
}

const STORY_GENERATION_INSTRUCTIONS = `
你是一个移动端沉浸式互动音频故事的剧本生成器。

你的任务是根据用户给出的几个中文关键词，生成一套可以立刻进入播放的分支剧情。

必须满足：
1. 故事语言必须是简体中文。
2. 只输出符合 JSON Schema 的数据，不要输出解释。
3. 起始节点 id 必须是 "start"。
4. 总节点数控制在 12 到 18 个之间。
5. 至少 3 个结局节点，结局节点 choices 必须为空数组。
6. 所有非结局节点必须有 2 到 3 个选项。
7. id 必须使用英文小写 snake_case，且所有 next 必须指向已存在节点。
8. subtitle 适合语音朗读，每个节点 1 到 3 句，不要太长。
9. tone 必须是简短的情绪描述，例如“克制、试探、带一点依赖”。
10. 整体体验应该私密、情绪化、电影感强，但避免露骨色情描写，重点放在张力、暧昧、试探、依赖、怀疑、抽离这些情绪推进。
11. 选择文案必须都是玩家口吻，且能明显导向不同的关系分支。
12. 故事标题要短，像一部夜间互动片段的标题。
13. summary 要用一句话概括这次生成的故事基调。
`.trim()

const readBody = async (req) => {
  const chunks = []

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  return chunks.length ? Buffer.concat(chunks).toString('utf8') : ''
}

export const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

const ensureCacheDirectory = async () => {
  await mkdir(FISH_AUDIO_CACHE_DIR, { recursive: true })
}

const getAudioContentType = (format) => {
  switch (format) {
    case 'wav':
      return 'audio/wav'
    case 'ogg':
    case 'opus':
      return 'audio/ogg'
    case 'mp3':
    default:
      return 'audio/mpeg'
  }
}

const getCacheFilePath = ({
  format,
  latency,
  model,
  normalize,
  reference_id,
  text,
}) => {
  const digest = createHash('sha256')
    .update(JSON.stringify({ format, latency, model, normalize, reference_id, text }))
    .digest('hex')

  return path.join(FISH_AUDIO_CACHE_DIR, `${digest}.${format}`)
}

const getBucketCacheKey = ({
  format,
  latency,
  model,
  normalize,
  reference_id,
  text,
}) => {
  const digest = createHash('sha256')
    .update(JSON.stringify({ format, latency, model, normalize, reference_id, text }))
    .digest('hex')

  return `fish-audio/${digest}.${format}`
}

export const buildSystemConfig = (env = process.env) => ({
  archive: {
    databaseUrl: `${env.DATABASE_URL ?? ''}`.trim(),
  },
  bucket: {
    accessKeyId: `${env.ACCESS_KEY_ID ?? ''}`.trim(),
    bucket: `${env.BUCKET ?? ''}`.trim(),
    endpoint: `${env.ENDPOINT ?? ''}`.trim(),
    region: `${env.REGION ?? ''}`.trim(),
    secretAccessKey: `${env.SECRET_ACCESS_KEY ?? ''}`.trim(),
  },
  fishAudio: {
    apiKey: `${env.FISH_AUDIO_API_KEY ?? ''}`.trim(),
    model: `${env.FISH_AUDIO_MODEL ?? ''}`.trim(),
    referenceId: `${env.FISH_AUDIO_VOICE_CARD_ID ?? ''}`.trim(),
  },
  xAIStory: {
    apiKey: `${env.XAI_API_KEY ?? env.OPENAI_API_KEY ?? ''}`.trim(),
    model: `${env.XAI_STORY_MODEL ?? env.OPENAI_STORY_MODEL ?? 'grok-4-1-fast-non-reasoning'}`.trim(),
  },
})

const getResponseOutputText = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim()
  }

  return (payload.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter((text) => typeof text === 'string' && text.trim().length > 0)
    .join('\n')
    .trim()
}

const ensureGeneratedText = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} 为空。`)
  }

  return value.trim()
}

const validateGeneratedStoryPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('生成结果为空。')
  }

  const title = ensureGeneratedText(payload.title, '故事标题')
  const summary = ensureGeneratedText(payload.summary, '故事摘要')

  if (!payload.story || typeof payload.story !== 'object' || !Array.isArray(payload.story.nodes)) {
    throw new Error('生成结果缺少有效的故事节点。')
  }

  const nodes = payload.story.nodes.map((node, index) => {
    if (!node || typeof node !== 'object') {
      throw new Error(`第 ${index + 1} 个节点格式不正确。`)
    }

    const id = ensureGeneratedText(node.id, '节点 id')
    const subtitle = ensureGeneratedText(node.subtitle, `节点 ${id} 的台词`)
    const tone = ensureGeneratedText(node.tone, `节点 ${id} 的情绪`)
    const rawChoices = node.choices

    if (!Array.isArray(rawChoices)) {
      throw new Error(`节点 ${id} 的 choices 缺失。`)
    }

    return {
      choices: rawChoices.map((choice, choiceIndex) => {
        if (!choice || typeof choice !== 'object') {
          throw new Error(`节点 ${id} 的第 ${choiceIndex + 1} 个选项格式不正确。`)
        }

        return {
          next: ensureGeneratedText(choice.next, `节点 ${id} 的选项跳转`),
          text: ensureGeneratedText(choice.text, `节点 ${id} 的选项文案`),
        }
      }),
      id,
      subtitle,
      tone,
    }
  })

  const nodeIds = new Set(nodes.map((node) => node.id))

  if (!nodeIds.has('start')) {
    throw new Error('生成结果缺少起始节点 start。')
  }

  if (nodeIds.size !== nodes.length) {
    throw new Error('生成结果里出现了重复节点 id。')
  }

  for (const node of nodes) {
    for (const choice of node.choices) {
      if (!nodeIds.has(choice.next)) {
        throw new Error(`节点 ${node.id} 指向了不存在的节点 ${choice.next}。`)
      }
    }
  }

  const endingCount = nodes.filter((node) => node.choices.length === 0).length

  if (endingCount < 3) {
    throw new Error('生成结果的结局数量太少。')
  }

  return {
    story: { nodes },
    summary,
    title,
  }
}

const requestGeneratedStoryPayload = async ({ keywords, model, apiKey, validationFeedback }) => {
  const inputParts = [
    `请根据这些关键词生成新的分支故事：${keywords}`,
  ]

  if (validationFeedback) {
    inputParts.push(`上一次结果的结构错误是：${validationFeedback}。这次必须彻底修复后再输出。`)
  }

  const upstreamResponse = await fetch(XAI_RESPONSES_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: inputParts.join('\n'),
      instructions: STORY_GENERATION_INSTRUCTIONS,
      model,
      store: false,
      text: {
        format: {
          name: 'generated_story_payload',
          schema: STORY_GENERATION_SCHEMA,
          strict: true,
          type: 'json_schema',
        },
      },
    }),
  })

  if (!upstreamResponse.ok) {
    const errorText = await upstreamResponse.text()
    throw new Error(errorText || 'AI 剧本生成失败。')
  }

  const responsePayload = await upstreamResponse.json()
  const outputText = getResponseOutputText(responsePayload)

  if (!outputText) {
    throw new Error('AI 已返回结果，但没有解析到可用剧本。')
  }

  return JSON.parse(outputText)
}

const parseCookies = (rawCookieHeader) =>
  `${rawCookieHeader ?? ''}`
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((cookies, entry) => {
      const separatorIndex = entry.indexOf('=')

      if (separatorIndex === -1) {
        return cookies
      }

      const key = entry.slice(0, separatorIndex).trim()
      const value = entry.slice(separatorIndex + 1).trim()

      if (key) {
        cookies[key] = decodeURIComponent(value)
      }

      return cookies
    }, {})

const getClientId = (req, res) => {
  const cookies = parseCookies(req.headers.cookie)
  const existingClientId = cookies[CLIENT_COOKIE_NAME]

  if (existingClientId) {
    return existingClientId
  }

  const nextClientId = randomUUID()
  const isSecure =
    `${req.headers['x-forwarded-proto'] ?? ''}`.split(',')[0].trim() === 'https'

  const parts = [
    `${CLIENT_COOKIE_NAME}=${encodeURIComponent(nextClientId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=31536000',
  ]

  if (isSecure) {
    parts.push('Secure')
  }

  res.setHeader('Set-Cookie', parts.join('; '))
  return nextClientId
}

const createArchiveHandler = (archiveConfig) => async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const clientId = getClientId(req, res)

  if (req.method === 'GET') {
    try {
      const snapshot = await readArchiveSnapshotFromDatabase({
        clientId,
        databaseUrl: archiveConfig.databaseUrl,
      })

      sendJson(res, 200, {
        durable: Boolean(archiveConfig.databaseUrl),
        snapshot,
      })
    } catch (error) {
      sendJson(res, 500, {
        durable: false,
        message: error instanceof Error ? error.message : '读取远端档案失败。',
        snapshot: null,
      })
    }

    return
  }

  if (req.method !== 'PUT') {
    sendJson(res, 405, { message: 'Method Not Allowed' })
    return
  }

  try {
    const rawBody = await readBody(req)
    const { snapshot } = JSON.parse(rawBody)

    if (!snapshot || typeof snapshot !== 'object') {
      sendJson(res, 400, { message: '缺少有效档案。' })
      return
    }

    const persisted = await writeArchiveSnapshotToDatabase({
      clientId,
      databaseUrl: archiveConfig.databaseUrl,
      snapshot,
    })

    sendJson(res, 200, {
      durable: persisted,
      ok: true,
    })
  } catch (error) {
    sendJson(res, 500, {
      durable: false,
      message: error instanceof Error ? error.message : '保存远端档案失败。',
    })
  }
}

const createFishAudioHandler = ({ bucket, fishAudio }) => async (req, res) => {
  if (req.method === 'GET') {
    sendJson(res, 200, {
      configured: Boolean(fishAudio.apiKey && fishAudio.model),
    })
    return
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Method Not Allowed' })
    return
  }

  try {
    const rawBody = await readBody(req)
    const {
      apiKey,
      format = 'mp3',
      latency = 'normal',
      model,
      normalize = true,
      reference_id,
      text,
    } = JSON.parse(rawBody)

    const resolvedApiKey = fishAudio.apiKey || apiKey || ''
    const resolvedModel = fishAudio.model || model || ''
    const resolvedReferenceId = fishAudio.referenceId || reference_id

    if (!resolvedApiKey || !resolvedModel || !text) {
      sendJson(res, 400, { message: '缺少 Fish Audio 所需配置。' })
      return
    }

    const cacheInput = {
      format,
      latency,
      model: resolvedModel,
      normalize,
      reference_id: resolvedReferenceId,
      text,
    }
    const cacheFilePath = getCacheFilePath(cacheInput)
    const bucketCacheKey = getBucketCacheKey(cacheInput)

    const bucketObject = await readBucketObject({
      bucketConfig: bucket,
      key: bucketCacheKey,
    })

    if (bucketObject) {
      res.statusCode = 200
      res.setHeader(
        'Content-Type',
        bucketObject.contentType ?? getAudioContentType(format),
      )
      res.setHeader('X-Fish-Cache', 'BUCKET')
      res.end(bucketObject.body)
      return
    }

    try {
      await stat(cacheFilePath)
      const cachedAudio = await readFile(cacheFilePath)
      res.statusCode = 200
      res.setHeader('Content-Type', getAudioContentType(format))
      res.setHeader('X-Fish-Cache', 'HIT')
      res.end(cachedAudio)
      return
    } catch {
      // Cache miss, continue.
    }

    const upstreamResponse = await fetch(FISH_AUDIO_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resolvedApiKey}`,
        'Content-Type': 'application/json',
        model: resolvedModel,
      },
      body: JSON.stringify({
        format,
        latency,
        normalize,
        text,
        ...(resolvedReferenceId ? { reference_id: resolvedReferenceId } : {}),
      }),
    })

    res.statusCode = upstreamResponse.status
    res.setHeader(
      'Content-Type',
      upstreamResponse.headers.get('content-type') ?? getAudioContentType(format),
    )

    if (!upstreamResponse.ok) {
      res.end(await upstreamResponse.text())
      return
    }

    const arrayBuffer = await upstreamResponse.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)
    await ensureCacheDirectory()
    await writeFile(cacheFilePath, audioBuffer)
    await writeBucketObject({
      body: audioBuffer,
      bucketConfig: bucket,
      contentType:
        upstreamResponse.headers.get('content-type') ?? getAudioContentType(format),
      key: bucketCacheKey,
    })
    res.setHeader('X-Fish-Cache', bucket.bucket ? 'MISS->BUCKET' : 'MISS')
    res.end(audioBuffer)
  } catch (error) {
    sendJson(res, 500, {
      message:
        error instanceof Error ? error.message : 'Fish Audio 代理请求失败。',
    })
  }
}

const createStoryGenerationHandler = (systemConfig) => async (req, res) => {
  if (req.method === 'GET') {
    sendJson(res, 200, {
      configured: Boolean(systemConfig.apiKey),
    })
    return
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Method Not Allowed' })
    return
  }

  if (!systemConfig.apiKey) {
    sendJson(res, 400, {
      message: '当前没有可用的 AI 剧本生成配置。',
    })
    return
  }

  try {
    const rawBody = await readBody(req)
    const { keywords } = JSON.parse(rawBody)
    const promptKeywords = `${keywords ?? ''}`.trim()

    if (!promptKeywords) {
      sendJson(res, 400, { message: '先输入几个关键词，再开始生成。' })
      return
    }

    let lastValidationError = ''

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const payload = await requestGeneratedStoryPayload({
          apiKey: systemConfig.apiKey,
          keywords: promptKeywords,
          model: systemConfig.model,
          validationFeedback: lastValidationError,
        })

        sendJson(res, 200, validateGeneratedStoryPayload(payload))
        return
      } catch (error) {
        lastValidationError =
          error instanceof Error ? error.message : '生成结果结构不完整。'
      }
    }

    sendJson(res, 502, {
      message: `AI 连续三次返回了结构不完整的剧本：${lastValidationError}`,
    })
  } catch (error) {
    sendJson(res, 500, {
      message:
        error instanceof Error ? error.message : 'AI 剧本生成失败。',
    })
  }
}

export const createAppProxyHandlers = (systemConfig) => ({
  archive: createArchiveHandler(systemConfig.archive),
  fishAudio: createFishAudioHandler(systemConfig),
  storyGeneration: createStoryGenerationHandler(systemConfig.xAIStory),
})
