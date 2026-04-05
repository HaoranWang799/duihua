import { story as defaultStory } from './story';
import type { StoryData } from '../types/story';

type StoryVisual = {
  sceneLabel: string;
  accentLabel: string;
  imageUrl: string;
};

const visualGroups = {
  chamber:
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80',
  silhouette:
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
  lilies:
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  corridor:
    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
  confession:
    'https://images.unsplash.com/photo-1516589091380-5d60136b4d3f?auto=format&fit=crop&w=1200&q=80',
  endingTrust:
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
  endingDoubt:
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
  endingRefuse:
    'https://images.unsplash.com/photo-1511300636408-a63a89df3482?auto=format&fit=crop&w=1200&q=80',
} as const;

const manualVisuals: Record<string, StoryVisual> = {
  start: { sceneLabel: 'Scene 1', accentLabel: '深夜密语', imageUrl: visualGroups.chamber },
  connect_1: { sceneLabel: 'Scene 2', accentLabel: '心跳回响', imageUrl: visualGroups.silhouette },
  connect_2: { sceneLabel: 'Scene 3', accentLabel: '夜色依赖', imageUrl: visualGroups.chamber },
  connect_3: { sceneLabel: 'Scene 4', accentLabel: '神秘邀约', imageUrl: visualGroups.corridor },
  deepen_1: { sceneLabel: 'Scene 5', accentLabel: '靠近一点', imageUrl: visualGroups.lilies },
  deepen_2: { sceneLabel: 'Scene 6', accentLabel: '隐秘告白', imageUrl: visualGroups.confession },
  deepen_3: { sceneLabel: 'Scene 7', accentLabel: '顺从渴望', imageUrl: visualGroups.lilies },
  intimate_1: { sceneLabel: 'Scene 8', accentLabel: '掌控边缘', imageUrl: visualGroups.confession },
  intimate_2: { sceneLabel: 'Scene 9', accentLabel: '彻底敞开', imageUrl: visualGroups.silhouette },
  intimate_3: { sceneLabel: 'Scene 10', accentLabel: '继续听话', imageUrl: visualGroups.chamber },
  manipulate_1: { sceneLabel: 'Scene 11', accentLabel: '脆弱联结', imageUrl: visualGroups.confession },
  manipulate_2: { sceneLabel: 'Scene 12', accentLabel: '禁忌契约', imageUrl: visualGroups.corridor },
  manipulate_3: { sceneLabel: 'Scene 13', accentLabel: '耳边低语', imageUrl: visualGroups.silhouette },
  doubt_1: { sceneLabel: 'Scene 14', accentLabel: '裂痕初现', imageUrl: visualGroups.endingDoubt },
  doubt_2: { sceneLabel: 'Scene 15', accentLabel: '委屈失衡', imageUrl: visualGroups.endingDoubt },
  doubt_3: { sceneLabel: 'Scene 16', accentLabel: '压力蔓延', imageUrl: visualGroups.endingDoubt },
  doubt_4: { sceneLabel: 'Scene 17', accentLabel: '试探更深', imageUrl: visualGroups.corridor },
  refuse_1: { sceneLabel: 'Scene 18', accentLabel: '突然停下', imageUrl: visualGroups.endingRefuse },
  refuse_2: { sceneLabel: 'Scene 19', accentLabel: '渐冷空气', imageUrl: visualGroups.endingRefuse },
  trust_end: { sceneLabel: 'Ending', accentLabel: '信任终章', imageUrl: visualGroups.endingTrust },
  doubt_end: { sceneLabel: 'Ending', accentLabel: '怀疑终章', imageUrl: visualGroups.endingDoubt },
  refuse_end: { sceneLabel: 'Ending', accentLabel: '克制终章', imageUrl: visualGroups.endingRefuse },
};

const getAccentLabel = (tone: string) =>
  tone
    .split(/[、,，]/)
    .map((segment) => segment.trim())
    .find(Boolean)
    ?.slice(0, 6) ?? '片段';

const getGeneratedVisual = (tone: string, index: number, isEnding: boolean): StoryVisual => {
  const toneText = tone.toLowerCase();
  const imageUrl = (() => {
    if (isEnding && /信任|满足|放松|深情/.test(tone)) {
      return visualGroups.endingTrust;
    }

    if (isEnding && /失望|怀疑|疏离|冷/.test(tone)) {
      return visualGroups.endingDoubt;
    }

    if (isEnding) {
      return visualGroups.endingRefuse;
    }

    if (/神秘|诱导|危险|控制/.test(tone)) {
      return visualGroups.corridor;
    }

    if (/温柔|安心|依赖|顺从/.test(tone)) {
      return visualGroups.lilies;
    }

    if (/亲密|热|呼吸|渴望/.test(toneText)) {
      return visualGroups.confession;
    }

    return index % 2 === 0 ? visualGroups.chamber : visualGroups.silhouette;
  })();

  return {
    sceneLabel: isEnding ? 'Ending' : `Scene ${index + 1}`,
    accentLabel: getAccentLabel(tone),
    imageUrl,
  };
};

export const getStoryVisualMap = (storyData: StoryData) => {
  const isDefaultStory = storyData === defaultStory;

  return Object.fromEntries(
    storyData.nodes.map((node, index) => [
      node.id,
      isDefaultStory && manualVisuals[node.id]
        ? manualVisuals[node.id]
        : getGeneratedVisual(node.tone, index, node.choices.length === 0),
    ]),
  ) as Record<string, StoryVisual>;
};
