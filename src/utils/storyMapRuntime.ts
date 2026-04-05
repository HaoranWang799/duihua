import type { StoryNode } from '../types/story';
import type {
  StoryMapChapter,
  StoryMapConnection,
  StoryMapNodeLayout,
} from '../types/storyMap';
import { isEndingNode } from './storyRuntime';

export const STORY_MAP_NODE_WIDTH = 110;
export const STORY_MAP_NODE_HEIGHT = 84;

export const getExploredEdgeSet = (pathNodeIds: string[]) =>
  new Set(
    pathNodeIds
      .slice(0, -1)
      .map((nodeId, index) => `${nodeId}->${pathNodeIds[index + 1]}`),
  );

const getConnectionPath = (
  source: StoryMapNodeLayout,
  target: StoryMapNodeLayout,
) => {
  const startX = source.x + STORY_MAP_NODE_WIDTH / 2;
  const startY = source.y + STORY_MAP_NODE_HEIGHT;
  const endX = target.x + STORY_MAP_NODE_WIDTH / 2;
  const endY = target.y;
  const curveY = startY + (endY - startY) * 0.48;

  return `M ${startX} ${startY} C ${startX} ${curveY}, ${endX} ${curveY}, ${endX} ${endY}`;
};

export const buildChapterConnections = (
  chapter: StoryMapChapter,
  nodeMap: Record<string, StoryNode>,
): StoryMapConnection[] => {
  const layoutMap = Object.fromEntries(
    chapter.nodes.map((node) => [node.id, node]),
  ) as Record<string, StoryMapNodeLayout>;

  return chapter.nodes.flatMap((layoutNode) =>
    (nodeMap[layoutNode.id]?.choices ?? [])
      .map((choice) => {
        const target = layoutMap[choice.next];

        if (!target) {
          return null;
        }

        return {
          from: layoutNode.id,
          path: getConnectionPath(layoutNode, target),
          to: choice.next,
        };
      })
      .filter((connection): connection is StoryMapConnection => Boolean(connection)),
  );
};

export const getChapterExploration = (
  chapter: StoryMapChapter,
  visitedNodeIds: string[],
) => {
  const visitedCount = chapter.nodes.filter((node) =>
    visitedNodeIds.includes(node.id),
  ).length;
  const totalCount = chapter.nodes.length;
  const percentage = Math.round((visitedCount / totalCount) * 100);

  return {
    percentage,
    totalCount,
    visitedCount,
  };
};

export const getNodeState = (
  nodeId: string,
  currentNodeId: string,
  visitedNodeIds: string[],
) => {
  if (nodeId === currentNodeId) {
    return 'current';
  }

  if (visitedNodeIds.includes(nodeId)) {
    return 'visited';
  }

  return 'locked';
};

export const getNodePreviewAvailability = (
  nodeId: string,
  visitedNodeIds: string[],
) => visitedNodeIds.includes(nodeId);

export const getNodeShortStatus = (node: StoryNode) =>
  isEndingNode(node) ? '终局' : '片段';
