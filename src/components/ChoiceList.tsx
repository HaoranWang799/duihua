import type { StoryChoice } from '../types/story';

type ChoiceListProps = {
  choices: StoryChoice[];
  disabled?: boolean;
  onChoose: (nextId: string) => void;
};

export const ChoiceList = ({
  choices,
  disabled = false,
  onChoose,
}: ChoiceListProps) => {
  return (
    <div className="choice-list" role="list" aria-label="剧情选项">
      {choices.map((choice) => (
        <button
          key={`${choice.text}-${choice.next}`}
          className={`choice-button ${choices[0] === choice ? 'choice-button--featured' : ''}`}
          type="button"
          onClick={() => onChoose(choice.next)}
          disabled={disabled}
        >
          <span className="choice-button__label">{choice.text}</span>
          <span className="choice-button__chevron" aria-hidden="true">
            ›
          </span>
        </button>
      ))}
    </div>
  );
};
