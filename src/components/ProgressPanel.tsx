type ProgressPanelProps = {
  endingReached?: string;
  visitedCount: number;
};

export const ProgressPanel = ({
  endingReached,
  visitedCount,
}: ProgressPanelProps) => {
  return (
    <aside className="progress-panel">
      <span>已解锁 {visitedCount} 段叙事</span>
      <span>{endingReached ? `已抵达：${endingReached}` : '故事仍在下沉'}</span>
    </aside>
  );
};
