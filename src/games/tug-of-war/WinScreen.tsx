// ─── WinScreen.tsx ────────────────────────────────────────────────────────────
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TeamId } from './tugTypes';

// ── Confetti ───────────────────────────────────────────────────────────────────
const COLS = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#DDA0DD','#98D8C8','#F5A623'];

function Confetti() {
  const pieces = Array.from({length:70},(_,i)=>({
    id:i, x:Math.random()*100, rot:Math.random()*720-360,
    size:5+Math.random()*9, color:COLS[i%COLS.length],
    delay:Math.random()*1.2, dur:2.2+Math.random()*1.8,
    shape: Math.random()>0.5?'50%':'2px',
  }));
  return (
    <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:998,overflow:'hidden'}}>
      {pieces.map(p=>(
        <motion.div key={p.id}
          initial={{y:-20,x:`${p.x}vw`,opacity:1,rotate:0}}
          animate={{y:'110vh',rotate:p.rot,opacity:[1,1,0]}}
          transition={{duration:p.dur,delay:p.delay,ease:'easeIn'}}
          style={{position:'absolute',top:0,width:p.size,height:p.size,
            background:p.color,borderRadius:p.shape}}
        />
      ))}
    </div>
  );
}

// ── Round Result ──────────────────────────────────────────────────────────────
interface RoundProps {
  winner: TeamId; winnerName: string; winnerColor: string;
  round: number;
  t1Score: number; t2Score: number; t1Name: string; t2Name: string;
  onContinue: () => void;
}

export function RoundResultOverlay({winner,winnerName,winnerColor,round,t1Score,t2Score,t1Name,t2Name,onContinue}:RoundProps) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:'absolute',inset:0,zIndex:50,
        background:'rgba(0,0,0,0.78)',backdropFilter:'blur(6px)',
        display:'flex',alignItems:'center',justifyContent:'center'}}>
      <Confetti/>
      <motion.div initial={{scale:0.7,y:40}} animate={{scale:1,y:0}}
        transition={{type:'spring',stiffness:280,damping:22}}
        style={{
          background:`linear-gradient(160deg,#0d1b4b,${winnerColor}33)`,
          border:`3px solid ${winnerColor}`,borderRadius:28,
          padding:'clamp(24px,5vw,40px) clamp(28px,6vw,52px)',
          textAlign:'center',maxWidth:'min(90vw,400px)',
          boxShadow:`0 0 60px ${winnerColor}55`,
        }}>
        <motion.div animate={{y:[0,-18,0,-10,0]}} transition={{repeat:Infinity,duration:1.1}}
          style={{fontSize:'clamp(2rem,6vw,3rem)',marginBottom:10}}>🏆</motion.div>
        <div style={{color:'rgba(255,255,255,0.55)',fontSize:'0.72rem',fontWeight:800,
          textTransform:'uppercase' as const,letterSpacing:'0.1em',marginBottom:6}}>Round {round} Winner!</div>
        <motion.div animate={{scale:[1,1.06,1]}} transition={{repeat:Infinity,duration:1.4}}
          style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
            fontSize:'clamp(1.6rem,5vw,2.4rem)',color:winnerColor,
            textShadow:`0 0 20px ${winnerColor}`,marginBottom:16}}>
          {winnerName}!
        </motion.div>
        <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:24,
          fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'clamp(0.9rem,2vw,1.1rem)'}}>
          <span style={{color:'#4FC3F7'}}>{t1Name}: {t1Score}</span>
          <span style={{color:'rgba(255,255,255,0.3)'}}>vs</span>
          <span style={{color:'#EF9A9A'}}>{t2Name}: {t2Score}</span>
        </div>
        <motion.button onClick={onContinue} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
          style={{
            background:`linear-gradient(135deg,${winnerColor},${winnerColor}bb)`,
            border:'none',borderRadius:16,padding:'12px 32px',color:'white',
            fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
            fontSize:'clamp(0.95rem,2vw,1.1rem)',cursor:'pointer',
            boxShadow:`0 4px 20px ${winnerColor}55`,
          }}>▶ Next Round!</motion.button>
      </motion.div>
    </motion.div>
  );
}

// ── Match Over ────────────────────────────────────────────────────────────────
interface MatchProps {
  winner: TeamId; winnerName: string; winnerColor: string;
  t1Score: number; t2Score: number; t1Name: string; t2Name: string;
  onPlayAgain: () => void; onExit: () => void;
}

export function MatchOverOverlay({winner,winnerName,winnerColor,t1Score,t2Score,t1Name,t2Name,onPlayAgain,onExit}:MatchProps) {
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      style={{position:'absolute',inset:0,zIndex:50,
        background:'rgba(0,0,0,0.88)',backdropFilter:'blur(8px)',
        display:'flex',alignItems:'center',justifyContent:'center'}}>
      <Confetti/>
      <motion.div initial={{scale:0.6,y:60}} animate={{scale:1,y:0}}
        transition={{type:'spring',stiffness:240,damping:20}}
        style={{
          background:`linear-gradient(160deg,#0d1b4b,${winnerColor}33)`,
          border:`4px solid ${winnerColor}`,borderRadius:32,
          padding:'clamp(28px,6vw,48px) clamp(32px,7vw,56px)',
          textAlign:'center',maxWidth:'min(92vw,460px)',
          boxShadow:`0 0 80px ${winnerColor}66`,
        }}>
        <motion.div animate={{rotate:[0,360]}} transition={{repeat:Infinity,duration:8,ease:'linear'}}
          style={{fontSize:'clamp(1.8rem,4vw,2.5rem)',marginBottom:4}}>⭐</motion.div>
        <div style={{color:'rgba(255,255,255,0.55)',fontSize:'0.75rem',fontWeight:800,
          textTransform:'uppercase' as const,letterSpacing:'0.12em',marginBottom:6}}>🏆 Match Champion!</div>
        <motion.div animate={{y:[0,-20,0],scale:[1,1.08,1]}} transition={{repeat:Infinity,duration:1.1}}
          style={{fontSize:'clamp(2.5rem,7vw,4rem)',marginBottom:8}}>🎉</motion.div>
        <motion.div animate={{scale:[1,1.05,1]}} transition={{repeat:Infinity,duration:1.6}}
          style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
            fontSize:'clamp(1.8rem,5vw,2.8rem)',color:winnerColor,
            textShadow:`0 0 30px ${winnerColor}`,lineHeight:1.1,marginBottom:6}}>
          {winnerName}
        </motion.div>
        <div style={{color:'rgba(255,255,255,0.7)',fontFamily:"'Nunito',sans-serif",
          fontWeight:800,fontSize:'clamp(0.9rem,2vw,1rem)',marginBottom:20}}>
          wins the match! 🎉
        </div>
        {/* Score */}
        <div style={{background:'rgba(255,255,255,0.07)',borderRadius:16,
          padding:'12px 20px',marginBottom:24,
          display:'flex',justifyContent:'center',gap:20,fontFamily:"'Baloo 2',sans-serif"}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'clamp(1.4rem,4vw,1.9rem)',fontWeight:900,color:'#4FC3F7'}}>{t1Score}</div>
            <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.45)',fontWeight:700}}>{t1Name}</div>
          </div>
          <div style={{fontSize:'1.3rem',alignSelf:'center',color:'rgba(255,255,255,0.25)'}}>:</div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'clamp(1.4rem,4vw,1.9rem)',fontWeight:900,color:'#EF9A9A'}}>{t2Score}</div>
            <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.45)',fontWeight:700}}>{t2Name}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap' as const}}>
          <motion.button onClick={onPlayAgain} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
            style={{background:'linear-gradient(135deg,#008751,#005c38)',border:'none',
              borderRadius:16,padding:'12px clamp(20px,4vw,28px)',color:'white',
              fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
              fontSize:'clamp(0.85rem,2vw,1rem)',cursor:'pointer',
              boxShadow:'0 4px 20px rgba(0,135,81,0.45)'}}>
            🔄 Play Again
          </motion.button>
          <motion.button onClick={onExit} whileHover={{scale:1.05}} whileTap={{scale:0.95}}
            style={{background:'rgba(255,255,255,0.1)',border:'2px solid rgba(255,255,255,0.2)',
              borderRadius:16,padding:'12px clamp(20px,4vw,28px)',color:'white',
              fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
              fontSize:'clamp(0.85rem,2vw,1rem)',cursor:'pointer'}}>
            🏠 Exit
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Toast notification ────────────────────────────────────────────────────────
interface ToastProps { msg: string; visible: boolean; }
export function Toast({msg,visible}:ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{opacity:0,y:-30,scale:0.85}}
          animate={{opacity:1,y:0,scale:1}}
          exit={{opacity:0,y:-20,scale:0.85}}
          transition={{duration:0.3}}
          style={{
            position:'absolute',top:10,left:'50%',transform:'translateX(-50%)',
            zIndex:40, pointerEvents:'none',
            background:'linear-gradient(135deg,#1a1a2e,#2d2d5e)',
            border:'2px solid rgba(255,255,255,0.2)',
            padding:'8px clamp(16px,3vw,24px)',borderRadius:24,
            fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
            fontSize:'clamp(0.75rem,2vw,0.95rem)',color:'white',
            boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
            whiteSpace:'nowrap' as const,
          }}>
          {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
