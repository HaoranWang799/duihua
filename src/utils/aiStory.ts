import type { StoryData, StoryExperience } from '../types/story';

type GeneratedStoryPayload = {
  story: StoryData;
  summary: string;
  title: string;
};

const STORY_GENERATION_URL = '/api/story/generate';

const ensureText = (value: unknown, label: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} 为空，暂时无法使用这次生成结果。`);
  }

  return value.trim();
};

const ensureStoryData = (value: unknown): StoryData => {
  if (!value || typeof value !== 'object' || !Array.isArray((value as StoryData).nodes)) {
    throw new Error('生成结果缺少有效的故事节点。');
  }

  const nodes = (value as StoryData).nodes.map((node, index) => {
    if (!node || typeof node !== 'object') {
      throw new Error(`第 ${index + 1} 个节点格式不正确。`);
    }

    const id = ensureText((node as { id?: unknown }).id, '节点 id');
    const subtitle = ensureText(
      (node as { subtitle?: unknown }).subtitle,
      `节点 ${id} 的台词`,
    );
    const tone = ensureText((node as { tone?: unknown }).tone, `节点 ${id} 的情绪`);
    const rawChoices = (node as { choices?: unknown }).choices;

    if (!Array.isArray(rawChoices)) {
      throw new Error(`节点 ${id} 的 choices 缺失。`);
    }

    return {
      id,
      subtitle,
      tone,
      choices: rawChoices.map((choice, choiceIndex) => {
        if (!choice || typeof choice !== 'object') {
          throw new Error(`节点 ${id} 的第 ${choiceIndex + 1} 个选项格式不正确。`);
        }

        return {
          next: ensureText(
            (choice as { next?: unknown }).next,
            `节点 ${id} 的选项跳转`,
          ),
          text: ensureText(
            (choice as { text?: unknown }).text,
            `节点 ${id} 的选项文案`,
          ),
        };
      }),
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));

  if (!nodeIds.has('start')) {
    throw new Error('生成结果缺少起始节点 start。');
  }

  if (nodeIds.size !== nodes.length) {
    throw new Error('生成结果里出现了重复节点 id。');
  }

  for (const node of nodes) {
    for (const choice of node.choices) {
      if (!nodeIds.has(choice.next)) {
        throw new Error(`节点 ${node.id} 指向了不存在的节点 ${choice.next}。`);
      }
    }
  }

  const endingCount = nodes.filter((node) => node.choices.length === 0).length;

  if (endingCount < 3) {
    throw new Error('生成结果的结局数量太少，请重新生成。');
  }

  return { nodes };
};

const getErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? `故事生成失败（${response.status}）`;
  } catch {
    return `故事生成失败（${response.status}）`;
  }
};

export const generateStoryFromKeywords = async (keywords: string) => {
  const trimmedKeywords = keywords.trim();

  if (!trimmedKeywords) {
    throw new Error('先输入几个关键词，我再帮你生成今夜的新故事。');
  }

  const response = await fetch(STORY_GENERATION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      keywords: trimmedKeywords,
    }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const payload = (await response.json()) as GeneratedStoryPayload;

  return {
    story: ensureStoryData(payload.story),
    summary: ensureText(payload.summary, '故事摘要'),
    title: ensureText(payload.title, '故事标题'),
  } satisfies GeneratedStoryPayload;
};

export const createGeneratedStoryExperience = (
  payload: GeneratedStoryPayload,
  keywords: string,
): StoryExperience => ({
  id: `generated-${Date.now()}`,
  promptKeywords: keywords.trim(),
  source: 'generated',
  story: payload.story,
  summary: payload.summary,
  title: payload.title,
});
