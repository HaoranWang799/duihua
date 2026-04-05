import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_STORY_TITLE, story as defaultStory } from '../data/story';
import type { StoryExperience, StoryProgress } from '../types/story';
import {
  fetchArchiveSnapshot,
  persistArchiveSnapshot,
} from '../utils/archiveApi';
import { getEndingTitle, isEndingNode } from '../utils/storyRuntime';
import {
  normalizeStoredStoryExperience,
  normalizeStoredStoryExperiences,
  readArchiveSnapshot,
  writeArchiveSnapshot,
} from '../utils/storage';
import {
  createInitialStoryProgress,
  createStoryNodeMap,
} from '../utils/storyData';

const defaultStoryExperience: StoryExperience = {
  id: 'default-story',
  source: 'default',
  story: defaultStory,
  summary: '一段在黑暗中缓慢显形的互动叙事。',
  title: DEFAULT_STORY_TITLE,
};

const applyArchiveSnapshotToState = ({
  setGeneratedStoryExperiences,
  setProgress,
  setResumeProgress,
  setResumeStoryExperience,
  setStoryExperience,
  setUnlockedEndingIds,
  snapshot,
}: {
  setGeneratedStoryExperiences: Dispatch<SetStateAction<StoryExperience[]>>;
  setProgress: Dispatch<SetStateAction<StoryProgress>>;
  setResumeProgress: Dispatch<SetStateAction<StoryProgress | null>>;
  setResumeStoryExperience: Dispatch<SetStateAction<StoryExperience | null>>;
  setStoryExperience: Dispatch<SetStateAction<StoryExperience>>;
  setUnlockedEndingIds: Dispatch<SetStateAction<string[]>>;
  snapshot: ReturnType<typeof readArchiveSnapshot>;
}) => {
  const restoredStoryExperience =
    normalizeStoredStoryExperience(snapshot.activeExperience) ??
    defaultStoryExperience;

  setStoryExperience(restoredStoryExperience);
  setProgress(
    snapshot.activeProgress ??
      createInitialStoryProgress(restoredStoryExperience.story),
  );
  setResumeStoryExperience(
    normalizeStoredStoryExperience(snapshot.activeExperience),
  );
  setResumeProgress(snapshot.activeProgress ?? null);
  setGeneratedStoryExperiences(
    normalizeStoredStoryExperiences(snapshot.generatedExperiences),
  );
  setUnlockedEndingIds(snapshot.unlockedEndingIds ?? []);
};

export const useStoryEngine = () => {
  const archiveSnapshot = readArchiveSnapshot();
  const restoredExperience =
    normalizeStoredStoryExperience(archiveSnapshot.activeExperience) ??
    defaultStoryExperience;
  const [hasStarted, setHasStarted] = useState(false);
  const [progress, setProgress] = useState<StoryProgress>(
    archiveSnapshot.activeProgress ??
      createInitialStoryProgress(restoredExperience.story),
  );
  const [storyExperience, setStoryExperience] = useState<StoryExperience>(
    restoredExperience,
  );
  const [resumeProgress, setResumeProgress] = useState<StoryProgress | null>(
    archiveSnapshot.activeProgress,
  );
  const [resumeStoryExperience, setResumeStoryExperience] = useState<StoryExperience | null>(
    normalizeStoredStoryExperience(archiveSnapshot.activeExperience),
  );
  const [generatedStoryExperiences, setGeneratedStoryExperiences] = useState<StoryExperience[]>(
    normalizeStoredStoryExperiences(archiveSnapshot.generatedExperiences),
  );
  const [unlockedEndingIds, setUnlockedEndingIds] = useState<string[]>(
    archiveSnapshot.unlockedEndingIds,
  );
  const [isArchiveHydrated, setIsArchiveHydrated] = useState(false);
  const storyNodeMap = useMemo(
    () => createStoryNodeMap(storyExperience.story),
    [storyExperience.story],
  );

  const currentNode = useMemo(
    () =>
      storyNodeMap[progress.currentNodeId] ??
      storyExperience.story.nodes[0],
    [progress.currentNodeId, storyExperience.story.nodes, storyNodeMap],
  );

  useEffect(() => {
    let isCancelled = false;

    void fetchArchiveSnapshot()
      .then((response) => {
        if (isCancelled) {
          return;
        }

        if (response.snapshot) {
          applyArchiveSnapshotToState({
            setGeneratedStoryExperiences,
            setProgress,
            setResumeProgress,
            setResumeStoryExperience,
            setStoryExperience,
            setUnlockedEndingIds,
            snapshot: response.snapshot,
          });
        }
      })
      .catch(() => {
        // Keep local archive as fallback.
      })
      .finally(() => {
        if (!isCancelled) {
          setIsArchiveHydrated(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const nextSnapshot = {
      activeExperience: resumeStoryExperience,
      activeProgress: resumeProgress,
      generatedExperiences: generatedStoryExperiences,
      unlockedEndingIds,
    };

    writeArchiveSnapshot(nextSnapshot);

    if (!isArchiveHydrated) {
      return;
    }

    void persistArchiveSnapshot(nextSnapshot).catch(() => {
      // Keep local archive even if remote persistence fails temporarily.
    });
  }, [
    generatedStoryExperiences,
    isArchiveHydrated,
    resumeProgress,
    resumeStoryExperience,
    unlockedEndingIds,
  ]);

  const start = () => {
    const nextProgress = createInitialStoryProgress(defaultStoryExperience.story);
    setHasStarted(true);
    setStoryExperience(defaultStoryExperience);
    setProgress(nextProgress);
    setResumeStoryExperience(defaultStoryExperience);
    setResumeProgress(nextProgress);
  };

  const startGeneratedStory = (nextStoryExperience: StoryExperience) => {
    const nextProgress = createInitialStoryProgress(nextStoryExperience.story);
    setHasStarted(true);
    setStoryExperience(nextStoryExperience);
    setProgress(nextProgress);
    setResumeStoryExperience(nextStoryExperience);
    setResumeProgress(nextProgress);
    setGeneratedStoryExperiences((current) => {
      const nextStories = [
        nextStoryExperience,
        ...current.filter((item) => item.id !== nextStoryExperience.id),
      ];

      return nextStories.slice(0, 8);
    });
  };

  const openGeneratedStory = (nextStoryExperience: StoryExperience) => {
    const nextProgress = createInitialStoryProgress(nextStoryExperience.story);
    setHasStarted(true);
    setStoryExperience(nextStoryExperience);
    setProgress(nextProgress);
    setResumeStoryExperience(nextStoryExperience);
    setResumeProgress(nextProgress);
  };

  const continueStory = () => {
    if (!resumeProgress || !resumeStoryExperience) {
      return;
    }

    setHasStarted(true);
    setStoryExperience(resumeStoryExperience);
    setProgress(resumeProgress);
  };

  const choose = (nextId: string) => {
    const nextNode = storyNodeMap[nextId];

    if (!nextNode) {
      return;
    }

    const nextProgress = {
      currentNodeId: nextId,
      visitedNodeIds: progress.visitedNodeIds.includes(nextId)
        ? progress.visitedNodeIds
        : [...progress.visitedNodeIds, nextId],
      pathNodeIds: [...progress.pathNodeIds, nextId],
      endingReached: isEndingNode(nextNode) ? getEndingTitle(nextNode) : undefined,
    };

    setProgress(nextProgress);
    setResumeProgress(nextProgress);
    setResumeStoryExperience(storyExperience);

    if (isEndingNode(nextNode)) {
      setUnlockedEndingIds((current) =>
        current.includes(nextId) ? current : [...current, nextId],
      );
    }
  };

  const restart = () => {
    setHasStarted(false);
    setStoryExperience(defaultStoryExperience);
    setProgress(createInitialStoryProgress(defaultStoryExperience.story));
    setResumeProgress(null);
    setResumeStoryExperience(null);
  };

  const resetCollection = () => {
    setUnlockedEndingIds([]);
  };

  return {
    hasStarted,
    currentNode,
    storyExperience,
    progress,
    generatedStoryExperiences,
    hasResume: Boolean(resumeProgress),
    unlockedEndingIds,
    start,
    startGeneratedStory,
    openGeneratedStory,
    continueStory,
    choose,
    restart,
    resetCollection,
  };
};
