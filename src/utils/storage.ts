import type {
  FishAudioConfig,
  StoryArchiveSnapshot,
  StoryExperience,
  StoryPreferences,
} from '../types/story';

const ARCHIVE_STORAGE_KEY = 'midnight-signal.archive';
const PREFERENCES_STORAGE_KEY = 'midnight-signal.preferences';

const defaultArchiveSnapshot: StoryArchiveSnapshot = {
  activeExperience: null,
  activeProgress: null,
  generatedExperiences: [],
  unlockedEndingIds: [],
};

export const defaultStoryPreferences: StoryPreferences = {
  isMuted: false,
  subtitleMode: 'timed',
  subtitleScale: 'standard',
  fishAudio: {
    apiKey: '',
    model: 's2-pro',
    voiceCardId: '',
  },
};

const readJson = <T>(storageKey: string, fallback: T): T => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
};

export const readArchiveSnapshot = () =>
  readJson<StoryArchiveSnapshot>(ARCHIVE_STORAGE_KEY, defaultArchiveSnapshot);

export const writeArchiveSnapshot = (snapshot: StoryArchiveSnapshot) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(snapshot));
};

export const normalizeStoredStoryExperience = (
  experience: StoryExperience | null,
): StoryExperience | null => {
  if (!experience?.story?.nodes?.length) {
    return null;
  }

  return {
    ...experience,
    id: experience.id?.trim() || 'restored-story',
    source: experience.source === 'generated' ? 'generated' : 'default',
    summary: experience.summary?.trim() || undefined,
    title: experience.title?.trim() || '未命名旅程',
  };
};

export const normalizeStoredStoryExperiences = (
  experiences: StoryExperience[] | null | undefined,
) =>
  (experiences ?? [])
    .map((experience) => normalizeStoredStoryExperience(experience))
    .filter((experience): experience is StoryExperience => experience !== null);

export const readStoryPreferences = () =>
  readJson<StoryPreferences>(PREFERENCES_STORAGE_KEY, defaultStoryPreferences);

export const writeStoryPreferences = (preferences: StoryPreferences) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    PREFERENCES_STORAGE_KEY,
    JSON.stringify(preferences),
  );
};

export const normalizeFishAudioConfig = (
  config: FishAudioConfig,
): FishAudioConfig => ({
  apiKey: config.apiKey.trim(),
  model: config.model.trim() || defaultStoryPreferences.fishAudio.model,
  voiceCardId: config.voiceCardId.trim(),
});
