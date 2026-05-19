import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import type { Grade } from '../store/useAppStore';

const GRADES: { grade: Grade; label: string; emoji: string; color: string; desc: string }[] = [
  { grade: 'P1', label: 'Primary 1', emoji: '👶', color: '#00D4FF', desc: 'Age 6-7 years' },
  { grade: 'P2', label: 'Primary 2', emoji: '🧒', color: '#FF006E', desc: 'Age 7-8 years' },
  { grade: 'P3', label: 'Primary 3', emoji: '👦', color: '#0077B6', desc: 'Age 8-9 years' },
  { grade: 'P4', label: 'Primary 4', emoji: '👧', color: '#06A77D', desc: 'Age 9-10 years' },
  { grade: 'P5', label: 'Primary 5', emoji: '🧑', color: '#7209B7', desc: 'Age 10-11 years' },
  { grade: 'P6', label: 'Primary 6', emoji: '👨', color: '#FFB703', desc: 'Age 11-12 years' },
];

export function GradeSelector() {
  const { selectedGrade, setGrade, setScreen } = useAppStore();

  const handleGradeSelect = (grade: Grade) => {
    setGrade(grade);
    // Apply theme class to document
    document.documentElement.classList.remove(
      'grade-p1',
      'grade-p2',
      'grade-p3',
      'grade-p4',
      'grade-p5',
      'grade-p6'
    );
    document.documentElement.classList.add(`grade-${grade.toLowerCase()}`);
    setTimeout(() => setScreen('home'), 300);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={styles.header}
      >
        <div style={styles.headerEmoji}>🎓</div>
        <h1 style={styles.title}>Smart Learning</h1>
        <p style={styles.subtitle}>Select your grade level to get started</p>
      </motion.div>

      {/* Grade Cards Grid */}
      <motion.div 
        style={styles.grid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {GRADES.map((item, idx) => (
          <motion.button
            key={item.grade}
            style={{
              ...styles.card,
              backgroundColor: item.color,
              borderColor: item.color,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, translateY: -8 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleGradeSelect(item.grade)}
            className={`grade-card ${selectedGrade === item.grade ? 'selected' : ''}`}
          >
            <div style={styles.cardEmoji}>{item.emoji}</div>
            <div style={styles.cardLabel}>{item.label}</div>
            <div style={styles.cardDesc}>{item.desc}</div>
            {selectedGrade === item.grade && (
              <motion.div
                style={styles.checkmark}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* CTA */}
      {selectedGrade && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => handleGradeSelect(selectedGrade)}
          style={styles.ctaButton}
        >
          <span style={styles.ctaText}>Let's Learn! 🚀</span>
        </motion.button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(135deg, #F0F9FF 0%, #E8F4F8 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflow: 'auto',
    zIndex: 1000,
  },

  header: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },

  headerEmoji: {
    fontSize: '3rem',
    marginBottom: '12px',
  },

  title: {
    fontFamily: "var(--font-heading)",
    fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
    fontWeight: 900,
    color: '#1a1a2e',
    margin: 0,
  },

  subtitle: {
    fontSize: '1rem',
    color: '#6b7a8d',
    marginTop: '8px',
    fontWeight: 600,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    width: '100%',
    maxWidth: '420px',
    marginBottom: '24px',
  },

  card: {
    position: 'relative' as const,
    padding: '18px 12px',
    border: '3px solid',
    borderRadius: '16px',
    background: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
    gap: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    color: '#1a1a2e',
  },

  cardEmoji: {
    fontSize: '2.5rem',
    lineHeight: 1,
  },

  cardLabel: {
    fontSize: '0.9rem',
    fontWeight: 800,
    fontFamily: "var(--font-heading)",
  },

  cardDesc: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'rgba(26, 26, 46, 0.6)',
  },

  checkmark: {
    position: 'absolute' as const,
    top: '6px',
    right: '8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: '#10B981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },

  ctaButton: {
    padding: '16px 48px',
    borderRadius: '20px',
    border: 'none',
    background: 'linear-gradient(135deg, #00D4FF 0%, #0077B6 100%)',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(0, 212, 255, 0.4)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: '48px',
    fontFamily: "var(--font-heading)",
  },

  ctaText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};
