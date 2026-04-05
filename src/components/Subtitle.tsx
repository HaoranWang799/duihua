import type { ReactNode } from 'react';
import type { SubtitleScale } from '../types/story';

type SubtitleProps = {
  accentLabel?: string;
  actions?: ReactNode;
  fullSubtitle?: string;
  scale: SubtitleScale;
  subtitle: string;
};

export const Subtitle = ({
  accentLabel,
  actions,
  fullSubtitle,
  scale,
  subtitle,
}: SubtitleProps) => {
  return (
    <section className="subtitle" aria-live="polite">
      {accentLabel || actions ? (
        <div className="subtitle__head">
          {accentLabel ? (
            <div className="subtitle__accent">
              <span className="subtitle__accent-line" />
              <p className="subtitle__accent-text">{accentLabel}</p>
            </div>
          ) : <span />}
          {actions ? <div className="subtitle__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className={`subtitle__body ${scale === 'large' ? 'is-large' : ''}`}>
        <p className="subtitle__ghost" aria-hidden="true">
          {fullSubtitle ?? subtitle}
        </p>
        <p className={`subtitle__text ${scale === 'large' ? 'is-large' : ''}`}>
          {subtitle || '\u00A0'}
        </p>
      </div>
    </section>
  );
};
