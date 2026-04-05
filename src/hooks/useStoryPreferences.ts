import { useEffect, useState } from 'react';
import type { StoryPreferences, SubtitleMode, SubtitleScale } from '../types/story';
import {
  defaultStoryPreferences,
  readStoryPreferences,
  writeStoryPreferences,
} from '../utils/storage';

export const useStoryPreferences = () => {
  const [preferences, setPreferences] = useState<StoryPreferences>(() =>
    readStoryPreferences(),
  );

  useEffect(() => {
    writeStoryPreferences(preferences);
  }, [preferences]);

  const toggleMute = () => {
    setPreferences((current) => ({
      ...current,
      isMuted: !current.isMuted,
    }));
  };

  const setSubtitleMode = (subtitleMode: SubtitleMode) => {
    setPreferences((current) => ({
      ...current,
      subtitleMode,
    }));
  };

  const setSubtitleScale = (subtitleScale: SubtitleScale) => {
    setPreferences((current) => ({
      ...current,
      subtitleScale,
    }));
  };

  const resetPreferences = () => {
    setPreferences((current) => ({
      ...defaultStoryPreferences,
      fishAudio: current.fishAudio,
    }));
  };

  return {
    preferences,
    toggleMute,
    setSubtitleMode,
    setSubtitleScale,
    resetPreferences,
  };
};
