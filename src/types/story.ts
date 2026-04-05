import type {
  StoryChoice,
  StoryData,
  StoryNode,
} from '../data/story';

export type { StoryChoice, StoryData, StoryNode };

export type SubtitleMode = 'timed' | 'full';

export type SubtitleScale = 'standard' | 'large';

export type StoryExperienceSource = 'default' | 'generated';

export type FishAudioConfig = {
  apiKey: string;
  model: string;
  voiceCardId: string;
};

export type StoryPreferences = {
  isMuted: boolean;
  subtitleMode: SubtitleMode;
  subtitleScale: SubtitleScale;
  fishAudio: FishAudioConfig;
};

export type StoryProgress = {
  currentNodeId: string;
  visitedNodeIds: string[];
  pathNodeIds: string[];
  endingReached?: string;
};

export type StoryExperience = {
  id: string;
  promptKeywords?: string;
  source: StoryExperienceSource;
  story: StoryData;
  summary?: string;
  title: string;
};

export type StoryArchiveSnapshot = {
  activeExperience: StoryExperience | null;
  activeProgress: StoryProgress | null;
  generatedExperiences: StoryExperience[];
  unlockedEndingIds: string[];
};
