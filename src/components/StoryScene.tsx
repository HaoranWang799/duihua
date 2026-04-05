import { useEffect, useState } from 'react';
import { isEndingNode } from '../utils/storyRuntime';
import { useNodePlayback } from '../hooks/useNodePlayback';
import type {
  StoryNode,
  StoryPreferences,
  StoryProgress,
  SubtitleMode,
  SubtitleScale,
} from '../types/story';
import { ArchivePanel } from './ArchivePanel';
import { AudioControls } from './AudioControls';
import { ChoiceList } from './ChoiceList';
import { EndingScreen } from './EndingScreen';
import { ProgressPanel } from './ProgressPanel';
import { SettingsPanel } from './SettingsPanel';
import { SubtitlePanel } from './SubtitlePanel';

type StorySceneProps = {
  node: StoryNode;
  preferences: StoryPreferences;
  progress: StoryProgress;
  unlockedEndingIds: string[];
  onChoose: (nextId: string) => void;
  onClearCollection: () => void;
  onOpenMap: () => void;
  onRestart: () => void;
  onResetPreferences: () => void;
  onSetSubtitleMode: (mode: SubtitleMode) => void;
  onSetSubtitleScale: (scale: SubtitleScale) => void;
  onToggleMute: () => void;
};

export const StoryScene = ({
  node,
  preferences,
  progress,
  unlockedEndingIds,
  onChoose,
  onClearCollection,
  onOpenMap,
  onRestart,
  onResetPreferences,
  onSetSubtitleMode,
  onSetSubtitleScale,
  onToggleMute,
}: StorySceneProps) => {
  const [activePanel, setActivePanel] = useState<'archive' | 'settings' | null>(
    null,
  );
  const {
    activeSubtitle,
    isPlaying,
    progressRatio,
    replay,
    showChoices,
  } = useNodePlayback(node, preferences);

  const isEnding = isEndingNode(node);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activePanel) {
        if (event.key === 'Escape') {
          setActivePanel(null);
        }

        return;
      }

      if (event.key === ' ' || event.key.toLowerCase() === 'r') {
        event.preventDefault();
        replay();
      }

      if (event.key.toLowerCase() === 'm') {
        onToggleMute();
      }

      if (!showChoices || isEnding) {
        return;
      }

      const choiceIndex = Number(event.key) - 1;
      const choice = node.choices[choiceIndex];

      if (choice) {
        onChoose(choice.next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePanel, isEnding, node.choices, onChoose, onToggleMute, replay, showChoices]);

  return (
    <main className="game-shell">
      <div className="cinematic-orb cinematic-orb--left" />
      <div className="cinematic-orb cinematic-orb--right" />

      <section className={`scene-card ${showChoices ? 'scene-card--ready' : ''}`}>
        <header className="top-bar">
          <div className="top-bar__group">
            <button
              className="icon-button icon-button--quiet"
              type="button"
              aria-label="打开 Story Map"
              onClick={onOpenMap}
            >
              <span className="icon-button__glyph">地图</span>
            </button>
            <div>
              <p className="top-bar__eyebrow">互动音频叙事</p>
              <h1>午夜余波</h1>
            </div>
          </div>
          <button
            className="icon-button icon-button--quiet"
            type="button"
            aria-label="打开偏好设置"
            onClick={() => setActivePanel('settings')}
          >
            <span className="icon-button__glyph">偏好</span>
          </button>
        </header>

        <ProgressPanel
          endingReached={progress.endingReached}
          visitedCount={progress.visitedNodeIds.length}
        />

        <div className="player-stage">
          <AudioControls
            isMuted={preferences.isMuted}
            isPlaying={isPlaying}
            onReplay={replay}
            onToggleMute={onToggleMute}
          />
          <p className="player-stage__hint">快捷键：空格重播，M 静音，1-4 选项</p>
        </div>

        <div className="scene-visual" aria-hidden="true">
          <div
            className="scene-visual__progress"
            style={{ transform: `scaleX(${progressRatio})` }}
          />
        </div>

        <SubtitlePanel
          scale={preferences.subtitleScale}
          speaker={node.tone}
          subtitle={activeSubtitle}
        />

        {isEnding && showChoices ? (
          <EndingScreen
            node={node}
            visitedCount={progress.visitedNodeIds.length}
            onRestart={onRestart}
          />
        ) : (
          <section className={`choice-stage ${showChoices ? 'is-visible' : ''}`}>
            <p className="choice-stage__hint">
              {isEnding
                ? '结局正在落下帷幕……'
                : showChoices
                  ? '请选择你的下一步。'
                  : '语音仍在继续……'}
            </p>
            {isEnding ? null : (
              <ChoiceList
                choices={node.choices}
                disabled={!showChoices}
                onChoose={onChoose}
              />
            )}
          </section>
        )}

        <footer className="bottom-dock" aria-label="故事操作">
          <button
            className="dock-button"
            type="button"
            onClick={() => setActivePanel('archive')}
          >
            档案
          </button>
          <button className="dock-button dock-button--active" type="button" onClick={replay}>
            {isPlaying ? '回放台词' : '再次聆听'}
          </button>
          <button
            className="dock-button"
            type="button"
            onClick={() => setActivePanel('settings')}
          >
            偏好
          </button>
        </footer>

        {activePanel === 'archive' ? (
          <ArchivePanel
            currentNodeId={progress.currentNodeId}
            pathNodeIds={progress.pathNodeIds}
            unlockedEndingIds={unlockedEndingIds}
            visitedCount={progress.visitedNodeIds.length}
            onClose={() => setActivePanel(null)}
          />
        ) : null}

        {activePanel === 'settings' ? (
          <SettingsPanel
            preferences={preferences}
            onClearCollection={onClearCollection}
            onClose={() => setActivePanel(null)}
            onResetPreferences={onResetPreferences}
            onReturnToTitle={onRestart}
            onSetSubtitleMode={onSetSubtitleMode}
            onSetSubtitleScale={onSetSubtitleScale}
            onToggleMute={onToggleMute}
          />
        ) : null}
      </section>
    </main>
  );
};
