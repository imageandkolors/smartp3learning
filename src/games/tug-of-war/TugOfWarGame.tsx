// ─── TugOfWarGame.tsx ─────────────────────────────────────────────────────────
import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tugReducer, makeInitialState } from './tugReducer';
import { TEAM_CONFIGS, shuffle } from './tugUtils';
import { getQuestionsForLevel } from './tugQuestions';
import { SettingsPanel } from './SettingsPanel';
import { TugRope } from './TugRope';
import { TeamSide } from './TeamSide';
import { RoundResultOverlay, MatchOverOverlay, Toast } from './WinScreen';
import { useSFX } from '../../hooks/useSFX';
import type { TeamId } from './tugTypes';

interface Props {
  onGameComplete?: (r: { winner: string; scores: Record<string,number> }) => void;
  onExit?: () => void;
}

export function TugOfWarGame({ onGameComplete, onExit }: Props) {
  const [state, dispatch] = useReducer(tugReducer, makeInitialState());
  const timerRef    = useRef<ReturnType<typeof setInterval>|null>(null);
  const countRef    = useRef<ReturnType<typeof setInterval>|null>(null);
  const toastTimer  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const { play, speak } = useSFX();

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
            const pool = shuffle(getQuestionsForLevel(state.settings.classLevel));
            dispatch({ type:'START_GAME', pool });
          }}
          onExit={handleExit}
        />
      </div>
    );
  }

  // ── Countdown screen ───────────────────────────────────────────────────────
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
      {/* Top bar */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'clamp(5px,1.2vh,10px) clamp(8px,2vw,14px)', flexShrink:0,
        background:'rgba(0,0,0,0.35)', borderBottom:'1px solid rgba(255,255,255,0.07)',
        zIndex:5,
      }}>
        <button onClick={handleExit} style={{
          background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:10, padding:'clamp(4px,1vh,7px) clamp(10px,2vw,14px)',
          color:'rgba(255,255,255,0.75)', fontFamily:"'Nunito',sans-serif",
          fontWeight:800, fontSize:'clamp(0.72rem,1.6vw,0.88rem)', cursor:'pointer',
        }}>‹ Exit</button>

        <div style={{display:'flex',alignItems:'center',gap:'clamp(8px,2vw,16px)'}}>
          <span style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
            fontSize:'clamp(0.75rem,2vw,0.95rem)',color:'#4FC3F7'}}>
            🔵 {state.teams.team1.score}
          </span>
          <div style={{
            background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:12, padding:'clamp(4px,0.8vh,6px) clamp(12px,2.5vw,18px)',
            fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
            fontSize:'clamp(0.72rem,1.8vw,0.9rem)', color:'white',
          }}>
            Round {state.round.round}/{state.settings.totalRounds}
            &nbsp;·&nbsp;{state.settings.classLevel}
          </div>
          <span style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
            fontSize:'clamp(0.75rem,2vw,0.95rem)',color:'#EF9A9A'}}>
            {state.teams.team2.score} 🔴
          </span>
        </div>

        <button onClick={toggleFullscreen} style={{
          background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:10, padding:'clamp(4px,1vh,7px) clamp(10px,2vw,14px)',
          color:'rgba(255,255,255,0.75)', fontSize:'clamp(0.85rem,2vw,1.1rem)',
          cursor:'pointer', lineHeight:1,
        }}>⛶</button>
      </div>

      {/* Rope zone */}
      <div style={{
        padding:'clamp(4px,1vh,8px) clamp(8px,2vw,16px)',
        flexShrink:0, zIndex:2,
        borderBottom:'1px solid rgba(255,255,255,0.05)',
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

      {/* Active team indicator */}
      <motion.div key={state.round.activeTeam}
        initial={{opacity:0}} animate={{opacity:1}}
        style={{
          textAlign:'center', padding:'clamp(2px,0.6vh,5px) 0', flexShrink:0,
          fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
          fontSize:'clamp(0.65rem,1.6vw,0.82rem)',
          color: state.round.activeTeam==='team1' ? '#4FC3F7' : '#EF9A9A',
        }}>
        {state.round.activeTeam==='team1' ? `🔵 ${t1.name}'s turn` : `🔴 ${t2.name}'s turn`}
        {state.teams[state.round.activeTeam].streak>=3 && (
          <span style={{marginLeft:8,color:'#FFD700'}}>
            🔥 {state.teams[state.round.activeTeam].streak} streak!
          </span>
        )}
      </motion.div>

      {/* Two team sides */}
      <div style={{
        flex:1, display:'flex', gap:'clamp(5px,1.5vw,10px)',
        padding:'clamp(4px,1vh,8px) clamp(6px,1.5vw,10px) clamp(6px,1.5vh,12px)',
        overflow:'hidden', minHeight:0,
      }}>
        <TeamSide
          teamId="team1" teamName={t1.name} color={t1.color}
          teamState={state.teams.team1}
          question={state.round.question}
          timeLeft={state.round.timeLeft} totalTime={state.settings.timePerQuestion}
          isActive={state.round.activeTeam==='team1'}
          roundsWon={state.teams.team1.score} roundsNeeded={roundsNeeded}
          onKeypad={d=>dispatch({type:'KEYPAD_INPUT',team:'team1',digit:d})}
          onClear={()=>dispatch({type:'CLEAR_INPUT',team:'team1'})}
          onSubmit={()=>dispatch({type:'SUBMIT_ANSWER',team:'team1'})}
        />
        <div style={{width:2,background:'rgba(255,255,255,0.06)',borderRadius:2,flexShrink:0,alignSelf:'stretch'}}/>
        <TeamSide
          teamId="team2" teamName={t2.name} color={t2.color}
          teamState={state.teams.team2}
          question={state.round.question}
          timeLeft={state.round.timeLeft} totalTime={state.settings.timePerQuestion}
          isActive={state.round.activeTeam==='team2'}
          roundsWon={state.teams.team2.score} roundsNeeded={roundsNeeded}
          onKeypad={d=>dispatch({type:'KEYPAD_INPUT',team:'team2',digit:d})}
          onClear={()=>dispatch({type:'CLEAR_INPUT',team:'team2'})}
          onSubmit={()=>dispatch({type:'SUBMIT_ANSWER',team:'team2'})}
        />
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
        {state.phase==='match-over' && state.winner && (
          <MatchOverOverlay
            winner={state.winner}
            winnerName={state.winner==='team1' ? t1.name : t2.name}
            winnerColor={state.winner==='team1' ? t1.color : t2.color}
            t1Score={state.teams.team1.score} t2Score={state.teams.team2.score}
            t1Name={t1.name} t2Name={t2.name}
            onPlayAgain={()=>{
              const pool = shuffle(getQuestionsForLevel(state.settings.classLevel));
              dispatch({type:'START_GAME',pool});
            }}
            onExit={handleExit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default TugOfWarGame;
