import type { StoryExperience } from '../types/story';
import { StoryGeneratorPanel } from './StoryGeneratorPanel';

type TitleScreenProps = {
  endingsUnlocked: number;
  generatedStories: StoryExperience[];
  generationError: string | null;
  generationKeywords: string;
  hasResume: boolean;
  isGeneratingStory: boolean;
  onContinue: () => void;
  onGenerateStory: () => void;
  onGenerationKeywordsChange: (value: string) => void;
  onOpenGeneratedStory: (storyExperience: StoryExperience) => void;
  onOpenMap: () => void;
  onStart: () => void;
};

export const TitleScreen = ({
  endingsUnlocked,
  generatedStories,
  generationError,
  generationKeywords,
  hasResume,
  isGeneratingStory,
  onContinue,
  onGenerateStory,
  onGenerationKeywordsChange,
  onOpenGeneratedStory,
  onOpenMap,
  onStart,
}: TitleScreenProps) => {
  return (
    <section className="title-screen">
      <div className="title-screen__backdrop" />
      <div className="title-screen__content">
        <div className="title-screen__brand">
          <span className="title-screen__brand-mark">✦</span>
          <span className="title-screen__brand-name">欲望之扉 你的她</span>
        </div>
        <p className="eyebrow">The Noir Sanctuary</p>
        <h1>午夜余波</h1>
        <div className="title-screen__meta">
          <span>已解锁结局 {endingsUnlocked}</span>
          <span>{hasResume ? '未完成旅程' : '新的旅程'}</span>
        </div>
        <StoryGeneratorPanel
          errorMessage={generationError}
          isGenerating={isGeneratingStory}
          keywords={generationKeywords}
          onGenerate={onGenerateStory}
          onKeywordsChange={onGenerationKeywordsChange}
        />
        <section className="generated-story-library" aria-label="已生成的剧本">
          <div className="generated-story-library__header">
            <p className="eyebrow">Generated Stories</p>
            <h2>已生成的剧本</h2>
          </div>
          {generatedStories.length > 0 ? (
            <div className="generated-story-library__list">
              {generatedStories.map((storyExperience) => (
                <button
                  key={storyExperience.id}
                  className="generated-story-card"
                  type="button"
                  onClick={() => onOpenGeneratedStory(storyExperience)}
                >
                  <div className="generated-story-card__copy">
                    <strong>{storyExperience.title}</strong>
                    {storyExperience.summary ? <p>{storyExperience.summary}</p> : null}
                  </div>
                  <div className="generated-story-card__meta">
                    <span>{storyExperience.story.nodes.length} 个节点</span>
                    <span>
                      {storyExperience.promptKeywords?.trim()
                        ? `关键词：${storyExperience.promptKeywords}`
                        : 'AI 即时生成'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="generated-story-library__empty">
              <p className="generated-story-library__empty-title">还没有剧本</p>
            </div>
          )}
        </section>
        {hasResume ? (
          <button className="secondary-button" type="button" onClick={onContinue}>
            继续上次进度
          </button>
        ) : null}
        <button className="secondary-button" type="button" onClick={onOpenMap}>
          查看 Story Map
        </button>
        <button className="primary-button" type="button" onClick={onStart}>
          {hasResume ? '开始新一轮' : '开始故事'}
        </button>
      </div>
    </section>
  );
};
