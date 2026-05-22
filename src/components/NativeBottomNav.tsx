import React from 'react';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'subjects', icon: '📚', label: 'Subjects' },
  { id: 'games', icon: '🎮', label: 'Games' },
  { id: 'kahoot', icon: '⚡', label: 'Kahoot' },
  { id: 'awards', icon: '🏆', label: 'Awards' },
];

interface Props {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function NativeBottomNav({ activeTab, onTabChange }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'max(68px, calc(68px + env(safe-area-inset-bottom)))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        zIndex: 1000,
        backdropFilter: 'blur(12px)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px 0',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              height: '68px',
              transition: 'all 0.2s',
              color: isActive ? 'var(--text)' : 'rgba(107, 122, 141, 0.6)',
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: isActive ? 900 : 600,
              fontSize: '10px',
              textTransform: 'capitalize',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                lineHeight: 1,
                transition: 'transform 0.2s',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {item.icon}
            </div>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 600 }}>
              {item.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '40px',
                  height: '3px',
                  background: 'var(--text)',
                  borderRadius: '3px',
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
