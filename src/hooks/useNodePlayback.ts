import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StoryNode, StoryPreferences } from '../types/story';
import {
  generateFishAudioSpeech,
  getFishAudioSystemConfigured,
  hasFishAudioConfig,
} from '../utils/fishAudio';
import {
  getCurrentSubtitle,
  getPlaybackDuration,
} from '../utils/storyRuntime';

type UseNodePlaybackResult = {
  activeSubtitle: string;
  isPaused: boolean;
  isPlaying: boolean;
  isPreparingAudio: boolean;
  progressRatio: number;
  replay: () => void;
  showChoices: boolean;
  togglePlayback: () => void;
  voiceError: string | null;
};

const CHOICE_REVEAL_DELAY_MS = 420;

export const useNodePlayback = (
  node: StoryNode,
  preferences: StoryPreferences,
): UseNodePlaybackResult => {
  const frameRef = useRef<number>(0);
  const revealTimerRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const generationAbortRef = useRef<AbortController | null>(null);
  const [playbackNonce, setPlaybackNonce] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationMs, setDurationMs] = useState(getPlaybackDuration(node));
  const [showChoices, setShowChoices] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPreparingAudio, setIsPreparingAudio] = useState(false);
  const [isSystemFishAudioConfigured, setIsSystemFishAudioConfigured] = useState<
    boolean | null
  >(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const progressRatio = Math.min(
    currentTime / Math.max(durationMs, 1),
    1,
  );
  const hasLocalFishAudioConfig = Boolean(
    preferences.fishAudio.apiKey.trim() && preferences.fishAudio.model.trim(),
  );
  const canUseFishAudio =
    !preferences.isMuted &&
    (hasFishAudioConfig(preferences.fishAudio) || isSystemFishAudioConfigured === true);
  const shouldWaitForSystemFishAudio =
    !preferences.isMuted &&
    !hasLocalFishAudioConfig &&
    isSystemFishAudioConfigured === null;

  const activeSubtitle = useMemo(() => {
    return getCurrentSubtitle(node, progressRatio, preferences.subtitleMode);
  }, [node, preferences.subtitleMode, progressRatio]);

  const clearRevealTimer = useCallback(() => {
    window.clearTimeout(revealTimerRef.current);
  }, []);

  const clearAnimation = useCallback(() => {
    window.cancelAnimationFrame(frameRef.current);
  }, []);

  const ensureAudioElement = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    return audioRef.current;
  }, []);

  const revokeAudioUrl = useCallback(() => {
    if (!audioUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
  }, []);

  const detachAudio = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    audio.onloadedmetadata = null;
    audio.oncanplay = null;
    audio.ontimeupdate = null;
    audio.onended = null;
    audio.onerror = null;
    audio.removeAttribute('src');
    audio.load();
  }, []);

  const clearPlaybackResources = useCallback(() => {
    clearAnimation();
    clearRevealTimer();
    generationAbortRef.current?.abort();
    generationAbortRef.current = null;
    detachAudio();
    revokeAudioUrl();
  }, [clearAnimation, clearRevealTimer, detachAudio, revokeAudioUrl]);

  const revealChoicesLater = useCallback(() => {
    clearRevealTimer();
    revealTimerRef.current = window.setTimeout(() => {
      setShowChoices(true);
    }, CHOICE_REVEAL_DELAY_MS);
  }, [clearRevealTimer]);

  const resetPlaybackState = useCallback(() => {
    setCurrentTime(0);
    setDurationMs(getPlaybackDuration(node));
    setShowChoices(false);
    setIsPlaying(false);
    setIsPaused(false);
    setIsPreparingAudio(false);
    setVoiceError(null);
  }, [node]);

  const startTimedPlayback = useCallback((startAt = 0) => {
    const nextDuration = getPlaybackDuration(node);
    setDurationMs(nextDuration);
    setCurrentTime(startAt);
    setShowChoices(false);
    setIsPreparingAudio(false);
    setIsPlaying(true);
    setIsPaused(false);

    const startedAt = performance.now() - startAt;

    const tick = (timestamp: number) => {
      const elapsed = Math.min(timestamp - startedAt, nextDuration);
      setCurrentTime(elapsed);

      if (elapsed >= nextDuration) {
        setIsPlaying(false);
        setIsPaused(false);
        revealChoicesLater();
        return;
      }

      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);
  }, [node, revealChoicesLater]);

  const attachAudio = useCallback((blob: Blob) => {
    revokeAudioUrl();
    detachAudio();

    const url = URL.createObjectURL(blob);
    audioUrlRef.current = url;

    const audio = ensureAudioElement();
    audio.autoplay = true;
    audio.muted = preferences.isMuted;

    let hasStartedPlayback = false;

    const tryStartPlayback = async () => {
      if (hasStartedPlayback) {
        return;
      }

      hasStartedPlayback = true;

      try {
        await audio.play();
        setIsPlaying(true);
        setIsPaused(false);
      } catch {
        hasStartedPlayback = false;
        setIsPlaying(false);
        setIsPaused(true);
      }
    };

    audio.onloadedmetadata = async () => {
      const nextDuration =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration * 1000
          : getPlaybackDuration(node);
      setDurationMs(nextDuration);
      setCurrentTime(0);
      setIsPreparingAudio(false);
      void tryStartPlayback();
    };

    audio.oncanplay = () => {
      setIsPreparingAudio(false);
      void tryStartPlayback();
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime * 1000);
    };

    audio.onended = () => {
      setCurrentTime(
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration * 1000
          : getPlaybackDuration(node),
      );
      setIsPlaying(false);
      setIsPaused(false);
      revealChoicesLater();
    };

    audio.onerror = () => {
      setVoiceError('Fish Audio 音频播放失败，已退回无声模式。');
      detachAudio();
      revokeAudioUrl();
      startTimedPlayback(0);
    };

    audio.src = url;
    audio.load();
    void tryStartPlayback();

    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) {
      setIsPreparingAudio(false);
      void tryStartPlayback();
    }
  }, [
    detachAudio,
    ensureAudioElement,
    node,
    preferences.isMuted,
    revealChoicesLater,
    revokeAudioUrl,
    startTimedPlayback,
  ]);

  useEffect(() => {
    if (preferences.isMuted || hasLocalFishAudioConfig) {
      return;
    }

    let cancelled = false;

    void getFishAudioSystemConfigured().then((configured) => {
      if (!cancelled) {
        setIsSystemFishAudioConfigured(configured);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasLocalFishAudioConfig, preferences.isMuted]);

  useEffect(() => {
    clearPlaybackResources();
    const setupId = window.setTimeout(() => {
      resetPlaybackState();

      if (shouldWaitForSystemFishAudio) {
        setIsPreparingAudio(true);
        return;
      }

      if (!canUseFishAudio) {
        startTimedPlayback(0);
        return;
      }

      const controller = new AbortController();
      generationAbortRef.current = controller;
      setIsPreparingAudio(true);

      void generateFishAudioSpeech({
        config: preferences.fishAudio,
        signal: controller.signal,
        text: node.subtitle,
      })
        .then((blob) => {
          if (controller.signal.aborted) {
            return;
          }

          attachAudio(blob);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : 'Fish Audio 语音生成失败，已退回无声模式。';
          setVoiceError(message);
          startTimedPlayback(0);
        });
    }, 0);

    return () => {
      window.clearTimeout(setupId);
      clearPlaybackResources();
    };
  }, [
    attachAudio,
    canUseFishAudio,
    clearPlaybackResources,
    node,
    playbackNonce,
    preferences.fishAudio,
    resetPlaybackState,
    shouldWaitForSystemFishAudio,
    startTimedPlayback,
  ]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.muted = preferences.isMuted;
  }, [preferences.isMuted]);

  const replay = () => {
    clearAnimation();
    clearRevealTimer();
    setShowChoices(false);
    setVoiceError(null);

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      void audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsPaused(false);
      });
      return;
    }

    setPlaybackNonce((current) => current + 1);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsPaused(true);
        return;
      }

      if (isPaused) {
        void audioRef.current.play().then(() => {
          setIsPlaying(true);
          setIsPaused(false);
        });
        return;
      }

      replay();
      return;
    }

    if (!isPlaying && !isPaused) {
      replay();
      return;
    }

    if (isPlaying) {
      clearAnimation();
      clearRevealTimer();
      setIsPlaying(false);
      setIsPaused(true);
      return;
    }

    startTimedPlayback(currentTime);
  };

  return {
    activeSubtitle,
    isPaused,
    isPlaying,
    isPreparingAudio,
    progressRatio,
    replay,
    showChoices,
    togglePlayback,
    voiceError,
  };
};
