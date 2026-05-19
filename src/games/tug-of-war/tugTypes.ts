// ─── tugTypes.ts ──────────────────────────────────────────────────────────────

export type TeamId = 'team1' | 'team2';
export type GamePhase = 'settings' | 'countdown' | 'playing' | 'round-result' | 'match-over';
export type ClassLevel = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6';

export interface TugQuestion {
  id: number;
  subject: string;
  topic: string;
  question: string;
  answer: string;
  level: ClassLevel;
}

export interface TeamConfig {
  id: TeamId;
  name: string;
  color: string;
  accent: string;
  pullers: string[];
  side: 'left' | 'right';
}

export interface TeamState {
  score: number;
  currentInput: string;
  lastAnswerCorrect: boolean | null;
  pulling: boolean;
  streak: number;
}

export interface RoundState {
  round: number;
  ropePosition: number;
  question: TugQuestion | null;
  questionIndex: number;
  timeLeft: number;
  activeTeam: TeamId;
  turnCount: number;
}

export interface GameSettings {
  timePerQuestion: number;
  totalRounds: number;
  classLevel: ClassLevel;
  team1Name: string;
  team2Name: string;
  team1Avatar?: string;
  team2Avatar?: string;
  subject?: string;
  questionsPerRound?: number;
}

export interface GameState {
  phase: GamePhase;
  settings: GameSettings;
  teams: Record<TeamId, TeamState>;
  round: RoundState;
  winner: TeamId | null;
  roundWinner: TeamId | null;
  countdownValue: number;
  questionPool: TugQuestion[];
  toastMsg: string;
  toastVisible: boolean;
}

export type GameAction =
  | { type: 'START_GAME'; pool: TugQuestion[] }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'KEYPAD_INPUT'; team: TeamId; digit: string }
  | { type: 'CLEAR_INPUT'; team: TeamId }
  | { type: 'SUBMIT_ANSWER'; team: TeamId }
  | { type: 'TICK_TIMER' }
  | { type: 'ACKNOWLEDGE_ROUND_RESULT' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'HIDE_TOAST' }
  | { type: 'RESET_GAME' };
