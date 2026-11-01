import { getDonorLevel, getLevelProgress, getNextLevel } from '../../utils/pointsCalculator';

export default function LevelBadge({ points, showProgress = false, compact = false }) {
  const level = getDonorLevel(points);
  const nextLevel = getNextLevel(points);
  const progress = getLevelProgress(points);

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
          background: level.bg, color: level.color, border: `1px solid ${level.color}40`,
        }}
      >
        {level.icon} {level.name}
      </span>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: showProgress ? 8 : 0 }}>
        <span style={{ fontSize: 20 }}>{level.icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: level.color }}>{level.name}</span>
        <span style={{ fontSize: 13, color: '#64748B', marginLeft: 'auto' }}>{points} pts</span>
      </div>
      {showProgress && nextLevel && (
        <div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${level.color}, ${nextLevel.color})` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{level.name}</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{nextLevel.name} ({nextLevel.min} pts)</span>
          </div>
        </div>
      )}
      {showProgress && !nextLevel && (
        <div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '100%', background: `linear-gradient(90deg, ${level.color}, #9333ea)` }} />
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, textAlign: 'center' }}>Maximum Level Achieved! 🎉</p>
        </div>
      )}
    </div>
  );
}
