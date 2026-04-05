import { useMemo, useState } from 'react';
import type { StoryData, StoryProgress } from '../types/story';
import type { ResolvedStoryMapLayout } from '../types/storyMap';
import {
  getChapterExploration,
  getNodePreviewAvailability,
} from '../utils/storyMapRuntime';
import { createStoryNodeMap } from '../utils/storyData';
import { getEndingTitle, isEndingNode } from '../utils/storyRuntime';
import { StoryMap } from './StoryMap';

type StoryMapScreenProps = {
  storyData: StoryData;
  storyMapLayout: ResolvedStoryMapLayout;
  progress: StoryProgress;
  onBack: () => void;
};

export const StoryMapScreen = ({
  storyData,
  storyMapLayout,
  progress,
  onBack,
}: StoryMapScreenProps) => {
  const storyNodeMap = useMemo(() => createStoryNodeMap(storyData), [storyData]);
  const defaultChapterId =
    storyMapLayout.nodeChapterMap[progress.currentNodeId] ??
    storyMapLayout.chapters[0].id;
  const [selectedChapterId, setSelectedChapterId] = useState(defaultChapterId);
  const [previewNodeId, setPreviewNodeId] = useState(progress.currentNodeId);

  const chapter = storyMapLayout.chapterMap[selectedChapterId];
  const chapterExploration = useMemo(
    () => getChapterExploration(chapter, progress.visitedNodeIds),
    [chapter, progress.visitedNodeIds],
  );
  const effectivePreviewNodeId = chapter.nodes.some(
    (node) => node.id === previewNodeId,
  )
    ? previewNodeId
    : chapter.nodes[0].id;
  const previewNode = storyNodeMap[effectivePreviewNodeId];
  const previewLayout =
    chapter.nodes.find((node) => node.id === effectivePreviewNodeId) ??
    chapter.nodes[0];
  const previewVisited = getNodePreviewAvailability(
    effectivePreviewNodeId,
    progress.visitedNodeIds,
  );

  return (
    <main className="map-shell">
      <div className="cinematic-orb cinematic-orb--left" />
      <div className="cinematic-orb cinematic-orb--right" />

      <section className="map-card">
        <header className="map-header">
          <button className="icon-button icon-button--quiet" type="button" onClick={onBack}>
            <span className="icon-button__glyph">返回</span>
          </button>
          <div className="map-header__copy">
            <p className="eyebrow">Chapter Flow</p>
            <h1>章节路线总览</h1>
          </div>
          <div className="map-header__progress">
            <span>{chapterExploration.percentage}%</span>
            <small>已探索</small>
          </div>
        </header>

        <section className="chapter-strip" aria-label="章节导航">
          {storyMapLayout.chapters.map((item) => {
            const isActive = item.id === selectedChapterId;

            return (
              <button
                key={item.id}
                className={`chapter-tab ${isActive ? 'is-active' : ''}`}
                type="button"
                onClick={() => setSelectedChapterId(item.id)}
              >
                <span className="chapter-tab__number">
                  {String(item.number).padStart(2, '0')}
                </span>
                <span className="chapter-tab__title">{item.title}</span>
              </button>
            );
          })}
        </section>

        <section className="chapter-progress-card">
          <div>
            <p className="chapter-progress-card__title">{chapter.title}</p>
            <p className="chapter-progress-card__subtitle">{chapter.subtitle}</p>
          </div>
          <div className="chapter-progress-card__meta">
            <span>
              {chapterExploration.visitedCount}/{chapterExploration.totalCount}
            </span>
          </div>
          <div className="chapter-progress-card__track" aria-hidden="true">
            <div
              className="chapter-progress-card__fill"
              style={{ width: `${chapterExploration.percentage}%` }}
            />
          </div>
        </section>

        <section className="map-canvas-wrap">
          <StoryMap
            chapter={chapter}
            nodeMap={storyNodeMap}
            previewNodeId={effectivePreviewNodeId}
            progress={progress}
            onPreview={setPreviewNodeId}
          />
        </section>

        <section className="map-preview-card">
          <div className="map-preview-card__header">
            <div>
              <p className="eyebrow">Node Preview</p>
              <h2>
                {previewVisited
                  ? isEndingNode(previewNode)
                    ? getEndingTitle(previewNode)
                    : previewLayout.label
                  : '锁定片段'}
              </h2>
            </div>
            <span className={`map-preview-card__status ${previewVisited ? 'is-open' : 'is-locked'}`}>
              {previewVisited ? '已探索' : '未解锁'}
            </span>
          </div>
          <p className="map-preview-card__tone">
            {previewVisited ? previewNode.tone : '继续推进当前章节，解锁这段叙事预览。'}
          </p>
          <p className="map-preview-card__subtitle">
            {previewVisited
              ? previewNode.subtitle
              : '这张节点卡片只显示路线位置，不会提前透出完整内容。'}
          </p>
          <div className="map-preview-card__choices">
            {previewVisited ? (
              previewNode.choices.length > 0 ? (
              previewNode.choices.map((choice) => (
                  <span
                    key={`${previewNode.id}-${choice.next}-${choice.text}`}
                    className="map-choice-pill"
                  >
                    {choice.text}
                  </span>
                ))
              ) : (
                <span className="map-choice-pill map-choice-pill--ending">结局节点</span>
              )
            ) : (
              <span className="map-choice-pill map-choice-pill--locked">内容保留</span>
            )}
          </div>
        </section>

        <footer className="map-legend" aria-label="路线图图例">
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--current-node" />
            当前所在
          </span>
          <span className="legend-item">
            <span className="legend-line legend-line--explored" />
            已探索路径
          </span>
          <span className="legend-item">
            <span className="legend-line legend-line--unexplored" />
            未探索路径
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--normal-node" />
            普通节点
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--ending-node" />
            结局节点
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-swatch--locked-node" />
            锁定节点
          </span>
        </footer>
      </section>
    </main>
  );
};
