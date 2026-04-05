import type { StoryNode, SubtitleMode } from '../types/story';

const endingTitleMap: Record<string, string> = {
  trust_end: '结局一：沉溺信任',
  doubt_end: '结局二：迟疑退潮',
  refuse_end: '结局三：礼貌抽离',
};

const endingThemeMap: Record<string, 'hopeful' | 'mysterious' | 'ominous'> = {
  trust_end: 'hopeful',
  doubt_end: 'mysterious',
  refuse_end: 'ominous',
};

export const isEndingNode = (node: StoryNode) => node.choices.length === 0;

export const getEndingTitle = (node: StoryNode) =>
  endingTitleMap[node.id] ??
  `结局：${node.tone.split(/[、,，]/)[0]?.trim() || node.id}`;

export const getEndingTheme = (node: StoryNode) =>
  endingThemeMap[node.id] ??
  (/满足|深情|放松|温柔/.test(node.tone)
    ? 'hopeful'
    : /失望|冷|疏离|抽离|拒/.test(node.tone)
      ? 'ominous'
      : 'mysterious');

export const getEndingSummary = (node: StoryNode) => node.subtitle;

export const getSubtitleSegments = (subtitle: string) =>
  subtitle
    .split(/(?<=[。！？…])/)
    .map((segment) => segment.trim())
    .filter(Boolean);

export const getPlaybackDuration = (node: StoryNode) => {
  const words = node.subtitle.trim().length;
  return Math.min(Math.max(words * 120, 1800), 5200);
};

export const getCurrentSubtitle = (
  node: StoryNode,
  progressRatio: number,
  subtitleMode: SubtitleMode,
) => {
  if (subtitleMode === 'full') {
    return node.subtitle;
  }

  const subtitle = node.subtitle.trim();

  if (!subtitle.length) {
    return node.subtitle;
  }

  const weightedCharacters = Array.from(subtitle).map((character) => ({
    character,
    weight: /[，。！？；：、,.!?]/.test(character) ? 1.75 : /[…]/.test(character) ? 2.2 : 1,
  }));
  const totalWeight = weightedCharacters.reduce((sum, unit) => sum + unit.weight, 0);

  if (totalWeight <= 0 || progressRatio <= 0) {
    return '';
  }

  const targetWeight = totalWeight * Math.min(Math.max(progressRatio, 0), 1);
  let visibleWeight = 0;
  let visibleCount = 0;

  while (
    visibleCount < weightedCharacters.length &&
    (visibleWeight < targetWeight || visibleCount === 0)
  ) {
    visibleWeight += weightedCharacters[visibleCount].weight;
    visibleCount += 1;
  }

  return weightedCharacters
    .slice(0, visibleCount)
    .map((unit) => unit.character)
    .join('');
};
