import type { SubtitleScale } from '../types/story';

type SubtitlePanelProps = {
  scale: SubtitleScale;
  speaker?: string;
  subtitle: string;
};

export const SubtitlePanel = ({
  scale,
  speaker,
  subtitle,
}: SubtitlePanelProps) => {
  return (
    <section className="subtitle-panel" aria-live="polite">
      {speaker ? <p className="subtitle-panel__speaker">{speaker}</p> : null}
      <p
        className={`subtitle-panel__text ${scale === 'large' ? 'is-large' : ''}`}
      >
        {subtitle}
      </p>
    </section>
  );
};
