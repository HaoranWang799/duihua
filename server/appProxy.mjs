import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

const FISH_AUDIO_API_URL = 'https://api.fish.audio/v1/tts'
const XAI_RESPONSES_API_URL = 'https://api.x.ai/v1/responses'
const FISH_AUDIO_CACHE_DIR = path.resolve(process.cwd(), '.cache', 'fish-audio')

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

export const buildSystemConfig = (env = process.env) => ({
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

const createFishAudioHandler = (systemConfig) => async (req, res) => {
  if (req.method === 'GET') {
    sendJson(res, 200, {
      configured: Boolean(systemConfig.apiKey && systemConfig.model),
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

    const resolvedApiKey = systemConfig.apiKey || apiKey || ''
    const resolvedModel = systemConfig.model || model || ''
    const resolvedReferenceId = systemConfig.referenceId || reference_id

    if (!resolvedApiKey || !resolvedModel || !text) {
      sendJson(res, 400, { message: '缺少 Fish Audio 所需配置。' })
      return
    }

    const cacheFilePath = getCacheFilePath({
      format,
      latency,
      model: resolvedModel,
      normalize,
      reference_id: resolvedReferenceId,
      text,
    })

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
    res.setHeader('X-Fish-Cache', 'MISS')
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

    const upstreamResponse = await fetch(XAI_RESPONSES_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${systemConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: `请根据这些关键词生成新的分支故事：${promptKeywords}`,
        instructions: STORY_GENERATION_INSTRUCTIONS,
        model: systemConfig.model,
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
      sendJson(res, upstreamResponse.status, {
        message: errorText || 'AI 剧本生成失败。',
      })
      return
    }

    const responsePayload = await upstreamResponse.json()
    const outputText = getResponseOutputText(responsePayload)

    if (!outputText) {
      sendJson(res, 502, {
        message: 'AI 已返回结果，但没有解析到可用剧本。',
      })
      return
    }

    sendJson(res, 200, JSON.parse(outputText))
  } catch (error) {
    sendJson(res, 500, {
      message: error instanceof Error ? error.message : 'AI 剧本生成失败。',
    })
  }
}

export const createAppProxyHandlers = (systemConfig) => ({
  fishAudio: createFishAudioHandler(systemConfig.fishAudio),
  storyGeneration: createStoryGenerationHandler(systemConfig.xAIStory),
})
