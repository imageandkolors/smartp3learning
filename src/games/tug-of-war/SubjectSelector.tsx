// ─── SubjectSelector.tsx ──────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const SUBJECTS: Subject[] = [
  {
    id: 'Maths',
    name: 'Mathematics',
    icon: '🔢',
    color: '#4FC3F7',
    description: 'Addition, Subtraction, Multiplication, Division',
  },
  {
    id: 'English',
    name: 'English Language',
    icon: '📚',
    color: '#81C784',
    description: 'Spelling, Grammar, Vocabulary',
  },
  {
    id: 'Quantitative',
    name: 'Quantitative Reasoning',
    icon: '📊',
    color: '#FFB74D',
    description: 'Patterns, Logic, Problem Solving',
  },
  {
    id: 'General',
    name: 'General Knowledge',
    icon: '🌍',
    color: '#E57373',
    description: 'Facts, History, Culture, Science',
  },
];

interface Props {
  onSelect: (subject: string) => void;
  onBack?: () => void;
  selectedSubject?: string;
}

export function SubjectSelector({ onSelect, onBack, selectedSubject }: Props) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(180deg, rgba(10,22,40,0.95), rgba(13,35,75,0.95))',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(20px, 4vh, 40px)',
      zIndex: 100,
      gap: 'clamp(20px, 3vh, 40px)',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
        }}
      >
        <div style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontWeight: 900,
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          color: 'white',
          marginBottom: 'clamp(8px, 1.5vh, 16px)',
        }}>
          Choose a Subject
        </div>
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 'clamp(0.85rem, 2vw, 1rem)',
          color: 'rgba(255,255,255,0.6)',
        }}>
          Select which subject you want to compete in
        </div>
      </motion.div>

      {/* Subject Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 22vw, 200px), 1fr))',
        gap: 'clamp(12px, 2vw, 20px)',
        maxWidth: '900px',
        width: '100%',
      }}>
        {SUBJECTS.map((subject, idx) => (
          <motion.button
            key={subject.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(subject.id)}
            style={{
              background: selectedSubject === subject.id
                ? `linear-gradient(135deg, ${subject.color}, ${subject.color}dd)`
                : `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`,
              border: selectedSubject === subject.id
                ? `2px solid ${subject.color}`
                : '2px solid rgba(255,255,255,0.15)',
              borderRadius: 'clamp(12px, 2vw, 20px)',
              padding: 'clamp(16px, 2vw, 24px)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'clamp(8px, 1.5vh, 12px)',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{
              fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
              lineHeight: 1,
            }}>
              {subject.icon}
            </div>
            <div style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(0.85rem, 1.8vw, 1.1rem)',
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
            }}>
              {subject.name}
            </div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 'clamp(0.7rem, 1.3vw, 0.85rem)',
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              lineHeight: 1.3,
            }}>
              {subject.description}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Back Button */}
      {onBack && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1.5px solid rgba(255,255,255,0.15)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(8px, 1.2vh, 12px) clamp(20px, 3vw, 28px)',
            color: 'rgba(255,255,255,0.75)',
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(0.8rem, 1.6vw, 0.95rem)',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            marginTop: 'clamp(10px, 2vh, 20px)',
          }}
        >
          ← Back
        </motion.button>
      )}
    </div>
  );
}
