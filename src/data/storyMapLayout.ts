import { DEFAULT_STORY_TITLE, story as defaultStory } from './story';
import type { StoryData } from '../types/story';
import type {
  ResolvedStoryMapLayout,
  StoryMapChapter,
  StoryMapNodeLayout,
} from '../types/storyMap';
import { createStoryNodeMap, getStoryStartNodeId } from '../utils/storyData';

const defaultStoryMapChapters: StoryMapChapter[] = [
  {
    id: 'chapter-1',
    number: 1,
    title: '夜语沉降',
    subtitle: '从试探到信任、怀疑与抽离的分岔路径',
    canvasWidth: 400,
    canvasHeight: 1320,
    nodes: [
      { id: 'start', label: '初始来电', x: 146, y: 36 },
      { id: 'connect_1', label: '心跳失序', x: 18, y: 154 },
      { id: 'connect_2', label: '失眠邀约', x: 146, y: 154 },
      { id: 'connect_3', label: '语气变化', x: 274, y: 154 },
      { id: 'deepen_1', label: '靠近', x: 28, y: 304 },
      { id: 'deepen_2', label: '剖白', x: 146, y: 304 },
      { id: 'deepen_3', label: '引导', x: 264, y: 304 },
      { id: 'intimate_1', label: '掌控感', x: 18, y: 456 },
      { id: 'intimate_2', label: '敞开', x: 146, y: 456 },
      { id: 'intimate_3', label: '顺从', x: 274, y: 456 },
      { id: 'manipulate_1', label: '依赖', x: 98, y: 620 },
      { id: 'doubt_1', label: '起疑', x: 268, y: 620 },
      { id: 'refuse_1', label: '退后', x: 18, y: 714 },
      { id: 'doubt_2', label: '委屈', x: 268, y: 742 },
      { id: 'manipulate_2', label: '请求', x: 98, y: 836 },
      { id: 'doubt_3', label: '压力', x: 268, y: 918 },
      { id: 'doubt_4', label: '追问', x: 18, y: 972 },
      { id: 'refuse_2', label: '冷却', x: 98, y: 1082 },
      { id: 'manipulate_3', label: '诱导', x: 268, y: 1082 },
      { id: 'trust_end', label: '信任结局', x: 268, y: 1220 },
      { id: 'doubt_end', label: '疑虑结局', x: 18, y: 1220 },
      { id: 'refuse_end', label: '抽离结局', x: 98, y: 1220 },
    ],
  },
];

const toResolvedLayout = (chapters: StoryMapChapter[]): ResolvedStoryMapLayout => ({
  chapterMap: Object.fromEntries(
    chapters.map((chapter) => [chapter.id, chapter]),
  ) as Record<string, StoryMapChapter>,
  chapters,
  nodeChapterMap: Object.fromEntries(
    chapters.flatMap((chapter) =>
      chapter.nodes.map((node) => [node.id, chapter.id]),
    ),
  ) as Record<string, string>,
});

const defaultResolvedStoryMapLayout = toResolvedLayout(defaultStoryMapChapters);

const createNodeLabel = (subtitle: string, tone: string, index: number) => {
  const subtitleLabel = subtitle
    .replace(/[。！？…，,]/g, ' ')
    .split(/\s+/)
    .find(Boolean)
    ?.slice(0, 6);

  return subtitleLabel || tone.split(/[、,，]/)[0]?.trim().slice(0, 6) || `片段${index + 1}`;
};

const getAutoNodeDepthMap = (storyData: StoryData) => {
  const nodeMap = createStoryNodeMap(storyData);
  const startNodeId = getStoryStartNodeId(storyData);
  const queue = [startNodeId];
  const depthMap = new Map<string, number>([[startNodeId, 0]]);

  while (queue.length > 0) {
    const currentNodeId = queue.shift();

    if (!currentNodeId) {
      continue;
    }

    const currentNode = nodeMap[currentNodeId];
    const currentDepth = depthMap.get(currentNodeId) ?? 0;

    for (const choice of currentNode?.choices ?? []) {
      const nextDepth = currentDepth + 1;
      const existingDepth = depthMap.get(choice.next);

      if (existingDepth === undefined || nextDepth < existingDepth) {
        depthMap.set(choice.next, nextDepth);
        queue.push(choice.next);
      }
    }
  }

  storyData.nodes.forEach((node, index) => {
    if (!depthMap.has(node.id)) {
      depthMap.set(node.id, index + 1);
    }
  });

  return depthMap;
};

const buildAutoChapterNodes = (
  storyData: StoryData,
  canvasWidth: number,
): StoryMapNodeLayout[] => {
  const depthMap = getAutoNodeDepthMap(storyData);
  const groupedNodeIds = new Map<number, string[]>();

  storyData.nodes.forEach((node) => {
    const depth = depthMap.get(node.id) ?? 0;
    const nodesAtDepth = groupedNodeIds.get(depth) ?? [];
    nodesAtDepth.push(node.id);
    groupedNodeIds.set(depth, nodesAtDepth);
  });

  const depthEntries = [...groupedNodeIds.entries()].sort((a, b) => a[0] - b[0]);

  return depthEntries.flatMap(([depth, nodeIds]) => {
    const totalWidth = Math.max(1, nodeIds.length) * 128;
    const leftOffset = Math.max(16, (canvasWidth - totalWidth) / 2 + 8);

    return nodeIds.map((nodeId, index) => {
      const node = storyData.nodes.find((item) => item.id === nodeId);

      return {
        id: nodeId,
        label: createNodeLabel(node?.subtitle ?? nodeId, node?.tone ?? '', index),
        x: Math.max(18, leftOffset + index * 128),
        y: 36 + depth * 148,
      };
    });
  });
};

const buildGeneratedStoryMapLayout = (
  storyData: StoryData,
  storyTitle: string,
): ResolvedStoryMapLayout => {
  const depthMap = getAutoNodeDepthMap(storyData);
  const maxNodesPerDepth = [...new Set(depthMap.values())].reduce((max, depth) => {
    const count = storyData.nodes.filter((node) => (depthMap.get(node.id) ?? 0) === depth).length;
    return Math.max(max, count);
  }, 1);
  const canvasWidth = Math.max(400, maxNodesPerDepth * 128 + 72);
  const nodes = buildAutoChapterNodes(storyData, canvasWidth);
  const canvasHeight = Math.max(720, (nodes.at(-1)?.y ?? 0) + 180);

  return toResolvedLayout([
    {
      id: 'chapter-generated',
      number: 1,
      title: storyTitle || DEFAULT_STORY_TITLE,
      subtitle: '由关键词即时生成的分支路线',
      canvasHeight,
      canvasWidth,
      nodes,
    },
  ]);
};

export const getStoryMapLayout = (
  storyData: StoryData,
  storyTitle: string,
): ResolvedStoryMapLayout =>
  storyData === defaultStory
    ? defaultResolvedStoryMapLayout
    : buildGeneratedStoryMapLayout(storyData, storyTitle);

export const storyMapChapters = defaultResolvedStoryMapLayout.chapters;
export const storyMapChapterMap = defaultResolvedStoryMapLayout.chapterMap;
export const storyNodeChapterMap = defaultResolvedStoryMapLayout.nodeChapterMap;
