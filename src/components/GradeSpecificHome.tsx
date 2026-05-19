import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useSFX } from '../hooks/useSFX';
import type { Grade } from '../store/useAppStore';

interface GradeHomeProps {
  onPlayKahoot: () => void;
  onPlayCBT: () => void;
  onPlayGames: () => void;
  totalPoints: number;
  streak: number;
  completedTopics: number;
}

export function GradeSpecificHome({
  onPlayKahoot,
  onPlayCBT,
  onPlayGames,
  totalPoints,
  streak,
  completedTopics,
}: GradeHomeProps) {
  const { selectedGrade } = useAppStore();
  const { play } = useSFX();

  const gradeCategory = useMemo(() => {
    if (selectedGrade === 'P1' || selectedGrade === 'P2') return 'early';
    if (selectedGrade === 'P3' || selectedGrade === 'P4') return 'middle';
    return 'advanced';
  }, [selectedGrade]);

  // P1-P2: Minimal, emoji-heavy, single action buttons
  if (gradeCategory === 'early') {
    return (
      <div style={earlyStyle.container}>
        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={earlyStyle.mascot}
        >
          <div style={earlyStyle.mascotEmoji}>🎓</div>
          <div style={earlyStyle.mascotText}>Hi there! Ready to learn?</div>
        </motion.div>

        {/* Score */}
        <motion.div
          style={earlyStyle.scoreCard}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div style={earlyStyle.scoreNumber}>{totalPoints}</div>
          <div style={earlyStyle.scoreLabel}>Points</div>
        </motion.div>

        {/* Big Action Buttons */}
        <motion.div
          style={earlyStyle.buttonGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { label: 'Kahoot', emoji: '⚡', action: onPlayKahoot },
            { label: 'Questions', emoji: '❓', action: onPlayCBT },
            { label: 'Games', emoji: '🎮', action: onPlayGames },
          ].map((item, idx) => (
            <motion.button
              key={item.label}
              onClick={() => {
                play('click');
                item.action();
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              style={earlyStyle.actionButton}
            >
              <div style={earlyStyle.actionEmoji}>{item.emoji}</div>
              <div style={earlyStyle.actionLabel}>{item.label}</div>
            </motion.button>
          ))}
        </motion.div>

        {/* Achievement Display */}
        <motion.div
          style={earlyStyle.achievementSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div style={earlyStyle.badgeRow}>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                style={earlyStyle.badge}
                whileHover={{ scale: 1.1 }}
              >
                {['🌟', '⭐', '✨'][i]}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // P3-P4: Balanced design with stats and progress
  if (gradeCategory === 'middle') {
    return (
      <div style={middleStyle.container}>
        {/* Header Stats */}
        <motion.div
          style={middleStyle.statsRow}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {[
            { icon: '⭐', label: 'Points', value: totalPoints },
            { icon: '🔥', label: 'Streak', value: streak },
            { icon: '📚', label: 'Topics', value: completedTopics },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              style={middleStyle.statBox}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div style={middleStyle.statIcon}>{stat.icon}</div>
              <div style={middleStyle.statValue}>{stat.value}</div>
              <div style={middleStyle.statLabel}>{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Play Grid */}
        <motion.div
          style={middleStyle.actionGrid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {[
            { title: 'Kahoot Battle', icon: '⚡', color: '#FF006E', action: onPlayKahoot },
            { title: 'Question Quiz', icon: '❓', color: '#0077B6', action: onPlayCBT },
            { title: 'Fun Games', icon: '🎮', color: '#06A77D', action: onPlayGames },
          ].map((item, idx) => (
            <motion.button
              key={item.title}
              onClick={() => {
                play('click');
                item.action();
              }}
              whileHover={{ scale: 1.05, translateY: -6 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              style={{
                ...middleStyle.actionCard,
                background: `linear-gradient(135deg, ${item.color}88, ${item.color}44)`,
                borderColor: item.color,
              }}
            >
              <div style={middleStyle.actionCardIcon}>{item.icon}</div>
              <div style={middleStyle.actionCardTitle}>{item.title}</div>
            </motion.button>
          ))}
        </motion.div>

        {/* Progress Card */}
        <motion.div
          style={middleStyle.progressCard}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div style={middleStyle.progressLabel}>Daily Progress</div>
          <div style={middleStyle.progressBar}>
            <motion.div
              style={middleStyle.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((completedTopics / 10) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          </div>
          <div style={middleStyle.progressText}>
            {completedTopics}/10 topics completed
          </div>
        </motion.div>
      </div>
    );
  }

  // P5-P6: Data-driven, professional design
  return (
    <div style={advancedStyle.container}>
      {/* Performance Dashboard */}
      <motion.div
        style={advancedStyle.dashboardGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {[
          { title: 'Total Points', value: totalPoints, icon: '⭐', color: '#FFB703' },
          { title: 'Current Streak', value: `${streak} days`, icon: '🔥', color: '#FF6B6B' },
          { title: 'Topics Mastered', value: completedTopics, icon: '📚', color: '#3A86FF' },
        ].map((metric, idx) => (
          <motion.div
            key={metric.title}
            style={{
              ...advancedStyle.metricCard,
              borderLeftColor: metric.color,
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div style={advancedStyle.metricIcon}>{metric.icon}</div>
            <div style={advancedStyle.metricTitle}>{metric.title}</div>
            <div style={advancedStyle.metricValue}>{metric.value}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Mode Selection */}
      <motion.div
        style={advancedStyle.modeGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          { name: 'Kahoot', desc: 'Fast-paced battles', icon: '⚡', action: onPlayKahoot },
          { name: 'Quiz Mode', desc: 'Detailed questions', icon: '❓', action: onPlayCBT },
          { name: 'Games', desc: 'Educational fun', icon: '🎮', action: onPlayGames },
        ].map((mode, idx) => (
          <motion.button
            key={mode.name}
            onClick={() => {
              play('click');
              mode.action();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={advancedStyle.modeCard}
          >
            <div style={advancedStyle.modeIcon}>{mode.icon}</div>
            <div style={advancedStyle.modeName}>{mode.name}</div>
            <div style={advancedStyle.modeDesc}>{mode.desc}</div>
          </motion.button>
        ))}
      </motion.div>

      {/* Recommendations */}
      <motion.div
        style={advancedStyle.recommendationCard}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div style={advancedStyle.recommendationTitle}>Recommended</div>
        <div style={advancedStyle.recommendationText}>
          Complete 5 more questions today to maintain your streak!
        </div>
      </motion.div>
    </div>
  );
}

// ───────────────────────────────────────────────────────
// STYLES FOR P1-P2 (EARLY)
const earlyStyle = {
  container: {
    flex: 1,
    overflow: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '24px 16px',
    gap: '32px',
    background: 'var(--bg-page)',
  },

  mascot: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
  },

  mascotEmoji: {
    fontSize: '4rem',
    lineHeight: 1,
  },

  mascotText: {
    fontSize: '1.3rem',
    fontWeight: 700,
    color: '#1a1a2e',
    fontFamily: 'var(--font-heading)',
  },

  scoreCard: {
    width: '140px',
    height: '140px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
  },

  scoreNumber: {
    fontSize: '3.5rem',
    fontWeight: 900,
    fontFamily: 'var(--font-mono)',
    lineHeight: 1,
  },

  scoreLabel: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginTop: '8px',
  },

  buttonGrid: {
    display: 'grid' as const,
    gridTemplateColumns: '1fr',
    gap: '16px',
    width: '100%',
    maxWidth: '300px',
  },

  actionButton: {
    padding: '32px 20px',
    borderRadius: '20px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
    fontSize: '1.3rem',
    fontWeight: 900,
    color: 'white',
    minHeight: '140px',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
    background: 'var(--gradient-primary)',
    fontFamily: 'var(--font-heading)',
  },

  actionEmoji: {
    fontSize: '3.5rem',
    lineHeight: 1,
  },

  actionLabel: {
    fontSize: '1.3rem',
    fontWeight: 900,
  },

  achievementSection: {
    width: '100%',
    textAlign: 'center' as const,
  },

  badgeRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },

  badge: {
    fontSize: '2.5rem',
    cursor: 'pointer',
  },
};

// ───────────────────────────────────────────────────────
// STYLES FOR P3-P4 (MIDDLE)
const middleStyle = {
  container: {
    flex: 1,
    overflow: 'auto' as const,
    padding: '16px',
    background: 'var(--bg-page)',
  },

  statsRow: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },

  statBox: {
    background: 'var(--bg-white)',
    borderRadius: '16px',
    padding: '16px 12px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },

  statIcon: {
    fontSize: '1.8rem',
    marginBottom: '8px',
  },

  statValue: {
    fontSize: '1.6rem',
    fontWeight: 900,
    color: 'var(--primary)',
    fontFamily: 'var(--font-mono)',
  },

  statLabel: {
    fontSize: '0.75rem',
    color: '#6b7a8d',
    fontWeight: 700,
    marginTop: '4px',
    textTransform: 'uppercase' as const,
  },

  actionGrid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },

  actionCard: {
    padding: '20px 14px',
    borderRadius: '16px',
    border: '2px solid',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    minHeight: '120px',
    color: 'white',
    fontWeight: 900,
    transition: 'all 0.3s',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
  },

  actionCardIcon: {
    fontSize: '2.5rem',
    lineHeight: 1,
  },

  actionCardTitle: {
    fontSize: '0.95rem',
    textAlign: 'center' as const,
  },

  progressCard: {
    background: 'var(--bg-white)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },

  progressLabel: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: '#1a1a2e',
    marginBottom: '12px',
  },

  progressBar: {
    width: '100%',
    height: '12px',
    borderRadius: '6px',
    background: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: '12px',
  },

  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
    borderRadius: '6px',
  },

  progressText: {
    fontSize: '0.8rem',
    color: '#6b7a8d',
    fontWeight: 600,
  },
};

// ───────────────────────────────────────────────────────
// STYLES FOR P5-P6 (ADVANCED)
const advancedStyle = {
  container: {
    flex: 1,
    overflow: 'auto' as const,
    padding: '16px',
    background: 'var(--bg-page)',
  },

  dashboardGrid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },

  metricCard: {
    background: 'var(--bg-white)',
    borderRadius: '12px',
    padding: '16px',
    borderLeft: '4px solid',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },

  metricIcon: {
    fontSize: '1.6rem',
    marginBottom: '8px',
  },

  metricTitle: {
    fontSize: '0.75rem',
    color: '#6b7a8d',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  },

  metricValue: {
    fontSize: '1.4rem',
    fontWeight: 900,
    color: '#1a1a2e',
    fontFamily: 'var(--font-mono)',
  },

  modeGrid: {
    display: 'grid' as const,
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px',
  },

  modeCard: {
    background: 'var(--bg-white)',
    borderRadius: '12px',
    padding: '16px',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },

  modeIcon: {
    fontSize: '1.8rem',
  },

  modeName: {
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#1a1a2e',
  },

  modeDesc: {
    fontSize: '0.75rem',
    color: '#6b7a8d',
    fontWeight: 600,
  },

  recommendationCard: {
    background: 'linear-gradient(135deg, var(--primary)22, var(--secondary)22)',
    borderRadius: '12px',
    padding: '16px',
    border: `1px solid var(--primary)44`,
  },

  recommendationTitle: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: 'var(--primary)',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
  },

  recommendationText: {
    fontSize: '0.9rem',
    color: '#1a1a2e',
    fontWeight: 600,
    lineHeight: 1.4,
  },
};
