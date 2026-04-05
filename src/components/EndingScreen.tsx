import type { StoryNode } from '../types/story';
import {
  getEndingSummary,
  getEndingTheme,
  getEndingTitle,
} from '../utils/storyRuntime';

type EndingScreenProps = {
  node: StoryNode;
  visitedCount: number;
  onRestart: () => void;
};

export const EndingScreen = ({
  node,
  visitedCount,
  onRestart,
}: EndingScreenProps) => {
  const endingTitle = getEndingTitle(node);
  const endingSummary = getEndingSummary(node);
  const endingTheme = getEndingTheme(node);

  return (
    <section className={`ending-screen tone-${endingTheme}`}>
      <p className="eyebrow">结局已达成</p>
      <h2>{endingTitle}</h2>
      <p className="ending-screen__summary">{endingSummary}</p>
      <div className="ending-screen__meta">
        <span>本轮共探索 {visitedCount} 个节点</span>
        <span>情绪：{node.tone}</span>
      </div>
      <button className="primary-button" type="button" onClick={onRestart}>
        重新开始
      </button>
    </section>
  );
};
