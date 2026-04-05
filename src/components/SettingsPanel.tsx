import type {
  StoryPreferences,
  SubtitleMode,
  SubtitleScale,
} from '../types/story';
import { OverlayPanel } from './OverlayPanel';

type SettingsPanelProps = {
  preferences: StoryPreferences;
  onClearCollection: () => void;
  onClose: () => void;
  onResetPreferences: () => void;
  onReturnToTitle: () => void;
  onSetSubtitleMode: (mode: SubtitleMode) => void;
  onSetSubtitleScale: (scale: SubtitleScale) => void;
  onToggleMute: () => void;
};

export const SettingsPanel = ({
  preferences,
  onClearCollection,
  onClose,
  onResetPreferences,
  onReturnToTitle,
  onSetSubtitleMode,
  onSetSubtitleScale,
  onToggleMute,
}: SettingsPanelProps) => {
  return (
    <OverlayPanel title="偏好设置" subtitle="Settings" onClose={onClose}>
      <div className="overlay-section">
        <h3>声音</h3>
        <div className="settings-row">
          <div>
            <p className="settings-row__title">静音切换</p>
            <p className="settings-row__hint">在所有节点之间保持一致。</p>
          </div>
          <button className="pill-toggle" type="button" onClick={onToggleMute}>
            {preferences.isMuted ? '当前：静音' : '当前：有声'}
          </button>
        </div>
      </div>

      <div className="overlay-section">
        <h3>字幕</h3>
        <div className="option-group">
          <p className="settings-row__title">显示方式</p>
          <div className="segmented-control">
            <button
              className={preferences.subtitleMode === 'timed' ? 'is-selected' : ''}
              type="button"
              onClick={() => onSetSubtitleMode('timed')}
            >
              节奏字幕
            </button>
            <button
              className={preferences.subtitleMode === 'full' ? 'is-selected' : ''}
              type="button"
              onClick={() => onSetSubtitleMode('full')}
            >
              整句字幕
            </button>
          </div>
        </div>
        <div className="option-group">
          <p className="settings-row__title">字号大小</p>
          <div className="segmented-control">
            <button
              className={preferences.subtitleScale === 'standard' ? 'is-selected' : ''}
              type="button"
              onClick={() => onSetSubtitleScale('standard')}
            >
              标准
            </button>
            <button
              className={preferences.subtitleScale === 'large' ? 'is-selected' : ''}
              type="button"
              onClick={() => onSetSubtitleScale('large')}
            >
              放大
            </button>
          </div>
        </div>
      </div>

      <div className="overlay-section">
        <h3>操作</h3>
        <div className="action-stack">
          <button className="secondary-button" type="button" onClick={onReturnToTitle}>
            返回标题页
          </button>
          <button className="secondary-button" type="button" onClick={onResetPreferences}>
            恢复默认偏好
          </button>
          <button className="secondary-button" type="button" onClick={onClearCollection}>
            清空结局收藏
          </button>
        </div>
      </div>
    </OverlayPanel>
  );
};
