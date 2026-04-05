import type { StoryNode, StoryProgress } from '../types/story';
import type { StoryMapChapter } from '../types/storyMap';
import {
  buildChapterConnections,
  getExploredEdgeSet,
} from '../utils/storyMapRuntime';
import { StoryNodeCard } from './StoryNode';

type StoryMapProps = {
  chapter: StoryMapChapter;
  nodeMap: Record<string, StoryNode>;
  previewNodeId: string;
  progress: StoryProgress;
  onPreview: (nodeId: string) => void;
};

export const StoryMap = ({
  chapter,
  nodeMap,
  previewNodeId,
  progress,
  onPreview,
}: StoryMapProps) => {
  const connections = buildChapterConnections(chapter, nodeMap);
  const exploredEdges = getExploredEdgeSet(progress.pathNodeIds);

  return (
    <section className="story-map">
      <div
        className="story-map__canvas"
        style={{
          height: `${chapter.canvasHeight}px`,
          width: `${chapter.canvasWidth}px`,
        }}
      >
        <svg
          className="story-map__lines"
          viewBox={`0 0 ${chapter.canvasWidth} ${chapter.canvasHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {connections.map((connection) => {
            const isExplored = exploredEdges.has(`${connection.from}->${connection.to}`);

            return (
              <path
                key={`${connection.from}-${connection.to}`}
                className={`story-map__edge ${isExplored ? 'is-explored' : 'is-unexplored'}`}
                d={connection.path}
              />
            );
          })}
        </svg>

        {chapter.nodes.map((layoutNode) => (
          <StoryNodeCard
            key={layoutNode.id}
            currentNodeId={progress.currentNodeId}
            isPreviewed={previewNodeId === layoutNode.id}
            isVisited={progress.visitedNodeIds.includes(layoutNode.id)}
            layoutNode={layoutNode}
            node={nodeMap[layoutNode.id]}
            onPreview={onPreview}
          />
        ))}
      </div>
    </section>
  );
};
