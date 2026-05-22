// ─── TugOfWarGame.tsx ─────────────────────────────────────────────────────────
import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tugReducer, makeInitialState } from './tugReducer';
import { TEAM_CONFIGS, shuffle } from './tugUtils';
import { getQuestionsForLevel } from './tugQuestions';
import { SettingsPanel } from './SettingsPanel';
import { SubjectSelector } from './SubjectSelector';
import { TugRope } from './TugRope';
import { TeamSide } from './TeamSide';
import { RoundResultOverlay, MatchOverOverlay, Toast } from './WinScreen';
import { GameLeaderboard } from './GameLeaderboard';
import { useSFX } from '../../hooks/useSFX';
import { useTheme } from '../../context/ThemeContext';
import type { TeamId } from './tugTypes';

interface Props {
  onGameComplete?: (r: { winner: string; scores: Record<string,number> }) => void;
  onExit?: () => void;
}

export function TugOfWarGame({ onGameComplete, onExit }: Props) {
  const [state, dispatch] = useReducer(tugReducer, makeInitialState());
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);
  const timerRef    = useRef<ReturnType<typeof setInterval>|null>(null);
  const countRef    = useRef<ReturnType<typeof setInterval>|null>(null);
  const toastTimer  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const { play, speak } = useSFX();
  const { theme, toggleTheme } = useTheme();

  const t1 = { ...TEAM_CONFIGS[0], name: state.settings.team1Name };
  const t2 = { ...TEAM_CONFIGS[1], name: state.settings.team2Name };

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'playing') {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK_TIMER' }), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.phase]);

  // ── Countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'countdown') {
      play('start');
      countRef.current = setInterval(() => {
        dispatch({ type: 'COUNTDOWN_TICK' });
        play('countdown');
      }, 900);
    } else {
      if (countRef.current) clearInterval(countRef.current);
    }
    return () => { if (countRef.current) clearInterval(countRef.current); };
  }, [state.phase, play]);

  // ── Auto-hide toast ────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.toastVisible) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 1800);
    }
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [state.toastVisible, state.toastMsg]);

  // ── Time-based auto-submission (when time runs out) ────────────────────────
  useEffect(() => {
    if (state.phase === 'playing' && state.round.timeLeft <= 0) {
      dispatch({ type: 'SUBMIT_ANSWER', team: state.round.activeTeam });
    }
  }, [state.round.timeLeft, state.phase]);

  // ── Answer feedback sounds (correct/wrong) ───────────────────────────────
  useEffect(() => {
    if (state.phase === 'playing') {
      const team1LastCorrect = state.teams.team1.lastAnswerCorrect;
      const team2LastCorrect = state.teams.team2.lastAnswerCorrect;
      
      if (team1LastCorrect === true) play('clap');
      else if (team1LastCorrect === false) play('wrong');
      
      if (team2LastCorrect === true) play('clap');
      else if (team2LastCorrect === false) play('wrong');
    }
  }, [state.teams.team1.lastAnswerCorrect, state.teams.team2.lastAnswerCorrect, state.phase, play]);

  // ── Question reading (auto-read new questions) ────────────────────────────
  useEffect(() => {
    if (state.phase === 'playing' && state.round.question) {
      const question = state.round.question.question || '';
      if (question && state.round.turnCount === 0) {
        setTimeout(() => speak(question, 0.9, 1.0), 500);
      }
    }
  }, [state.round.question, state.round.turnCount, state.phase, speak]);

  // ── Audio feedback for answers ────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'round-result') {
      if (state.roundWinner) {
        play('victory');
        const winnerName = state.roundWinner === 'team1' ? state.settings.team1Name : state.settings.team2Name;
        speak(`${winnerName} wins this round!`, 1, 1);
      }
    }
  }, [state.phase, state.roundWinner, state.settings, play, speak]);

  // ── Match over callback ────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase === 'match-over' && state.winner) {
      play('victory');
      const winnerName = state.winner === 'team1' ? state.settings.team1Name : state.settings.team2Name;
      speak(`Congratulations! ${winnerName} wins the match!`, 0.95, 1.1);
      if (onGameComplete) {
        onGameComplete({
          winner: winnerName,
          scores: {
            [state.settings.team1Name]: state.teams.team1.score,
            [state.settings.team2Name]: state.teams.team2.score,
          },
        });
      }
    }
  }, [state.phase, state.winner, state.settings, state.teams, onGameComplete, play, speak]);

  // ── Keyboard support ───────────────────────────────────────────────────────
  useEffect(() => {
    if (state.phase !== 'playing') return;
    const active = state.round.activeTeam;
    const handle = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') dispatch({ type:'KEYPAD_INPUT', team:active, digit:e.key });
      else if (e.key === 'Enter') dispatch({ type:'SUBMIT_ANSWER', team:active });
      else if (e.key === 'Backspace') dispatch({ type:'CLEAR_INPUT', team:active });
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [state.phase, state.round.activeTeam]);

  const handleExit = useCallback(() => {
    if (onExit) onExit();
    else dispatch({ type: 'RESET_GAME' });
  }, [onExit]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }, []);

  // ── Settings screen ────────────────────────────────────────────────────────
  if (state.phase === 'settings') {
    return (
      <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
        <SettingsPanel
          settings={state.settings}
          onUpdate={s => dispatch({ type:'UPDATE_SETTINGS', settings:s })}
          onStart={() => {
            dispatch({ type:'START_SUBJECT_SELECT' });
          }}
          onExit={handleExit}
        />
      </div>
    );
  }

  // ── Subject Selection screen ───────────────────────────────────────────────
  if (state.phase === 'subject-select') {
    return (
      <div style={{position:'absolute',inset:0,overflow:'hidden'}}>
        <SubjectSelector
          selectedSubject={state.settings.subject}
          onSelect={(subject) => {
            const pool = shuffle(getQuestionsForLevel(state.settings.classLevel, subject));
            dispatch({ type:'START_GAME_WITH_SUBJECT', subject, pool });
          }}
          onBack={() => dispatch({ type:'RESET_TO_SETTINGS' })}
        />
      </div>
    );
  }

  // ── Countdown screen ────────────────────────────────────��──────────────────
  if (state.phase === 'countdown') {
    return (
      <div style={{
        position:'absolute', inset:0,
        background:'linear-gradient(160deg,#0d1b4b 0%,#1a3a8f 50%,#0d4b2e 100%)',
        display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
      }}>
        <AnimatePresence mode="wait">
          <motion.div key={state.countdownValue}
            initial={{scale:2.5,opacity:0}} animate={{scale:1,opacity:1}}
            exit={{scale:0.5,opacity:0}} transition={{duration:0.35}}
            style={{
              fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
              fontSize:'clamp(6rem,20vw,12rem)', color:'white',
              textShadow:'0 0 60px rgba(255,255,255,0.5)',
            }}>
            {state.countdownValue > 0 ? state.countdownValue : '🚀'}
          </motion.div>
        </AnimatePresence>
        <div style={{
          position:'absolute', bottom:40, left:0, right:0, textAlign:'center',
          color:'rgba(255,255,255,0.45)', fontFamily:"'Nunito',sans-serif",
          fontWeight:800, fontSize:'clamp(0.8rem,2vw,1rem)',
        }}>
          {state.settings.team1Name} 🔵 vs 🔴 {state.settings.team2Name}
          &nbsp;·&nbsp;{state.settings.classLevel}
        </div>
      </div>
    );
  }

  // ── Main game ──────────────────────────────────────────────────────────────
  const roundsNeeded = Math.ceil(state.settings.totalRounds / 2);

  return (
    <div style={{
      position:'absolute', inset:0, overflow:'hidden',
      background:'linear-gradient(180deg,#0a1628 0%,#0d2347 40%,#08311a 100%)',
      display:'flex', flexDirection:'column',
      fontFamily:"'Nunito',sans-serif",
    }}>
      {/* REDESIGNED: Premium Header with Game Info */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'clamp(8px,1.5vh,14px) clamp(12px,2.5vw,20px)', flexShrink:0,
        background:'linear-gradient(180deg,rgba(13,27,75,0.8),rgba(0,0,0,0.4))',
        borderBottom:'2px solid rgba(79,195,247,0.2)',
        backdropFilter:'blur(12px)',
        zIndex:5,
      }}>
        <motion.button onClick={handleExit} whileHover={{scale:1.05}} whileTap={{scale:0.95}} style={{
          background:'linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))',
          border:'1.5px solid rgba(255,255,255,0.15)',
          borderRadius:12, padding:'clamp(6px,1.2vh,10px) clamp(12px,2.5vw,16px)',
          color:'rgba(255,255,255,0.85)', fontFamily:"'Baloo 2',sans-serif",
          fontWeight:800, fontSize:'clamp(0.8rem,1.8vw,0.95rem)', cursor:'pointer',
          backdropFilter:'blur(8px)',
        }}>‹ Exit</motion.button>

        <div style={{display:'flex',alignItems:'center',gap:'clamp(10px,3vw,20px)',flex:1,justifyContent:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'clamp(0.9rem,2.2vw,1.2rem)',color:'#4FC3F7',lineHeight:1}}>
              🔵 {t1.name}
            </div>
            <div style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'clamp(1.2rem,3vw,1.6rem)',color:'#4FC3F7',textShadow:'0 0 10px #4FC3F755'}}>
              {state.teams.team1.score}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <div style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'clamp(0.75rem,1.8vw,0.95rem)',color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.05em'}}>
              Round {state.round.round}/{state.settings.totalRounds}
            </div>
            <div style={{fontFamily:"'Nunito',sans-serif",fontWeight:700,fontSize:'clamp(0.68rem,1.5vw,0.82rem)',color:'rgba(255,255,255,0.3)'}}>
              {state.settings.classLevel}
            </div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'clamp(0.9rem,2.2vw,1.2rem)',color:'#EF9A9A',lineHeight:1}}>
              🔴 {t2.name}
            </div>
            <div style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'clamp(1.2rem,3vw,1.6rem)',color:'#EF9A9A',textShadow:'0 0 10px #EF9A9A55'}}>
              {state.teams.team2.score}
            </div>
          </div>
        </div>

        <motion.button onClick={toggleFullscreen} whileHover={{scale:1.05}} whileTap={{scale:0.95}} style={{
          background:'linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))',
          border:'1.5px solid rgba(255,255,255,0.15)',
          borderRadius:12, padding:'clamp(6px,1.2vh,10px) clamp(12px,2.5vw,16px)',
          color:'rgba(255,255,255,0.85)', fontSize:'clamp(0.95rem,2.2vw,1.2rem)',
          cursor:'pointer', backdropFilter:'blur(8px)',
        }}>⛶</motion.button>
      </div>

      {/* REDESIGNED: Prominent Rope Visualization Zone */}
      <div style={{
        padding:'clamp(12px,2.5vh,20px) clamp(12px,2.5vw,20px)',
        flexShrink:0, zIndex:2,
        background:'linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.05))',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
      }}>
        <TugRope
          ropePosition={state.round.ropePosition}
          team1Color={t1.color} team2Color={t2.color}
          team1Name={t1.name} team2Name={t2.name}
          team1Pullers={t1.pullers} team2Pullers={t2.pullers}
          team1Pulling={state.teams.team1.pulling && state.teams.team1.lastAnswerCorrect === true}
          team2Pulling={state.teams.team2.pulling && state.teams.team2.lastAnswerCorrect === true}
          team1Avatar={state.settings.team1Avatar}
          team2Avatar={state.settings.team2Avatar}
        />
      </div>

      {/* REDESIGNED: Active Team Indicator - Centered, Prominent */}
      <motion.div key={state.round.activeTeam}
        initial={{opacity:0,y:5}} animate={{opacity:1,y:0}}
        style={{
          textAlign:'center', padding:'clamp(6px,1.2vh,10px) 0', flexShrink:0,
          fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
          fontSize:'clamp(0.75rem,1.8vw,0.95rem)',
          color: state.round.activeTeam==='team1' ? '#4FC3F7' : '#EF9A9A',
          textTransform:'uppercase',
          letterSpacing:'0.08em',
          borderTop:'1px solid rgba(255,255,255,0.04)',
        }}>
        {state.round.activeTeam==='team1' ? `🔵 ${t1.name}'s Turn to Answer` : `🔴 ${t2.name}'s Turn to Answer`}
        {state.teams[state.round.activeTeam].streak>=3 && (
          <div style={{marginTop:2,color:'#FFD700',fontSize:'0.85em'}}>
            🔥 {state.teams[state.round.activeTeam].streak} Correct Streak!
          </div>
        )}
      </motion.div>

      {/* REDESIGNED: Side-by-Side Layout - Both Teams Visible Simultaneously (Responsive) */}
      <div style={{
        flex:1, display:'flex', gap:'clamp(8px,1.5vw,16px)',
        padding:'clamp(10px,2vh,16px) clamp(10px,2vw,16px)',
        overflow:'hidden', minHeight:0,
        flexDirection: window.innerWidth < 900 ? 'column' : 'row',
      }}>
        {/* Team 1 (Blue) */}
        <div style={{flex:1,minHeight:0,opacity:state.round.activeTeam==='team1'?1:0.55,transition:'opacity 0.4s'}}>
          <TeamSide
            teamId='team1' teamName={t1.name}
            color={t1.color}
            teamState={state.teams.team1}
            question={state.round.question}
            timeLeft={state.round.timeLeft} totalTime={state.settings.timePerQuestion}
            isActive={state.round.activeTeam==='team1'}
            roundsWon={state.teams.team1.score}
            roundsNeeded={roundsNeeded}
            onKeypad={d=>dispatch({type:'KEYPAD_INPUT',team:'team1',digit:d})}
            onClear={()=>dispatch({type:'CLEAR_INPUT',team:'team1'})}
            onSubmit={()=>dispatch({type:'SUBMIT_ANSWER',team:'team1'})}
            correctAnswer={state.round.question?.answer}
          />
        </div>

        {/* Divider */}
        <div style={{
          width: window.innerWidth < 900 ? '100%' : '2px',
          height: window.innerWidth < 900 ? '2px' : 'auto',
          background:'rgba(255,255,255,0.08)',borderRadius:1,flexShrink:0,alignSelf:window.innerWidth < 900 ? 'stretch' : 'stretch'
        }}/>

        {/* Team 2 (Red) */}
        <div style={{flex:1,minHeight:0,opacity:state.round.activeTeam==='team2'?1:0.55,transition:'opacity 0.4s'}}>
          <TeamSide
            teamId='team2' teamName={t2.name}
            color={t2.color}
            teamState={state.teams.team2}
            question={state.round.question}
            timeLeft={state.round.timeLeft} totalTime={state.settings.timePerQuestion}
            isActive={state.round.activeTeam==='team2'}
            roundsWon={state.teams.team2.score}
            roundsNeeded={roundsNeeded}
            onKeypad={d=>dispatch({type:'KEYPAD_INPUT',team:'team2',digit:d})}
            onClear={()=>dispatch({type:'CLEAR_INPUT',team:'team2'})}
            onSubmit={()=>dispatch({type:'SUBMIT_ANSWER',team:'team2'})}
            correctAnswer={state.round.question?.answer}
          />
        </div>
      </div>

      {/* Global toast */}
      <AnimatePresence mode="wait">
        {state.toastVisible && state.phase==='playing' && (
          <Toast key={`toast-${state.toastMsg}-${Date.now()}`} msg={state.toastMsg} visible={true}/>
        )}
      </AnimatePresence>

      {/* Round result */}
      <AnimatePresence>
        {state.phase==='round-result' && state.roundWinner && (
          <RoundResultOverlay
            winner={state.roundWinner}
            winnerName={state.roundWinner==='team1' ? t1.name : t2.name}
            winnerColor={state.roundWinner==='team1' ? t1.color : t2.color}
            round={state.round.round}
            t1Score={state.teams.team1.score} t2Score={state.teams.team2.score}
            t1Name={t1.name} t2Name={t2.name}
            onContinue={()=>dispatch({type:'ACKNOWLEDGE_ROUND_RESULT'})}
          />
        )}
      </AnimatePresence>

      {/* Match over */}
      <AnimatePresence>
        {state.phase==='match-over' && state.winner && !showLeaderboard && (
          <MatchOverOverlay
            winner={state.winner}
            winnerName={state.winner==='team1' ? t1.name : t2.name}
            winnerColor={state.winner==='team1' ? t1.color : t2.color}
            t1Score={state.teams.team1.score} t2Score={state.teams.team2.score}
            t1Name={t1.name} t2Name={t2.name}
            onPlayAgain={()=>{
              setShowLeaderboard(false);
              const pool = shuffle(getQuestionsForLevel(state.settings.classLevel, state.settings.subject));
              dispatch({type:'START_GAME',pool});
            }}
            onExit={()=>{
              setShowLeaderboard(false);
              handleExit();
            }}
            onViewLeaderboard={()=>setShowLeaderboard(true)}
          />
        )}
      </AnimatePresence>

      {/* Leaderboard */}
      <AnimatePresence>
        {state.phase==='match-over' && state.winner && showLeaderboard && (
          <GameLeaderboard
            entries={[
              {
                rank: state.teams.team1.score > state.teams.team2.score ? 1 : 2,
                name: t1.name,
                roundsWon: state.teams.team1.score,
                totalRounds: state.settings.totalRounds,
                color: t1.color,
                isWinner: state.winner === 'team1',
              },
              {
                rank: state.teams.team2.score > state.teams.team1.score ? 1 : 2,
                name: t2.name,
                roundsWon: state.teams.team2.score,
                totalRounds: state.settings.totalRounds,
                color: t2.color,
                isWinner: state.winner === 'team2',
              },
            ]}
            onClose={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TugOfWarGame;
