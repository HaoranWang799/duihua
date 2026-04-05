import { useMemo, useState } from 'react';
import { PlayScene } from '../components/PlayScene';
import { StoryMapScreen } from '../components/StoryMapScreen';
import { TitleScreen } from '../components/TitleScreen';
import { getStoryMapLayout } from '../data/storyMapLayout';
import { getStoryVisualMap } from '../data/storyVisuals';
import { useStoryPreferences } from '../hooks/useStoryPreferences';
import { useStoryEngine } from '../hooks/useStoryEngine';
import {
  createGeneratedStoryExperience,
  generateStoryFromKeywords,
} from '../utils/aiStory';
import { preGenerateFishAudioTexts } from '../utils/fishAudio';
import { createStoryNodeMap } from '../utils/storyData';

export const GamePage = () => {
  const [screen, setScreen] = useState<'player' | 'map'>('player');
  const [generationKeywords, setGenerationKeywords] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [preGeneratingChapterIds, setPreGeneratingChapterIds] = useState<string[]>([]);
  const [preGeneratedChapterIds, setPreGeneratedChapterIds] = useState<string[]>([]);
  const {
    hasStarted,
    currentNode,
    storyExperience,
    progress,
    generatedStoryExperiences,
    hasResume,
    unlockedEndingIds,
    start,
    openGeneratedStory,
    startGeneratedStory,
    continueStory,
    choose,
    restart,
  } = useStoryEngine();
  const {
    preferences,
    toggleMute,
    setSubtitleMode,
    setSubtitleScale,
    resetPreferences,
  } = useStoryPreferences();
  const activeStoryMap = useMemo(
    () => createStoryNodeMap(storyExperience.story),
    [storyExperience.story],
  );
  const storyMapLayout = useMemo(
    () => getStoryMapLayout(storyExperience.story, storyExperience.title),
    [storyExperience.story, storyExperience.title],
  );
  const storyVisualMap = useMemo(
    () => getStoryVisualMap(storyExperience.story),
    [storyExperience.story],
  );
  const currentChapterId = storyMapLayout.nodeChapterMap[currentNode.id];
  const currentChapter =
    (currentChapterId ? storyMapLayout.chapterMap[currentChapterId] : undefined) ??
    storyMapLayout.chapters[0];
  const currentChapterCacheKey = `${storyExperience.id}:${currentChapter.id}`;

  const handlePreGenerateChapterAudio = async () => {
    const chapterId = currentChapterCacheKey;

    if (preGeneratedChapterIds.includes(chapterId)) {
      return '语音已缓存';
    }

    setPreGeneratingChapterIds((current) =>
      current.includes(chapterId) ? current : [...current, chapterId],
    );

    const texts = currentChapter.nodes
      .map((chapterNode) => activeStoryMap[chapterNode.id]?.subtitle ?? '')
      .filter(Boolean);

    try {
      const count = await preGenerateFishAudioTexts({
        config: preferences.fishAudio,
        texts,
      });
      const status = count > 0 ? '语音已缓存' : '当前章节没有可缓存语音';

      setPreGeneratedChapterIds((current) =>
        current.includes(chapterId) ? current : [...current, chapterId],
      );

      return status;
    } finally {
      setPreGeneratingChapterIds((current) =>
        current.filter((item) => item !== chapterId),
      );
    }
  };

  const handleGenerateStory = async () => {
    setGenerationError(null);
    setIsGeneratingStory(true);

    try {
      const payload = await generateStoryFromKeywords(generationKeywords);
      const nextExperience = createGeneratedStoryExperience(
        payload,
        generationKeywords,
      );

      startGeneratedStory(nextExperience);
      setScreen('player');
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : '这一轮故事没有成功生成。',
      );
    } finally {
      setIsGeneratingStory(false);
    }
  };

  if (screen === 'map') {
    return (
      <StoryMapScreen
        storyData={storyExperience.story}
        storyMapLayout={storyMapLayout}
        progress={progress}
        onBack={() => setScreen('player')}
      />
    );
  }

  if (!hasStarted) {
    return (
      <TitleScreen
        endingsUnlocked={unlockedEndingIds.length}
        generatedStories={generatedStoryExperiences}
        generationError={generationError}
        generationKeywords={generationKeywords}
        hasResume={hasResume}
        isGeneratingStory={isGeneratingStory}
        onContinue={continueStory}
        onGenerateStory={handleGenerateStory}
        onGenerationKeywordsChange={(value) => {
          setGenerationError(null);
          setGenerationKeywords(value);
        }}
        onOpenGeneratedStory={(nextStoryExperience) => {
          openGeneratedStory(nextStoryExperience);
          setScreen('player');
        }}
        onOpenMap={() => setScreen('map')}
        onStart={start}
      />
    );
  }

  return (
    <PlayScene
      currentChapterTitle={currentChapter.title}
      currentChapterId={currentChapter.id}
      hasPreGeneratedChapterAudio={preGeneratedChapterIds.includes(currentChapterCacheKey)}
      isPreGeneratingChapter={preGeneratingChapterIds.includes(currentChapterCacheKey)}
      node={currentNode}
      preferences={preferences}
      progress={progress}
      visual={storyVisualMap[currentNode.id]}
      onChoose={choose}
      onOpenMap={() => setScreen('map')}
      onPreGenerateChapterAudio={handlePreGenerateChapterAudio}
      onRestart={restart}
      onResetPreferences={resetPreferences}
      onSetSubtitleMode={setSubtitleMode}
      onSetSubtitleScale={setSubtitleScale}
      onToggleMute={toggleMute}
    />
  );
};
