import { endingNodes, storyMap } from '../data/story';
import { getEndingSummary, getEndingTitle } from '../utils/storyRuntime';
import { OverlayPanel } from './OverlayPanel';

type ArchivePanelProps = {
  currentNodeId: string;
  pathNodeIds: string[];
  unlockedEndingIds: string[];
  visitedCount: number;
  onClose: () => void;
};

export const ArchivePanel = ({
  currentNodeId,
  pathNodeIds,
  unlockedEndingIds,
  visitedCount,
  onClose,
}: ArchivePanelProps) => {
  return (
    <OverlayPanel title="故事档案" subtitle="Archive" onClose={onClose}>
      <div className="overlay-section">
        <div className="stat-row">
          <div className="stat-chip">
            <span className="stat-chip__label">当前氛围</span>
            <strong>{storyMap[currentNodeId].tone}</strong>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__label">轨迹</span>
            <strong>{pathNodeIds.length} 段</strong>
          </div>
          <div className="stat-chip">
            <span className="stat-chip__label">探索</span>
            <strong>{visitedCount} 节点</strong>
          </div>
        </div>
      </div>

      <div className="overlay-section">
        <h3>本轮轨迹</h3>
        <ol className="history-list">
          {pathNodeIds.map((nodeId, index) => {
            const node = storyMap[nodeId];

            return (
              <li key={`${nodeId}-${index}`} className="history-card">
                <span className="history-card__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="history-card__speaker">{node.tone}</p>
                  <p className="history-card__text">{node.subtitle}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="overlay-section">
        <h3>结局收藏</h3>
        <div className="ending-collection">
          {endingNodes.map((endingNode) => {
            const isUnlocked = unlockedEndingIds.includes(endingNode.id);

            return (
              <article
                key={endingNode.id}
                className={`ending-card ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
              >
                <p className="ending-card__title">
                  {isUnlocked ? getEndingTitle(endingNode) : '未解锁结局'}
                </p>
                <p className="ending-card__summary">
                  {isUnlocked
                    ? getEndingSummary(endingNode)
                    : '继续探索不同选择，解锁更多结局与轨迹。'}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </OverlayPanel>
  );
};
