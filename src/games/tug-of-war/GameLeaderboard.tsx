// ─── GameLeaderboard.tsx ──────────────────────────────────────────────────────
import React from 'react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  name: string;
  roundsWon: number;
  totalRounds: number;
  color: string;
  isWinner: boolean;
}

interface Props {
  entries: LeaderboardEntry[];
  onClose: () => void;
}

export function GameLeaderboard({ entries, onClose }: Props) {
  const winnerEntry = entries.find(e => e.isWinner);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 32px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          background: 'linear-gradient(160deg, #0d1b4b, #1a3a8f)',
          border: '3px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 'clamp(16px, 3vw, 28px)',
          padding: 'clamp(24px, 5vw, 40px)',
          maxWidth: 'min(90vw, 500px)',
          width: '100%',
          boxShadow: '0 0 80px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(20px, 3vh, 32px)' }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              marginBottom: 'clamp(8px, 1.5vh, 16px)',
            }}
          >
            🏆
          </motion.div>
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              color: 'white',
              marginBottom: 'clamp(4px, 1vh, 8px)',
            }}
          >
            Final Leaderboard
          </div>
          {winnerEntry && (
            <div
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Champion: <span style={{ color: winnerEntry.color, fontWeight: 700 }}>{winnerEntry.name}</span>
            </div>
          )}
        </div>

        {/* Leaderboard Entries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 2vh, 16px)' }}>
          {entries.map((entry, idx) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: entry.isWinner
                  ? `linear-gradient(135deg, ${entry.color}22, ${entry.color}11)`
                  : 'rgba(255, 255, 255, 0.05)',
                border: entry.isWinner ? `2px solid ${entry.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'clamp(8px, 1.5vw, 14px)',
                padding: 'clamp(12px, 2vw, 18px) clamp(14px, 2.5vw, 20px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'clamp(12px, 2vw, 20px)',
              }}
            >
              {/* Rank Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 'clamp(40px, 8vw, 56px)',
                  height: 'clamp(40px, 8vw, 56px)',
                  background: entry.isWinner ? entry.color : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
                    color: entry.isWinner ? '#0d1b4b' : 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                </span>
              </div>

              {/* Team Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(0.95rem, 2.2vw, 1.3rem)',
                    color: entry.color,
                    marginBottom: 'clamp(2px, 0.5vh, 6px)',
                  }}
                >
                  {entry.name}
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  }}
                >
                  {entry.roundsWon} of {entry.totalRounds} rounds won
                </div>
              </div>

              {/* Win Rate */}
              <div
                style={{
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 900,
                    fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
                    color: entry.color,
                  }}
                >
                  {Math.round((entry.roundsWon / entry.totalRounds) * 100)}%
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontSize: 'clamp(0.65rem, 1.3vw, 0.8rem)',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginTop: 'clamp(2px, 0.5vh, 4px)',
                  }}
                >
                  Win Rate
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: '100%',
            marginTop: 'clamp(20px, 3vh, 28px)',
            padding: 'clamp(10px, 2vh, 14px)',
            background: 'linear-gradient(135deg, #008751, #005c38)',
            border: 'none',
            borderRadius: 'clamp(8px, 1.5vw, 14px)',
            color: 'white',
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0, 135, 81, 0.4)',
          }}
        >
          🏠 Return to Home
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
