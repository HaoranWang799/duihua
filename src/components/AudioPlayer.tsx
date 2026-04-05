type AudioPlayerProps = {
  isPreparingAudio: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  onReplay: () => void;
  onTogglePlayback: () => void;
};

export const AudioPlayer = ({
  isPreparingAudio,
  isPaused,
  isPlaying,
  onReplay,
  onTogglePlayback,
}: AudioPlayerProps) => {
  return (
    <div className="audio-player" aria-label="音频控制">
      <button
        className="audio-player__button audio-player__button--icon"
        type="button"
        onClick={onTogglePlayback}
        aria-label={
          isPreparingAudio ? '语音生成中' : isPlaying ? '暂停' : isPaused ? '继续' : '播放'
        }
      >
        {isPreparingAudio ? '…' : isPlaying ? '❚❚' : '▶'}
      </button>
      <button
        className="audio-player__button audio-player__button--icon"
        type="button"
        onClick={onReplay}
        aria-label="重播"
      >
        ↺
      </button>
    </div>
  );
};
