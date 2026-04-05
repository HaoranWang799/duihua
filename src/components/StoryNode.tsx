import type { StoryNode } from '../types/story';
import type { StoryMapNodeLayout } from '../types/storyMap';
import {
  STORY_MAP_NODE_HEIGHT,
  STORY_MAP_NODE_WIDTH,
} from '../utils/storyMapRuntime';
import { isEndingNode } from '../utils/storyRuntime';

type StoryNodeCardProps = {
  currentNodeId: string;
  isPreviewed: boolean;
  isVisited: boolean;
  layoutNode: StoryMapNodeLayout;
  node: StoryNode;
  onPreview: (nodeId: string) => void;
};

export const StoryNodeCard = ({
  currentNodeId,
  isPreviewed,
  isVisited,
  layoutNode,
  node,
  onPreview,
}: StoryNodeCardProps) => {
  const isCurrent = currentNodeId === layoutNode.id;
  const isEnding = isEndingNode(node);
  const stateClass = isCurrent ? 'current' : isVisited ? 'visited' : 'locked';

  return (
    <button
      className={`story-node story-node--${stateClass} ${isPreviewed ? 'is-previewed' : ''} ${isEnding ? 'is-ending' : ''}`}
      style={{
        left: `${layoutNode.x}px`,
        top: `${layoutNode.y}px`,
        width: `${STORY_MAP_NODE_WIDTH}px`,
        minHeight: `${STORY_MAP_NODE_HEIGHT}px`,
      }}
      type="button"
      onClick={() => onPreview(layoutNode.id)}
    >
      <span className="story-node__eyebrow">{isEnding ? 'Ending' : 'Route'}</span>
      <strong className="story-node__title">
        {isVisited || isCurrent ? layoutNode.label : 'Locked'}
      </strong>
      <span className="story-node__excerpt">
        {isVisited || isCurrent ? node.subtitle : '继续推进剧情后可查看。'}
      </span>
      {isCurrent ? <span className="story-node__marker">Current</span> : null}
      {isEnding ? <span className="story-node__ending-badge">END</span> : null}
    </button>
  );
};
