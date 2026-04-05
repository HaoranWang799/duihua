type StoryGeneratorPanelProps = {
  errorMessage: string | null;
  isGenerating: boolean;
  keywords: string;
  onGenerate: () => void;
  onKeywordsChange: (value: string) => void;
};

export const StoryGeneratorPanel = ({
  errorMessage,
  isGenerating,
  keywords,
  onGenerate,
  onKeywordsChange,
}: StoryGeneratorPanelProps) => {
  return (
    <section className="story-generator-panel" aria-label="AI 生成剧本">
      <div className="story-generator-panel__copy">
        <p className="eyebrow">Generate Tonight&apos;s Route</p>
        <h2>输入关键词，生成一局新故事</h2>
      </div>

      <label className="story-generator-panel__field">
        <textarea
          className="story-generator-panel__input"
          rows={2}
          value={keywords}
          onChange={(event) => onKeywordsChange(event.target.value)}
          placeholder="例如：雨夜、试探、依赖、失控"
        />
      </label>

      <button
        className="primary-button story-generator-panel__submit"
        type="button"
        disabled={isGenerating}
        onClick={onGenerate}
      >
        {isGenerating ? '生成中…' : '生成台词并开始'}
      </button>

      {errorMessage ? (
        <p className="story-generator-panel__error">{errorMessage}</p>
      ) : (
        <p className="story-generator-panel__note">生成后直接进入。</p>
      )}
    </section>
  );
};
