import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AchievementBadge, ACHIEVEMENT_DEFINITIONS, type Achievement, type AchievementType } from './AchievementBadge';

interface AchievementGridProps {
  achievements: Achievement[];
  title?: string;
  filterType?: AchievementType;
  showLocked?: boolean;
  columnCount?: number;
}

export function AchievementGrid({
  achievements,
  title = 'Achievements',
  filterType,
  showLocked = true,
  columnCount = 4,
}: AchievementGridProps) {
  const filtered = useMemo(() => {
    let result = achievements;

    if (filterType) {
      result = result.filter((a) => a.type === filterType);
    }

    if (!showLocked) {
      result = result.filter((a) => a.unlocked);
    }

    return result;
  }, [achievements, filterType, showLocked]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const unlockedPercent = Math.round((unlockedCount / totalCount) * 100);

  const typeColors: Record<AchievementType, string> = {
    streak: '#FF6B6B',
    mastery: '#10B981',
    speed: '#F59E0B',
    difficulty: '#8B5CF6',
    social: '#06B6D4',
    milestone: '#FFB703',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%' }}
    >
      {/* Header with Stats */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.subtitle}>
            {unlockedCount} of {totalCount} unlocked ({unlockedPercent}%)
          </p>
        </div>

        {/* Progress Ring */}
        <svg width="80" height="80" style={{ margin: '0 16px' }}>
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#E0E0E0"
            strokeWidth="4"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 35}`}
            strokeDashoffset={`${2 * Math.PI * 35 * (1 - unlockedPercent / 100)}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - unlockedPercent / 100) }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <text x="40" y="50" textAnchor="middle" style={styles.progressText}>
            {unlockedPercent}%
          </text>
        </svg>
      </div>

      {/* Category Filters */}
      <div style={styles.filterRow}>
        {(['streak', 'mastery', 'speed', 'difficulty', 'social', 'milestone'] as AchievementType[]).map((type) => {
          const typeAchievements = achievements.filter((a) => a.type === type);
          const typeUnlocked = typeAchievements.filter((a) => a.unlocked).length;
          const isActive = filterType === type;

          return (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                // Would filter grid here in parent component
              }}
              style={{
                ...styles.filterButton,
                backgroundColor: isActive ? typeColors[type] : '#F0F2F5',
                color: isActive ? 'white' : '#1a1a2e',
                borderColor: typeColors[type],
              }}
            >
              <span style={styles.filterEmoji}>
                {
                  {
                    streak: '🔥',
                    mastery: '📚',
                    speed: '⚡',
                    difficulty: '💪',
                    social: '👥',
                    milestone: '🎯',
                  }[type]
                }
              </span>
              <span style={styles.filterText}>
                {type.charAt(0).toUpperCase() + type.slice(1)} ({typeUnlocked}/{typeAchievements.length})
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Achievements Grid */}
      <motion.div
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {filtered.length > 0 ? (
          filtered.map((achievement, idx) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              style={{ display: 'flex', justifyContent: 'center', padding: '16px 8px' }}
            >
              <AchievementBadge achievement={achievement} size="medium" showToast={false} />
            </motion.div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <p>No achievements to display</p>
          </div>
        )}
      </motion.div>

      {/* Category Breakdowns */}
      <div style={styles.statsSection}>
        <h3 style={styles.statsTitle}>Breakdown by Type</h3>
        <div style={styles.statsList}>
          {(['streak', 'mastery', 'speed', 'difficulty', 'social', 'milestone'] as AchievementType[]).map((type) => {
            const typeAchievements = achievements.filter((a) => a.type === type);
            const typeUnlocked = typeAchievements.filter((a) => a.unlocked).length;
            const typePercent = Math.round((typeUnlocked / typeAchievements.length) * 100);

            return (
              <motion.div
                key={type}
                style={{
                  ...styles.statItem,
                  borderLeftColor: typeColors[type],
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div style={styles.statInfo}>
                  <span style={styles.statName}>{type.toUpperCase()}</span>
                  <span style={styles.statValue}>
                    {typeUnlocked}/{typeAchievements.length}
                  </span>
                </div>
                <div style={styles.statBar}>
                  <motion.div
                    style={{
                      ...styles.statBarFill,
                      backgroundColor: typeColors[type],
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${typePercent}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    background: 'linear-gradient(135deg, #F0F9FF 0%, #E8F4F8 100%)',
    borderRadius: '16px',
    marginBottom: '24px',
  },

  title: {
    fontSize: '1.6rem',
    fontWeight: 900,
    fontFamily: 'var(--font-heading)',
    color: '#1a1a2e',
    margin: 0,
  },

  subtitle: {
    fontSize: '0.9rem',
    color: '#6b7a8d',
    fontWeight: 600,
    margin: '4px 0 0',
  },

  progressText: {
    fontSize: '14px',
    fontWeight: 'bold',
    fill: '#10B981',
    fontFamily: 'var(--font-mono)',
  },

  filterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto' as const,
    paddingBottom: '8px',
  },

  filterButton: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.2s',
    minHeight: '40px',
  },

  filterEmoji: {
    fontSize: '1rem',
  },

  filterText: {
    lineHeight: 1.2,
  },

  grid: {
    display: 'grid',
    gap: '8px',
    marginBottom: '32px',
    padding: '16px 0',
  },

  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '40px 20px',
    color: '#6b7a8d',
    fontSize: '1rem',
  },

  statsSection: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '2px solid #E0E0E0',
  },

  statsTitle: {
    fontSize: '1.2rem',
    fontWeight: 900,
    fontFamily: 'var(--font-heading)',
    color: '#1a1a2e',
    marginBottom: '16px',
  },

  statsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },

  statItem: {
    background: '#FFFFFF',
    borderRadius: '8px',
    padding: '12px',
    borderLeft: '4px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  statInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: '60px',
  },

  statName: {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: '#6b7a8d',
    textTransform: 'uppercase' as const,
  },

  statValue: {
    fontSize: '1.1rem',
    fontWeight: 900,
    color: '#1a1a2e',
    fontFamily: 'var(--font-mono)',
  },

  statBar: {
    flex: 1,
    height: '8px',
    background: '#E0E0E0',
    borderRadius: '4px',
    overflow: 'hidden',
  },

  statBarFill: {
    height: '100%',
    borderRadius: '4px',
  },
};
