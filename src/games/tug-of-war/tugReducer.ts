// ─── tugReducer.ts ────────────────────────────────────────────────────────────
import type { GameState, GameAction, TeamId, TugQuestion } from './tugTypes';

export const WIN_THRESHOLD = 80; // rope must cross ±80 to win round

export const DEFAULT_SETTINGS = {
  timePerQuestion: 20,
  totalRounds: 3,
  classLevel: 'P3' as const,
  team1Name: 'Blue Team',
  team2Name: 'Red Team',
  questionsPerRound: 10,
};

const makeTeam = () => ({
  score: 0, currentInput: '', lastAnswerCorrect: null as null | boolean,
  pulling: false, streak: 0,
});

export function makeInitialState(): GameState {
  return {
    phase: 'settings',
    settings: { ...DEFAULT_SETTINGS },
    teams: { team1: makeTeam(), team2: makeTeam() },
    round: {
      round: 1, ropePosition: 0, question: null, questionIndex: 0,
      timeLeft: DEFAULT_SETTINGS.timePerQuestion, activeTeam: 'team1', turnCount: 0,
    },
    winner: null, roundWinner: null, countdownValue: 3,
    questionPool: [], toastMsg: '', toastVisible: false,
  };
}

function nextQuestion(pool: TugQuestion[], idx: number): TugQuestion {
  return pool[idx % pool.length];
}

function checkWinner(state: GameState): TeamId | null {
  const need = Math.ceil(state.settings.totalRounds / 2);
  if (state.teams.team1.score >= need) return 'team1';
  if (state.teams.team2.score >= need) return 'team2';
  if (state.teams.team1.score + state.teams.team2.score >= state.settings.totalRounds)
    return state.teams.team1.score > state.teams.team2.score ? 'team1' : 'team2';
  return null;
}

export function tugReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case 'START_SUBJECT_SELECT':
      return { ...state, phase: 'subject-select' };

    case 'RESET_TO_SETTINGS':
      return { ...state, phase: 'settings' };

    case 'START_GAME_WITH_SUBJECT': {
      const { subject, pool } = action;
      return {
        ...makeInitialState(),
        settings: { ...state.settings, subject },
        phase: 'countdown',
        countdownValue: 3,
        questionPool: pool,
        round: {
          round: 1, ropePosition: 0, questionIndex: 0,
          question: pool[0] || null,
          timeLeft: state.settings.timePerQuestion,
          activeTeam: 'team1', turnCount: 0,
        },
      };
    }

    case 'START_GAME': {
      const pool = action.pool;
      return {
        ...makeInitialState(),
        settings: state.settings,
        phase: 'countdown',
        countdownValue: 3,
        questionPool: pool,
        round: {
          round: 1, ropePosition: 0, questionIndex: 0,
          question: pool[0] || null,
          timeLeft: state.settings.timePerQuestion,
          activeTeam: 'team1', turnCount: 0,
        },
      };
    }

    case 'COUNTDOWN_TICK': {
      const next = state.countdownValue - 1;
      if (next <= 0) return { ...state, phase: 'playing', countdownValue: 0 };
      return { ...state, countdownValue: next };
    }

    case 'KEYPAD_INPUT': {
      const { team, digit } = action;
      if (state.phase !== 'playing' || state.round.activeTeam !== team) return state;
      const cur = state.teams[team].currentInput;
      if (cur.length >= 6) return state;
      return { ...state, teams: { ...state.teams, [team]: { ...state.teams[team], currentInput: cur + digit } } };
    }

    case 'CLEAR_INPUT': {
      const { team } = action;
      if (state.round.activeTeam !== team) return state;
      return { ...state, teams: { ...state.teams, [team]: { ...state.teams[team], currentInput: '' } } };
    }

    case 'SUBMIT_ANSWER': {
      const { team } = action;
      if (state.phase !== 'playing' || state.round.activeTeam !== team) return state;
      const input = state.teams[team].currentInput.trim().toLowerCase();
      if (!input || !state.round.question) return state;

      const correctAnswer = state.round.question.answer.toString().toLowerCase().trim();
      const correct = input === correctAnswer;
      const newStreak = correct ? state.teams[team].streak + 1 : 0;

      // Rope pull: each correct answer pulls 20 units + streak bonus
      const pull = correct ? 20 + Math.min(newStreak - 1, 3) * 5 : 0;
      const dir = team === 'team1' ? -1 : 1;
      const newRopePos = Math.max(-100, Math.min(100, state.round.ropePosition + pull * dir));

      const nextTeam: TeamId = team === 'team1' ? 'team2' : 'team1';
      const nextIdx = state.round.questionIndex + 1;

      // Check round win
      let roundWinner: TeamId | null = null;
      if (newRopePos <= -WIN_THRESHOLD) roundWinner = 'team1';
      if (newRopePos >= WIN_THRESHOLD) roundWinner = 'team2';

      const toastMsg = correct
        ? newStreak >= 3 ? `🔥 ${newStreak} in a row!` : '✅ Correct! Keep pulling!'
        : '❌ Wrong! Try again!';

      const updatedTeams = {
        ...state.teams,
        [team]: {
          ...state.teams[team],
          currentInput: '',
          lastAnswerCorrect: correct,
          pulling: correct,
          streak: newStreak,
        },
      };

      if (roundWinner) {
        const withScore = {
          ...updatedTeams,
          [roundWinner]: { ...updatedTeams[roundWinner], score: updatedTeams[roundWinner].score + 1 },
        };
        const nextState: GameState = {
          ...state,
          teams: withScore,
          round: { ...state.round, ropePosition: newRopePos, questionIndex: nextIdx },
          roundWinner,
          phase: 'round-result',
          toastMsg: `🏆 ${roundWinner === 'team1' ? state.settings.team1Name : state.settings.team2Name} wins the round!`,
          toastVisible: true,
        };
        const matchWinner = checkWinner(nextState);
        if (matchWinner) return { ...nextState, winner: matchWinner, phase: 'match-over' };
        return nextState;
      }

      return {
        ...state,
        teams: updatedTeams,
        round: {
          ...state.round,
          ropePosition: newRopePos,
          activeTeam: nextTeam,
          turnCount: state.round.turnCount + 1,
          timeLeft: state.settings.timePerQuestion,
          questionIndex: nextIdx,
          question: nextQuestion(state.questionPool, nextIdx),
        },
        toastMsg,
        toastVisible: true,
      };
    }

    case 'TICK_TIMER': {
      if (state.phase !== 'playing') return state;
      const newTime = state.round.timeLeft - 1;
      if (newTime <= 0) {
        const nextTeam: TeamId = state.round.activeTeam === 'team1' ? 'team2' : 'team1';
        const nextIdx = state.round.questionIndex + 1;
        return {
          ...state,
          round: {
            ...state.round,
            timeLeft: state.settings.timePerQuestion,
            activeTeam: nextTeam,
            questionIndex: nextIdx,
            question: nextQuestion(state.questionPool, nextIdx),
          },
          teams: {
            ...state.teams,
            [state.round.activeTeam]: {
              ...state.teams[state.round.activeTeam],
              currentInput: '',
              lastAnswerCorrect: false,
              streak: 0,
            },
          },
          toastMsg: '⏰ Time\'s up!',
          toastVisible: true,
        };
      }
      return { ...state, round: { ...state.round, timeLeft: newTime } };
    }

    case 'ACKNOWLEDGE_ROUND_RESULT': {
      const nextIdx = state.round.questionIndex;
      return {
        ...state,
        phase: 'playing',
        roundWinner: null,
        round: {
          round: state.round.round + 1,
          ropePosition: 0,
          questionIndex: nextIdx,
          question: nextQuestion(state.questionPool, nextIdx),
          timeLeft: state.settings.timePerQuestion,
          activeTeam: 'team1',
          turnCount: 0,
        },
        teams: {
          team1: { ...state.teams.team1, currentInput: '', lastAnswerCorrect: null, pulling: false, streak: 0 },
          team2: { ...state.teams.team2, currentInput: '', lastAnswerCorrect: null, pulling: false, streak: 0 },
        },
        toastVisible: false,
      };
    }

    case 'HIDE_TOAST':
      return { ...state, toastVisible: false };

    case 'RESET_GAME':
      return { ...makeInitialState(), settings: state.settings };

    default:
      return state;
  }
}
