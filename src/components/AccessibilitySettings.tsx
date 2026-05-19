import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

export function AccessibilitySettings() {
  const { fontSize, setFontSize, soundEnabled, setSoundEnabled, colorBlindMode, setColorBlindMode } = useAppStore();

  const fontSizes = [1, 1.1, 1.2, 1.3, 1.5] as const;
  const fontLabels = ['Small', 'Normal', 'Medium', 'Large', 'Extra Large'];
  const colorBlindModes = ['Normal', 'Deuteranopia', 'Protanopia', 'Tritanopia'];

  const handleFontSize = (size: typeof fontSize) => {
    setFontSize(size);
    document.documentElement.classList.remove(
      'scale-1',
      'scale-1-1',
      'scale-1-2',
      'scale-1-3',
      'scale-1-5'
    );
    const scaleClass = `scale-${size.toString().replace('.', '-')}`;
    document.documentElement.classList.add(scaleClass);
  };

  const handleColorBlindMode = (mode: boolean) => {
    setColorBlindMode(mode);
    if (mode) {
      document.documentElement.classList.add('colorblind-deuteranopia');
    } else {
      document.documentElement.classList.remove(
        'colorblind-deuteranopia',
        'colorblind-protanopia',
        'colorblind-tritanopia'
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={styles.container}
    >
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🔊 Sound & Audio</span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            ...styles.toggleButton,
            backgroundColor: soundEnabled ? '#10B981' : '#EF4444',
          }}
        >
          <span style={styles.toggleIcon}>{soundEnabled ? '🔊' : '🔇'}</span>
          <span style={styles.toggleLabel}>
            {soundEnabled ? 'Sound ON' : 'Sound OFF'}
          </span>
        </button>
        <p style={styles.helpText}>
          Includes SFX, voice feedback, and achievement sounds
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📝 Text Size</span>
        </div>
        <div style={styles.fontGrid}>
          {fontSizes.map((size, idx) => (
            <motion.button
              key={size}
              onClick={() => handleFontSize(size)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                ...styles.fontButton,
                backgroundColor: fontSize === size ? '#0077B6' : '#F0F2F5',
                color: fontSize === size ? 'white' : '#1a1a2e',
                fontSize: `${0.75 + size * 0.15}rem`,
              }}
            >
              {fontLabels[idx]}
            </motion.button>
          ))}
        </div>
        <p style={styles.helpText}>
          Adjust text size for better readability
        </p>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>👁️ Color Vision</span>
        </div>
        <motion.button
          onClick={() => handleColorBlindMode(!colorBlindMode)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            ...styles.cbButton,
            backgroundColor: colorBlindMode ? '#7209B7' : '#F0F2F5',
            color: colorBlindMode ? 'white' : '#1a1a2e',
          }}
        >
          <span style={styles.cbIcon}>
            {colorBlindMode ? '👁️✓' : '👁️'}
          </span>
          <span>
            {colorBlindMode ? 'Color Blind Mode ON' : 'Color Blind Mode OFF'}
          </span>
        </motion.button>
        <p style={styles.helpText}>
          Optimized colors for color vision deficiency
        </p>
      </div>
    </motion.div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
    padding: '16px',
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },

  sectionTitle: {
    fontSize: '1.05rem',
    fontWeight: 800,
    color: '#1a1a2e',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  toggleButton: {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1rem',
    fontWeight: 900,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    minHeight: '48px',
    transition: 'all 0.3s',
    fontFamily: "var(--font-heading)",
  },

  toggleIcon: {
    fontSize: '1.4rem',
  },

  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
  },

  fontGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    marginBottom: '12px',
  },

  fontButton: {
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    transition: 'all 0.2s',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cbButton: {
    width: '100%',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 900,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    minHeight: '48px',
    transition: 'all 0.3s',
    fontFamily: "var(--font-heading)",
  },

  cbIcon: {
    fontSize: '1.3rem',
  },

  helpText: {
    fontSize: '0.85rem',
    color: '#6b7a8d',
    margin: 0,
    marginTop: '8px',
    fontWeight: 600,
    lineHeight: 1.4,
  },
};
