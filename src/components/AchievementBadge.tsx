import React from 'react';
import { motion } from 'framer-motion';

export type AchievementType = 'streak' | 'mastery' | 'speed' | 'difficulty' | 'social' | 'milestone';

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  level?: number; // For multi-tier badges
  progress?: number; // 0-100 for unlocking
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
  showToast?: boolean;
  onUnlock?: (id: string) => void;
}

const BADGE_CONFIG: Record<AchievementType, { title: string; baseColor: string }> = {
  streak: { title: 'Streak Master', baseColor: '#FF6B6B' },
  mastery: { title: 'Subject Master', baseColor: '#10B981' },
  speed: { title: 'Speed Demon', baseColor: '#F59E0B' },
  difficulty: { title: 'Challenge Champion', baseColor: '#8B5CF6' },
  social: { title: 'Community Star', baseColor: '#06B6D4' },
  milestone: { title: 'Milestone Reached', baseColor: '#FFB703' },
};

export function AchievementBadge({
  achievement,
  size = 'medium',
  showToast = true,
  onUnlock,
}: AchievementBadgeProps) {
  const config = BADGE_CONFIG[achievement.type];
  const isNew = achievement.unlocked && achievement.unlockedAt && 
    (Date.now() - achievement.unlockedAt.getTime()) < 5000;

  const sizeMap = {
    small: { container: 80, icon: 32, font: 0.7 },
    medium: { container: 120, icon: 48, font: 0.9 },
    large: { container: 160, icon: 64, font: 1.1 },
  };

  const dims = sizeMap[size];

  return (
    <>
      <motion.div
        initial={achievement.unlocked ? { scale: 0, rotate: -180 } : { opacity: 0.5 }}
        animate={achievement.unlocked ? { scale: 1, rotate: 0 } : { opacity: 0.5 }}
        whileHover={achievement.unlocked ? { scale: 1.1, rotate: 5 } : {}}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
        }}
        style={{
          width: dims.container,
          height: dims.container,
          position: 'relative',
        }}
      >
        {/* Badge Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: achievement.unlocked
              ? `linear-gradient(135deg, ${achievement.color}, ${achievement.color}dd)`
              : 'linear-gradient(135deg, #E0E0E0, #C0C0C0)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: achievement.unlocked
              ? `0 8px 24px ${achievement.color}44, inset 0 -2px 6px rgba(0,0,0,0.2)`
              : '0 4px 12px rgba(0,0,0,0.1), inset 0 -2px 6px rgba(0,0,0,0.05)',
            color: 'white',
          }}
        >
          {/* Shine effect on unlock */}
          {achievement.unlocked && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                pointerEvents: 'none',
              }}
              animate={{ x: ['150%', '-150%'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}

          {/* Icon */}
          <div style={{ fontSize: `${dims.icon}px`, lineHeight: 1, zIndex: 1 }}>
            {achievement.icon}
          </div>

          {/* Level or Progress */}
          {achievement.level ? (
            <div
              style={{
                fontSize: `${dims.font * 1.2}rem`,
                fontWeight: 900,
                fontFamily: 'var(--font-mono)',
                zIndex: 1,
              }}
            >
              Lv{achievement.level}
            </div>
          ) : achievement.progress ? (
            <div
              style={{
                fontSize: `${dims.font * 0.8}rem`,
                fontWeight: 700,
                zIndex: 1,
              }}
            >
              {achievement.progress}%
            </div>
          ) : null}
        </div>

        {/* Locked Lock Icon */}
        {!achievement.unlocked && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: '-8px',
              right: '-8px',
              width: '40px',
              height: '40px',
              background: '#EF4444',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              zIndex: 2,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            🔒
          </motion.div>
        )}

        {/* Unlock Star */}
        {isNew && (
          <motion.div
            style={{
              position: 'absolute',
              top: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '28px',
              zIndex: 10,
            }}
            animate={{ y: [-30, 0], opacity: [0, 1] }}
            transition={{ duration: 0.6 }}
          >
            ⭐
          </motion.div>
        )}
      </motion.div>

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileHover={{ opacity: 1, y: -60 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          backdropFilter: 'blur(10px)',
          marginBottom: '8px',
          zIndex: 100,
          textAlign: 'center',
          minWidth: '120px',
        }}
      >
        <div>{achievement.name}</div>
        <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
          {achievement.description}
        </div>
      </motion.div>

      {/* Toast Notification on Unlock */}
      {isNew && showToast && (
        <UnlockToast achievement={achievement} onClose={() => onUnlock?.(achievement.id)} />
      )}
    </>
  );
}

interface UnlockToastProps {
  achievement: Achievement;
  onClose: () => void;
}

function UnlockToast({ achievement, onClose }: UnlockToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50, y: 50 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onAnimationComplete={() => setTimeout(onClose, 3000)}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '16px',
        background: `linear-gradient(135deg, ${achievement.color}, ${achievement.color}dd)`,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: `0 12px 32px ${achievement.color}44`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        maxWidth: 'calc(100% - 32px)',
      }}
    >
      <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{achievement.icon}</div>
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>Achievement Unlocked!</div>
        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{achievement.name}</div>
      </div>
      <motion.button
        onClick={onClose}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          marginLeft: 'auto',
          flexShrink: 0,
        }}
      >
        ✕
      </motion.button>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────
// Achievement Definitions for Smart Learning App
// ───────────────────────────────────────────────────────

export const ACHIEVEMENT_DEFINITIONS: Record<string, Partial<Achievement>> = {
  // STREAK BADGES
  streak_3: {
    id: 'streak_3',
    type: 'streak',
    name: '3-Day Streak',
    description: 'Complete questions 3 days in a row',
    icon: '🔥',
    color: '#FF6B6B',
  },
  streak_7: {
    id: 'streak_7',
    type: 'streak',
    name: '🔥 One Week Warrior',
    description: 'Keep it up for 7 days!',
    icon: '🔥',
    color: '#FF6B6B',
  },
  streak_30: {
    id: 'streak_30',
    type: 'streak',
    name: '📅 Month Master',
    description: 'Maintain a 30-day streak',
    icon: '📅',
    color: '#FF6B6B',
  },

  // MASTERY BADGES
  mastery_math: {
    id: 'mastery_math',
    type: 'mastery',
    name: '🧮 Math Master',
    description: 'Score 100% on all Math questions',
    icon: '🧮',
    color: '#10B981',
  },
  mastery_english: {
    id: 'mastery_english',
    type: 'mastery',
    name: '📖 English Expert',
    description: 'Complete all English topics',
    icon: '📖',
    color: '#10B981',
  },
  mastery_science: {
    id: 'mastery_science',
    type: 'mastery',
    name: '🔬 Science Scholar',
    description: 'Master all Science questions',
    icon: '🔬',
    color: '#10B981',
  },

  // SPEED BADGES
  speed_fast: {
    id: 'speed_fast',
    type: 'speed',
    name: '⚡ Speed Runner',
    description: 'Answer 10 questions in under 30 seconds',
    icon: '⚡',
    color: '#F59E0B',
  },
  speed_lightning: {
    id: 'speed_lightning',
    type: 'speed',
    name: '💨 Lightning Quick',
    description: 'Average answer time under 5 seconds',
    icon: '💨',
    color: '#F59E0B',
  },

  // DIFFICULTY BADGES
  difficulty_hard: {
    id: 'difficulty_hard',
    type: 'difficulty',
    name: '💪 Challenge Master',
    description: 'Complete 25 difficult questions',
    icon: '💪',
    color: '#8B5CF6',
  },
  difficulty_extreme: {
    id: 'difficulty_extreme',
    type: 'difficulty',
    name: '🏔️ Peak Climber',
    description: 'Complete 10 extreme difficulty questions',
    icon: '🏔️',
    color: '#8B5CF6',
  },

  // SOCIAL BADGES
  social_friend: {
    id: 'social_friend',
    type: 'social',
    name: '👥 Friend Finder',
    description: 'Compete with 5 friends',
    icon: '👥',
    color: '#06B6D4',
  },
  social_teacher: {
    id: 'social_teacher',
    type: 'social',
    name: '🏫 Class Champion',
    description: 'Top score in your class',
    icon: '🏫',
    color: '#06B6D4',
  },

  // MILESTONE BADGES
  milestone_100: {
    id: 'milestone_100',
    type: 'milestone',
    name: '🎯 Century Club',
    description: 'Score 100 points total',
    icon: '🎯',
    color: '#FFB703',
  },
  milestone_1000: {
    id: 'milestone_1000',
    type: 'milestone',
    name: '🌟 Superstar',
    description: 'Earn 1000 total points',
    icon: '🌟',
    color: '#FFB703',
  },
  milestone_5000: {
    id: 'milestone_5000',
    type: 'milestone',
    name: '👑 Legend',
    description: 'Reach 5000 points - You are a legend!',
    icon: '👑',
    color: '#FFB703',
  },
};

/**
 * Create achievement instance
 */
export function createAchievement(
  definitionId: string,
  unlocked: boolean = false,
): Achievement {
  const def = ACHIEVEMENT_DEFINITIONS[definitionId];
  if (!def) throw new Error(`Achievement ${definitionId} not found`);

  return {
    id: definitionId,
    type: def.type || 'milestone',
    name: def.name || 'Unknown',
    description: def.description || '',
    icon: def.icon || '🏆',
    color: def.color || '#FFB703',
    unlocked,
    unlockedAt: unlocked ? new Date() : undefined,
  };
}

/**
 * Check if achievement should be unlocked
 */
export function checkAchievementUnlock(
  achievementId: string,
  currentStats: {
    totalPoints: number;
    streak: number;
    completedTopics: number;
    averageSpeed: number;
  },
): boolean {
  const checks: Record<string, boolean> = {
    // Milestone checks
    milestone_100: currentStats.totalPoints >= 100,
    milestone_1000: currentStats.totalPoints >= 1000,
    milestone_5000: currentStats.totalPoints >= 5000,

    // Streak checks (would need date tracking)
    streak_3: currentStats.streak >= 3,
    streak_7: currentStats.streak >= 7,
    streak_30: currentStats.streak >= 30,

    // Speed checks
    speed_fast: currentStats.averageSpeed < 3,
    speed_lightning: currentStats.averageSpeed < 2,
  };

  return checks[achievementId] || false;
}
