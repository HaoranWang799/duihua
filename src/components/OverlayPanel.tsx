import type { ReactNode } from 'react';

type OverlayPanelProps = {
  children: ReactNode;
  title: string;
  subtitle: string;
  onClose: () => void;
};

export const OverlayPanel = ({
  children,
  title,
  subtitle,
  onClose,
}: OverlayPanelProps) => {
  return (
    <div
      className="overlay-shell"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        className="overlay-shell__scrim"
        type="button"
        aria-label="关闭面板"
        onClick={onClose}
      />
      <section className="overlay-card">
        <header className="overlay-card__header">
          <div>
            <p className="eyebrow">{subtitle}</p>
            <h2>{title}</h2>
          </div>
          <button className="icon-button icon-button--quiet" type="button" onClick={onClose}>
            <span className="icon-button__glyph">关闭</span>
          </button>
        </header>
        {children}
      </section>
    </div>
  );
};
