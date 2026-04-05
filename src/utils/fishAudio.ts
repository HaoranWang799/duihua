import type { FishAudioConfig } from '../types/story';

type GenerateFishAudioSpeechParams = {
  config: FishAudioConfig;
  signal?: AbortSignal;
  text: string;
};

const FISH_AUDIO_TTS_URL = '/api/fish/tts';
const fishAudioBlobCache = new Map<string, Blob>();
let fishAudioSystemConfigured: boolean | null = null;
let fishAudioStatusRequest: Promise<boolean> | null = null;

export const hasFishAudioConfig = (config: FishAudioConfig) =>
  Boolean(config.apiKey.trim() && config.model.trim()) || fishAudioSystemConfigured === true;

export const getFishAudioSystemConfigured = async () => {
  if (fishAudioSystemConfigured !== null) {
    return fishAudioSystemConfigured;
  }

  if (fishAudioStatusRequest) {
    return fishAudioStatusRequest;
  }

  fishAudioStatusRequest = fetch(FISH_AUDIO_TTS_URL, {
    method: 'GET',
  })
    .then(async (response) => {
      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { configured?: boolean };
      fishAudioSystemConfigured = Boolean(data.configured);
      return fishAudioSystemConfigured;
    })
    .catch(() => false)
    .finally(() => {
      fishAudioStatusRequest = null;
    });

  return fishAudioStatusRequest;
};

const getCacheKey = ({ config, text }: GenerateFishAudioSpeechParams) =>
  [config.model.trim() || 'system', config.voiceCardId.trim(), text].join('::');

const getErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string; detail?: string };
    return data.message ?? data.detail ?? `Fish Audio 请求失败（${response.status}）`;
  } catch {
    return `Fish Audio 请求失败（${response.status}）`;
  }
};

export const generateFishAudioSpeech = async ({
  config,
  signal,
  text,
}: GenerateFishAudioSpeechParams) => {
  const cacheKey = getCacheKey({ config, signal, text });
  const cachedBlob = fishAudioBlobCache.get(cacheKey);

  if (cachedBlob) {
    return cachedBlob;
  }

  const response = await fetch(FISH_AUDIO_TTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...(config.apiKey.trim() ? { apiKey: config.apiKey.trim() } : {}),
      ...(config.model.trim() ? { model: config.model.trim() } : {}),
      text,
      format: 'mp3',
      latency: 'normal',
      normalize: true,
      ...(config.voiceCardId.trim()
        ? { reference_id: config.voiceCardId.trim() }
        : {}),
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const blob = await response.blob();
  fishAudioBlobCache.set(cacheKey, blob);
  return blob;
};

export const preGenerateFishAudioTexts = async ({
  config,
  signal,
  texts,
}: {
  config: FishAudioConfig;
  signal?: AbortSignal;
  texts: string[];
}) => {
  const uniqueTexts = [...new Set(texts.map((text) => text.trim()).filter(Boolean))];

  for (const text of uniqueTexts) {
    if (signal?.aborted) {
      throw new DOMException('预生成已取消。', 'AbortError');
    }

    await generateFishAudioSpeech({ config, signal, text });
  }

  return uniqueTexts.length;
};
