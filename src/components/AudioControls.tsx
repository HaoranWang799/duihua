type AudioControlsProps = {
  isMuted: boolean;
  isPlaying: boolean;
  onReplay: () => void;
  onToggleMute: () => void;
};

export const AudioControls = ({
  isMuted,
  isPlaying,
  onReplay,
  onToggleMute,
}: AudioControlsProps) => {
  return (
    <div className="audio-controls" aria-label="音频控制">
      <button className="icon-button" type="button" onClick={onReplay}>
        回放
      </button>
      <button className="play-button" type="button" onClick={onReplay}>
        {isPlaying ? '播放中' : '播放'}
      </button>
      <button className="icon-button" type="button" onClick={onToggleMute}>
        {isMuted ? '开声' : '静音'}
      </button>
    </div>
  );
};
