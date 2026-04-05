import { useState } from 'react';
import { useNodePlayback } from '../hooks/useNodePlayback';
import type {
  StoryNode,
  StoryPreferences,
  StoryProgress,
  SubtitleMode,
  SubtitleScale,
} from '../types/story';
import { isEndingNode } from '../utils/storyRuntime';
import { AudioPlayer } from './AudioPlayer';
import { ChoiceList } from './ChoiceList';
import { EndingScreen } from './EndingScreen';
import { PreferencesModal } from './PreferencesModal';
import { Subtitle } from './Subtitle';

type PlaySceneProps = {
  node: StoryNode;
  preferences: StoryPreferences;
  progress: StoryProgress;
  currentChapterTitle: string;
  onChoose: (nextId: string) => void;
  onOpenMap: () => void;
  onPreGenerateChapterAudio: () => Promise<string>;
  onRestart: () => void;
  onResetPreferences: () => void;
  onSetSubtitleMode: (mode: SubtitleMode) => void;
  onSetSubtitleScale: (scale: SubtitleScale) => void;
  onToggleMute: () => void;
  visual: {
    accentLabel: string;
    imageUrl: string;
    sceneLabel: string;
  };
};

export const PlayScene = ({
  node,
  preferences,
  progress,
  currentChapterTitle,
  onChoose,
  onOpenMap,
  onPreGenerateChapterAudio,
  onRestart,
  onResetPreferences,
  onSetSubtitleMode,
  onSetSubtitleScale,
  onToggleMute,
  visual,
}: PlaySceneProps) => {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [chapterWarmStatus, setChapterWarmStatus] = useState<string | null>(null);
  const [isPreGeneratingChapter, setIsPreGeneratingChapter] = useState(false);
  const {
    activeSubtitle,
    isPaused,
    isPlaying,
    isPreparingAudio,
    replay,
    showChoices,
    togglePlayback,
    voiceError,
  } = useNodePlayback(node, preferences);
  const isEnding = isEndingNode(node);

  return (
    <main className="play-scene">
      <div className="play-scene__glow play-scene__glow--red" />
      <div className="play-scene__glow play-scene__glow--violet" />
      <div className="play-scene__frame">
        <div
          className="play-scene__background"
          style={{ backgroundImage: `url(${visual.imageUrl})` }}
          aria-hidden="true"
        />
        <div className="play-scene__veil" />
        <div className="play-scene__shade" />

        <div className="play-scene__audio">
          <div className="play-scene__brand">
            <span className="play-scene__brand-mark">✦</span>
            <div>
              <p className="play-scene__brand-title">欲望之扉</p>
              <p className="play-scene__scene-label">{visual.sceneLabel}</p>
            </div>
          </div>
          <div className="play-scene__actions">
            <button
              className="play-scene__ghost play-scene__ghost--icon play-scene__ghost--icon-map"
              type="button"
              onClick={onOpenMap}
              aria-label="查看地图"
            >
              <svg
                aria-hidden="true"
                className="play-scene__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.5 6.5 8.5 4l7 2.5L20.5 4v13.5L15.5 20l-7-2.5L3.5 20Z" />
                <path d="M8.5 4v13.5" />
                <path d="M15.5 6.5V20" />
              </svg>
            </button>
            <button
              className="play-scene__ghost play-scene__ghost--icon play-scene__ghost--icon-settings"
              type="button"
              onClick={() => setPreferencesOpen(true)}
              aria-label="打开设置"
            >
              <svg
                aria-hidden="true"
                className="play-scene__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="6.2" />
                <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
                <path d="M12 5.8v2.4" />
                <path d="M12 15.8v2.4" />
                <path d="m6.9 8 1.7 1" />
                <path d="m15.4 15 1.7 1" />
                <path d="m5.8 12h2.4" />
                <path d="m15.8 12h2.4" />
                <path d="m6.9 16 1.7-1" />
                <path d="m15.4 9 1.7-1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="play-scene__tone-box" aria-label="情绪标签">
          <span className="play-scene__tone-label">Vocal Tone</span>
          <span className="play-scene__tone-value">{node.tone}</span>
        </div>

        <section className="play-scene__subtitle">
          <Subtitle
            accentLabel={visual.accentLabel}
            actions={(
              <>
                <button
                  className="play-scene__ghost play-scene__ghost--text play-scene__ghost--inline"
                  type="button"
                  disabled={isPreGeneratingChapter}
                  onClick={async () => {
                    setIsPreGeneratingChapter(true);
                    setChapterWarmStatus(`正在缓存《${currentChapterTitle}》语音…`);

                    try {
                      const status = await onPreGenerateChapterAudio();
                      setChapterWarmStatus(status);
                    } catch (error) {
                      const message =
                        error instanceof Error ? error.message : '整章语音预生成失败。';
                      setChapterWarmStatus(message);
                    } finally {
                      setIsPreGeneratingChapter(false);
                    }
                  }}
                  aria-label="预生成整章语音"
                >
                  {isPreGeneratingChapter ? '缓存中' : '预生成'}
                </button>
                <AudioPlayer
                  isPreparingAudio={isPreparingAudio}
                  isPaused={isPaused}
                  isPlaying={isPlaying}
                  onReplay={replay}
                  onTogglePlayback={togglePlayback}
                />
              </>
            )}
            fullSubtitle={node.subtitle}
            scale={preferences.subtitleScale}
            subtitle={activeSubtitle}
          />
        </section>

        <section className="play-scene__choices">
          {chapterWarmStatus ? (
            <p className="play-scene__status-banner">{chapterWarmStatus}</p>
          ) : null}
          {isEnding && showChoices ? (
            <EndingScreen
              node={node}
              visitedCount={progress.visitedNodeIds.length}
              onRestart={onRestart}
            />
          ) : (
            <div className={`choice-stage ${showChoices ? 'is-visible' : ''}`}>
              {showChoices ? (
                <ChoiceList choices={node.choices} onChoose={onChoose} />
              ) : (
                <div className="choice-stage__waiting" />
              )}
            </div>
          )}
        </section>
      </div>

      {preferencesOpen ? (
        <PreferencesModal
          preferences={preferences}
          onClose={() => setPreferencesOpen(false)}
          onResetPreferences={onResetPreferences}
          onSetIntensity={onSetSubtitleScale}
          onSetSound={onToggleMute}
          onSetSubtitleMode={onSetSubtitleMode}
          voiceError={voiceError}
        />
      ) : null}
    </main>
  );
};
