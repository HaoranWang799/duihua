import { STORY_START_ID } from '../data/story';
import type { StoryData, StoryNode, StoryProgress } from '../types/story';

export const getStoryStartNodeId = (storyData: StoryData) =>
  storyData.nodes.find((node) => node.id === STORY_START_ID)?.id ??
  storyData.nodes[0]?.id ??
  STORY_START_ID;

export const createStoryNodeMap = (storyData: StoryData) =>
  Object.fromEntries(
    storyData.nodes.map((node) => [node.id, node]),
  ) as Record<string, StoryNode>;

export const createInitialStoryProgress = (storyData: StoryData): StoryProgress => {
  const startNodeId = getStoryStartNodeId(storyData);

  return {
    currentNodeId: startNodeId,
    visitedNodeIds: [startNodeId],
    pathNodeIds: [startNodeId],
  };
};

export const getStoryEndingNodes = (storyData: StoryData) =>
  storyData.nodes.filter((node) => node.choices.length === 0);
