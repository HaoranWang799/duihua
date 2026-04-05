import type { StoryPreferences, SubtitleMode, SubtitleScale } from '../types/story';
import { OverlayPanel } from './OverlayPanel';

type PreferencesModalProps = {
  preferences: StoryPreferences;
  onClose: () => void;
  onResetPreferences: () => void;
  onSetIntensity: (scale: SubtitleScale) => void;
  onSetSound: () => void;
  onSetSubtitleMode: (mode: SubtitleMode) => void;
  voiceError: string | null;
};

export const PreferencesModal = ({
  preferences,
  onClose,
  onResetPreferences,
  onSetIntensity,
  onSetSound,
  onSetSubtitleMode,
  voiceError,
}: PreferencesModalProps) => {
  return (
    <OverlayPanel title="体验偏好" subtitle="Experience Preferences" onClose={onClose}>
      <div className="preference-section">
        <p className="preference-section__label">字幕流动方式</p>
        <div className="preference-options">
          <button
            className={preferences.subtitleMode === 'timed' ? 'is-selected' : ''}
            type="button"
            onClick={() => onSetSubtitleMode('timed')}
          >
            Flow
            <span>逐步显现，更像耳语落下。</span>
          </button>
          <button
            className={preferences.subtitleMode === 'full' ? 'is-selected' : ''}
            type="button"
            onClick={() => onSetSubtitleMode('full')}
          >
            Full Sentence
            <span>整句呈现，一次看清。</span>
          </button>
        </div>
      </div>

      <div className="preference-section">
        <p className="preference-section__label">亲密强度</p>
        <div className="preference-options">
          <button
            className={preferences.subtitleScale === 'standard' ? 'is-selected' : ''}
            type="button"
            onClick={() => onSetIntensity('standard')}
          >
            Soft
            <span>克制、留白、呼吸感更强。</span>
          </button>
          <button
            className={preferences.subtitleScale === 'large' ? 'is-selected' : ''}
            type="button"
            onClick={() => onSetIntensity('large')}
          >
            Closer
            <span>字幕更靠近你，情绪更直接。</span>
          </button>
        </div>
      </div>

      <div className="preference-section">
        <p className="preference-section__label">声音状态</p>
        <button className="preference-toggle" type="button" onClick={onSetSound}>
          {preferences.isMuted ? '无声模式' : '有声模式'}
          <span>{preferences.isMuted ? '只保留文字情绪。' : '让声音继续引导你。'}</span>
        </button>
        {voiceError ? <p className="preference-error">{voiceError}</p> : null}
      </div>

      <div className="preference-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={onResetPreferences}
        >
          恢复默认
        </button>
      </div>
    </OverlayPanel>
  );
};
