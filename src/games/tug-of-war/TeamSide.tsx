// ─── TeamSide.tsx ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSFX } from '../../hooks/useSFX';
import type { TeamId, TeamState, TugQuestion } from './tugTypes';

// Auto-dismissing feedback toast with answer display
function FeedbackToast({ isCorrect, streak, correctAnswer }: { isCorrect: boolean | null; streak: number; correctAnswer?: string | number }) {
  const [show, setShow] = useState(isCorrect !== null);
  
  useEffect(() => {
    if (isCorrect !== null) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);
  
  return (
    <AnimatePresence>
      {show && isCorrect !== null && (
        <motion.div
          initial={{opacity:0,y:-12,scale:0.8}}
          animate={{opacity:1,y:0,scale:1}}
          exit={{opacity:0,y:-20,scale:0.8}}
          transition={{duration:0.3}}
          style={{
            position:'absolute', top:'clamp(50px,10vh,70px)',
            left:'50%', transform:'translateX(-50%)',
            zIndex:20, pointerEvents:'none',
            background: isCorrect
              ? 'linear-gradient(135deg,#008751,#00c97a)'
              : 'linear-gradient(135deg,#e74c3c,#c0392b)',
            padding:'clamp(10px,2vh,16px) clamp(16px,3vw,24px)', borderRadius:20,
            fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
            fontSize:'clamp(0.8rem,1.8vw,1rem)', color:'white',
            boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
            backdropFilter:'blur(8px)',
            textAlign:'center' as const,
            maxWidth:'90%',
          }}>
          <div style={{fontWeight:900,fontSize:'1.1em',marginBottom:4}}>
            {isCorrect
              ? streak>=3 ? `🔥 x${streak} STREAK!` : '✅ Correct!'
              : '❌ Wrong!'}
          </div>
          {correctAnswer !== undefined && (
            <div style={{fontFamily:"'Nunito',sans-serif",fontSize:'0.85em',fontWeight:700,opacity:0.95}}>
              Correct Answer: <strong>{correctAnswer}</strong>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface Props {
  teamId: TeamId;
  teamName: string;
  color: string;
  teamState: TeamState;
  question: TugQuestion | null;
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  roundsWon: number;
  roundsNeeded: number;
  onKeypad: (d: string) => void;
  onClear: () => void;
  onSubmit: () => void;
  correctAnswer?: string | number;
}

const ROWS = [['7','8','9'],['4','5','6'],['1','2','3'],['CLR','0','✓']];

export function TeamSide({
  teamId, teamName, color, teamState, question,
  timeLeft, totalTime, isActive,
  roundsWon, roundsNeeded,
  onKeypad, onClear, onSubmit, correctAnswer,
}: Props) {
  const { play } = useSFX();
  const pct = (timeLeft / totalTime) * 100;
  const timerCol = pct > 50 ? '#00c97a' : pct > 25 ? '#F5A623' : '#e74c3c';
  const urgent = pct <= 30;

  return (
    <div style={{
      flex:1, display:'flex', flexDirection:'column', gap:'clamp(5px,1.2vh,10px)',
      padding:'clamp(6px,1.5vw,12px)',
      background: isActive ? `${color}18` : 'rgba(255,255,255,0.03)',
      borderRadius:18,
      border:`2px solid ${isActive ? color+'66' : 'rgba(255,255,255,0.07)'}`,
      transition:'all 0.3s',
      position:'relative', overflow:'hidden',
      minWidth:0,
    }}>
      {/* Active pulse bg */}
      {isActive && (
        <motion.div animate={{opacity:[0.04,0.10,0.04]}} transition={{repeat:Infinity,duration:2}}
          style={{position:'absolute',inset:0,background:color,pointerEvents:'none',borderRadius:16}}/>
      )}

      {/* Header row */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:1,flexShrink:0}}>
        <div style={{
          background:color, color:'white', borderRadius:20,
          padding:'4px clamp(10px,2vw,16px)',
          fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
          fontSize:'clamp(0.75rem,2vw,1rem)',
          boxShadow:`0 3px 10px ${color}55`,
          whiteSpace:'nowrap' as const,
        }}>{teamName}</div>
        {/* Round win dots */}
        <div style={{display:'flex',gap:4}}>
          {Array.from({length:roundsNeeded}).map((_,i)=>(
            <div key={i} style={{
              width:'clamp(10px,1.8vw,14px)', height:'clamp(10px,1.8vw,14px)',
              borderRadius:'50%',
              background: i < roundsWon ? color : 'rgba(255,255,255,0.15)',
              border:`2px solid ${i < roundsWon ? color : 'rgba(255,255,255,0.2)'}`,
              boxShadow: i < roundsWon ? `0 0 8px ${color}` : 'none',
              transition:'all 0.3s',
            }}/>
          ))}
        </div>
      </div>

      {/* Question */}
      <div style={{
        background:'rgba(255,255,255,0.08)', borderRadius:14,
        padding:'clamp(8px,2vh,14px) clamp(10px,2vw,16px)',
        textAlign:'center', zIndex:1, flexShrink:0, minHeight:'clamp(52px,10vh,80px)',
        display:'flex', flexDirection:'column', justifyContent:'center',
      }}>
        {isActive && question ? (
          <>
            <div style={{
              color:'rgba(255,255,255,0.45)', fontSize:'clamp(0.58rem,1.2vw,0.72rem)',
              fontWeight:800, textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:3,
            }}>{question.subject} · {question.topic}</div>
            <div style={{
              fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
              fontSize:'clamp(1rem,2.8vw,1.8rem)', color:'white', lineHeight:1.2,
            }}>{question.question}</div>
          </>
        ) : (
          <div style={{color:'rgba(255,255,255,0.2)',fontFamily:"'Baloo 2',sans-serif",
            fontWeight:700,fontSize:'clamp(0.85rem,2vw,1.1rem)'}}>
            Waiting...
          </div>
        )}
      </div>

      {/* Input box */}
      <motion.div
        animate={isActive ? {borderColor:[`${color}66`,color,`${color}66`]} : {}}
        transition={{repeat:Infinity,duration:1.4}}
        style={{
          background:'rgba(0,0,0,0.35)',
          border:`3px solid ${isActive ? color : 'rgba(255,255,255,0.08)'}`,
          borderRadius:12, padding:'clamp(8px,1.5vh,12px)',
          textAlign:'center', zIndex:1, flexShrink:0,
          minHeight:'clamp(44px,8vh,60px)', display:'flex',
          alignItems:'center', justifyContent:'center',
        }}>
        <span style={{
          fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
          fontSize:'clamp(1.2rem,3.5vw,1.9rem)', color:'white', letterSpacing:'0.06em',
        }}>
          {teamState.currentInput || (isActive ? '▏' : '–')}
        </span>
      </motion.div>

      {/* Timer bar */}
      {isActive && (
        <div style={{zIndex:1,flexShrink:0}}>
          <div style={{height:'clamp(6px,1.2vw,10px)',background:'rgba(255,255,255,0.08)',
            borderRadius:5,overflow:'hidden'}}>
            <motion.div
              animate={{width:`${pct}%`}} transition={{duration:0.5}}
              style={{height:'100%',background:timerCol,borderRadius:5,
                boxShadow:`0 0 8px ${timerCol}`}}/>
          </div>
          <div style={{textAlign:'right',marginTop:2}}>
            <motion.span
              animate={urgent ? {scale:[1,1.2,1],color:['#e74c3c','#ff6b6b','#e74c3c']} : {}}
              transition={{repeat:Infinity,duration:0.6}}
              style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
                fontSize:'clamp(0.65rem,1.5vw,0.85rem)',color:timerCol}}>
              {timeLeft}s
            </motion.span>
          </div>
        </div>
      )}

      {/* Number pad */}
      <div style={{
        display:'grid', gridTemplateRows:'repeat(4,1fr)', gap:'clamp(4px,1vw,7px)',
        flex:1, zIndex:1, opacity: isActive ? 1 : 0.25, minHeight:0,
      }}>
        {ROWS.map((row,ri)=>(
          <div key={ri} style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',
            gap:'clamp(4px,1vw,7px)'}}>
            {row.map(key=>{
              const isSubmit = key==='✓';
              const isClear  = key==='CLR';
              return (
                <motion.button key={key}
                  whileTap={{scale:isActive?0.88:1}}
                  onClick={()=>{
                    if(!isActive) return;
                    play('click');
                    if(isSubmit) onSubmit();
                    else if(isClear) onClear();
                    else onKeypad(key);
                  }}
                  style={{
                    borderRadius:'clamp(8px,1.5vw,14px)', cursor:isActive?'pointer':'default',
                    border:'none', color:'white',
                    fontFamily:"'Baloo 2',sans-serif", fontWeight:900,
                    fontSize:'clamp(0.85rem,2.2vw,1.3rem)',
                    background: isSubmit
                      ? `linear-gradient(135deg,${color},${color}bb)`
                      : isClear
                      ? 'rgba(220,50,50,0.25)'
                      : 'rgba(255,255,255,0.09)',
                    boxShadow: isSubmit && isActive ? `0 3px 12px ${color}55` : 'none',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    minHeight:'clamp(34px,6vw,52px)',
                    transition:'background 0.15s',
                  }}>
                  {key}
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Feedback toast - Shows for 2s then auto-hides with correct answer */}
      <FeedbackToast isCorrect={teamState.lastAnswerCorrect} streak={teamState.streak} correctAnswer={correctAnswer}/>
    </div>
  );
}
