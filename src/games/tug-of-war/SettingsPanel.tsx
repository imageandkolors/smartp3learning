// ─── SettingsPanel.tsx ────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings, ClassLevel } from './tugTypes';
import { CLASS_LABELS } from './tugUtils';

interface Props {
  settings: GameSettings;
  onUpdate: (s: Partial<GameSettings>) => void;
  onStart: () => void;
  onExit: () => void;
}

const card = {
  background: 'rgba(255,255,255,0.07)',
  borderRadius: 18, padding: '14px 16px',
  border: '1px solid rgba(255,255,255,0.12)',
};
const label = { color: 'rgba(255,255,255,0.5)', fontSize: '0.68rem', fontWeight: 800 as const, textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 10 };

export function SettingsPanel({ settings, onUpdate, onStart, onExit }: Props) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  return (
    <div style={{
      position:'absolute', inset:0, overflow:'auto',
      background:'linear-gradient(160deg,#0d1b4b 0%,#1a3a8f 50%,#0d4b2e 100%)',
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', padding:'16px',
    }}>
      <button onClick={onExit} style={{
        position:'absolute', top:14, left:14,
        background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)',
        borderRadius:10, padding:'6px 14px', color:'white',
        fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:'0.85rem', cursor:'pointer',
      }}>‹ Exit</button>

      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
        style={{width:'100%',maxWidth:520,display:'flex',flexDirection:'column',gap:12}}>

        {/* Title */}
        <div style={{textAlign:'center',marginBottom:4}}>
          <div style={{fontSize:'clamp(2.2rem,6vw,3.2rem)'}}>🪢</div>
          <div style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,
            fontSize:'clamp(1.4rem,4vw,2rem)',color:'white'}}>Tug of War</div>
          <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.8rem',fontWeight:700}}>
            Nigeria Primary School Quiz Battle
          </div>
        </div>

        {/* Team Names & Avatars */}
        <div style={card}>
          <div style={label}>⚔️ Team Names & Avatars</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {(['team1','team2'] as const).map((t,i)=>(
              <div key={t}>
                <div style={{color:'rgba(255,255,255,0.5)',fontSize:'0.68rem',fontWeight:800,marginBottom:5}}>
                  {i===0?'🔵 Team 1':'🔴 Team 2'}
                </div>
                <input value={i===0?settings.team1Name:settings.team2Name}
                  onChange={e=>onUpdate(i===0?{team1Name:e.target.value}:{team2Name:e.target.value})}
                  maxLength={16}
                  style={{width:'100%',padding:'9px 12px',background:'rgba(255,255,255,0.08)',
                    border:`2px solid ${i===0?'#1565C0':'#C62828'}`,borderRadius:10,
                    color:'white',fontFamily:"'Nunito',sans-serif",fontWeight:800,fontSize:'0.9rem',
                    outline:'none',boxSizing:'border-box',marginBottom:'8px'}}/>
                {/* Avatar Upload */}
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {(i===0?settings.team1Avatar:settings.team2Avatar) && (
                    <img 
                      src={i===0?settings.team1Avatar:settings.team2Avatar}
                      alt="avatar"
                      style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',border:'2px solid rgba(255,255,255,0.3)'}}
                    />
                  )}
                  <label style={{flex:1,cursor:'pointer',position:'relative',overflow:'hidden'}}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e)=>{
                        const file=e.target.files?.[0];
                        if(file){
                          const reader=new FileReader();
                          reader.onload=(evt)=>{
                            onUpdate(i===0?{team1Avatar:evt.target?.result as string}:{team2Avatar:evt.target?.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{display:'none'}}
                    />
                    <div style={{padding:'7px 12px',background:'rgba(255,255,255,0.08)',border:`1px solid rgba(255,255,255,0.2)`,borderRadius:8,
                      textAlign:'center',color:'rgba(255,255,255,0.7)',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',
                      transition:'all 0.2s'}}>
                      📷
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class Level */}
        <div style={card}>
          <div style={label}>🎓 Class Level</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {(Object.keys(CLASS_LABELS) as ClassLevel[]).map(lvl=>(
              <motion.button key={lvl} whileTap={{scale:0.95}} whileHover={{scale:1.05}}
                onClick={()=>onUpdate({classLevel:lvl})}
                style={{
                  padding:'12px 8px',borderRadius:14,cursor:'pointer',
                  background: settings.classLevel===lvl
                    ? 'linear-gradient(135deg,#F5A623,#e67e22)'
                    : 'rgba(255,255,255,0.07)',
                  border: settings.classLevel===lvl
                    ? '2px solid #F5A623' : '2px solid rgba(255,255,255,0.12)',
                  color:'white',fontFamily:"'Baloo 2',sans-serif",
                  fontWeight:900,fontSize:'0.9rem',
                  minHeight:'44px',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  transition:'all 0.2s',
                }}>
                {CLASS_LABELS[lvl]}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Time & Rounds */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div style={card}>
            <div style={label}>⏱ Seconds / Question</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap' as const}}>
              {[10,15,20,30].map(t=>(
                <motion.button key={t} whileTap={{scale:0.95}}
                  onClick={()=>onUpdate({timePerQuestion:t})}
                  style={{
                    flex:'1 1 40%',padding:'9px 4px',borderRadius:10,cursor:'pointer',
                    background: settings.timePerQuestion===t ? '#008751' : 'rgba(255,255,255,0.07)',
                    border: settings.timePerQuestion===t ? '2px solid #00c97a' : '2px solid rgba(255,255,255,0.12)',
                    color:'white',fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'0.9rem',
                  }}>
                  {t}s
                </motion.button>
              ))}
            </div>
          </div>
          <div style={card}>
            <div style={label}>🏆 Total Rounds</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
              {[3,5,7].map(r=>(
                <motion.button key={r} whileTap={{scale:0.95}}
                  onClick={()=>onUpdate({totalRounds:r})}
                  style={{
                    padding:'9px 4px',borderRadius:10,cursor:'pointer',
                    background: settings.totalRounds===r ? '#008751' : 'rgba(255,255,255,0.07)',
                    border: settings.totalRounds===r ? '2px solid #00c97a' : '2px solid rgba(255,255,255,0.12)',
                    color:'white',fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'0.85rem',
                  }}>
                  {r} Rounds
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Per Round */}
        <div style={card}>
          <div style={label}>📋 Questions per Round</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
            {[5,8,10,15,20].map(q=>(
              <motion.button key={q} whileTap={{scale:0.95}}
                onClick={()=>onUpdate({questionsPerRound:q})}
                style={{
                  padding:'8px 4px',borderRadius:10,cursor:'pointer',
                  background: settings.questionsPerRound===q ? '#4FC3F7' : 'rgba(255,255,255,0.07)',
                  border: settings.questionsPerRound===q ? '2px solid #4FC3F7' : '2px solid rgba(255,255,255,0.12)',
                  color:'white',fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'0.8rem',
                }}>
                {q}Qs
              </motion.button>
            ))}
          </div>
          <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)',marginTop:8,textAlign:'center'}}>
            Questions per round (teams alternate)
          </div>
        </div>

        {/* Sound Toggle */}
        <div style={card}>
          <div style={label}>🔊 Sound & Voice</div>
          <motion.button 
            whileTap={{scale:0.95}}
            onClick={()=>setSoundEnabled(!soundEnabled)}
            style={{
              width:'100%',padding:'12px',background:soundEnabled?'rgba(0,200,122,0.3)':'rgba(200,50,50,0.2)',
              border:`2px solid ${soundEnabled?'#00c97a':'#e74c3c'}`,borderRadius:12,
              color:'white',fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'0.95rem',
              cursor:'pointer',transition:'all 0.2s',
            }}>
            {soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF'}
          </motion.button>
          <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)',marginTop:8,textAlign:'center'}}>
            Includes SFX, voice announcements & feedback
          </div>
        </div>

        {/* Start */}
        <motion.button onClick={onStart} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
          style={{
            padding:'17px',background:'linear-gradient(135deg,#008751,#005c38)',
            border:'none',borderRadius:18,color:'white',
            fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'1.2rem',
            cursor:'pointer',boxShadow:'0 6px 24px rgba(0,135,81,0.4)',
          }}>
          🚀 Start Battle!
        </motion.button>
      </motion.div>
    </div>
  );
}
