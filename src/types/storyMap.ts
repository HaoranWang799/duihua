export type StoryMapNodeLayout = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type StoryMapChapter = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  canvasHeight: number;
  canvasWidth: number;
  nodes: StoryMapNodeLayout[];
};

export type StoryMapConnection = {
  from: string;
  path: string;
  to: string;
};

export type ResolvedStoryMapLayout = {
  chapterMap: Record<string, StoryMapChapter>;
  chapters: StoryMapChapter[];
  nodeChapterMap: Record<string, string>;
};
