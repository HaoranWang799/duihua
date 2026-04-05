import type { IncomingMessage, ServerResponse } from 'node:http'

export type FishAudioSystemConfig = {
  apiKey: string
  model: string
  referenceId: string
}

export type XAIStoryConfig = {
  apiKey: string
  model: string
}

export type AppSystemConfig = {
  fishAudio: FishAudioSystemConfig
  xAIStory: XAIStoryConfig
}

export declare const sendJson: (
  res: ServerResponse,
  statusCode: number,
  payload: object,
) => void

export declare const buildSystemConfig: (
  env?: Record<string, string | undefined> | NodeJS.ProcessEnv,
) => AppSystemConfig

export declare const createAppProxyHandlers: (systemConfig: AppSystemConfig) => {
  fishAudio: (
    req: IncomingMessage,
    res: ServerResponse,
  ) => void | Promise<void>
  storyGeneration: (
    req: IncomingMessage,
    res: ServerResponse,
  ) => void | Promise<void>
}
