import { LearningMindMap, CHEAT_SHEET_MAP } from './LearningMindMap';

export function AlgoCheatSheet({ basePath }: { basePath: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted mb-4">
        Spot the clue on the left, click the matching pattern on the right to open its learning path.
      </p>
      <LearningMindMap config={CHEAT_SHEET_MAP} basePath={basePath} />
    </div>
  );
}
