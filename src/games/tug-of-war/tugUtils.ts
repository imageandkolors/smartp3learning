// ─── tugUtils.ts ─────────────────────────────────────────────────────────────
import type { ClassLevel, TeamConfig } from './tugTypes';

export const TEAM_CONFIGS: TeamConfig[] = [
  {
    id: 'team1', name: 'Blue Team', color: '#1565C0', accent: '#E3F2FD',
    pullers: ['🧑‍🦱','👩‍🦰','🧒','👦'],
    side: 'left',
  },
  {
    id: 'team2', name: 'Red Team', color: '#C62828', accent: '#FFEBEE',
    pullers: ['👧','🧑‍🦳','👩','🧓'],
    side: 'right',
  },
];

export const CLASS_LABELS: Record<ClassLevel, string> = {
  P1: '🌱 Primary 1', P2: '🌿 Primary 2', P3: '⭐ Primary 3',
  P4: '🔥 Primary 4', P5: '💡 Primary 5', P6: '🏆 Primary 6',
};

export function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
