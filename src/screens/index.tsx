import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useSFX } from '../hooks/useSFX';
import { useToast, checkAnswer, shuffle, makeFakes, launchConfetti } from '../utils/helpers';
import { SUBJECTS } from '../data/questions';
import type { Question } from '../data/questions';
import { TugOfWarGame } from '../games/tug-of-war/TugOfWarGame';

/* ─── helpers ─────────────────────────────────────── */
function useClock(){
  const fmt=()=>{const n=new Date();return`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;};
  const[t,setT]=useState(fmt);useEffect(()=>{const iv=setInterval(()=>setT(fmt()),15000);return()=>clearInterval(iv);},[]);return t;
}
const stagger={hidden:{},show:{transition:{staggerChildren:.07}}};
const fadeUp={hidden:{opacity:0,y:20},show:{opacity:1,y:0,transition:{type:'spring' as const,stiffness:280,damping:22}}};
const LETTERS=['A','B','C','D'];
const K_SHAPES=['▲','■','●','✦'];
const K_COLS=['kr','kb','ky','kg'];

/* ─── STATUS BAR ──────────────────────────────────── */
export function StatusBar(){const t=useClock();return(<div className="status-bar"><span>{t}</span><div style={{display:'flex',gap:4}}><span>📶</span><span>🔋</span></div></div>);}

/* ─── BOTTOM NAV ──────────────────────────────────── */
export function BottomNav(){
  const{screen,setScreen}=useAppStore();const{play}=useSFX();
  const active=(['home','subjects','games','awards'].includes(screen)?screen:screen.startsWith('k-')||screen==='kahoot'?'play':'home');
  const tabs=[{id:'home',icon:'🏠',lbl:'Home'},{id:'subjects',icon:'📚',lbl:'Subjects'},{id:'play',icon:'⚡',lbl:'Play'},{id:'games',icon:'🎮',lbl:'Games'},{id:'awards',icon:'🏆',lbl:'Awards'}];
  const go=(id:string)=>{play('nav');setScreen(id==='play'?'k-pick':id as any);};
  return(<nav className="bottom-nav">{tabs.map(t=>(<button key={t.id} className={`nav-btn${active===t.id?' active':''}`} onClick={()=>go(t.id)}><motion.span className="nav-icon" animate={active===t.id?{scale:1.2}:{scale:1}}>{t.icon}</motion.span><span className="nav-label">{t.lbl}</span></button>))}</nav>);
}

/* ─── DESKTOP TOPBAR WITH HAMBURGER MENU ──────────────────────────────── */
export function DesktopTopbar(){
  const{totalPoints,toggleSidebar,setScreen,viewMode,setViewMode}=useAppStore();const{play}=useSFX();
  const[showMenu,setShowMenu]=useState(false);
  const set=(m:'mobile'|'tablet'|'desktop')=>{play('click');setViewMode(m);document.body.className='mode-'+m+(useAppStore.getState().sidebarCollapsed?' sb-collapsed':'');setShowMenu(false);};
  return(<>
    <header className="desktop-topbar">
      <div className="dtb-brand-area">
        <motion.button className="dtb-ham" onClick={()=>{setShowMenu(!showMenu);play('click');}} whileHover={{scale:1.1}} whileTap={{scale:0.95}}>☰</motion.button>
        <span className="dtb-brand-name">🎓 P3 Smart Learning</span>
      </div>
      <input className="dtb-search" placeholder="🔍 Search…"/>
      <div className="dtb-actions">
        <div className="view-mode-indicator" style={{display:'flex',alignItems:'center',gap:8,paddingRight:8,borderRight:'1px solid rgba(255,255,255,.2)'}}>
          <span style={{fontSize:'.75rem',color:'rgba(255,255,255,.6)',fontWeight:600,textTransform:'uppercase'}}>
            {viewMode==='mobile'?'📱 Mobile':viewMode==='tablet'?'📟 Tablet':'🖥️ Desktop'}
          </span>
        </div>
        <button className="dtb-btn" onClick={()=>{setScreen('k-pick');play('click');}}>⚡ Kahoot</button>
        <button className="dtb-btn" onClick={()=>{setScreen('games');play('click');}}>🎮 Games</button>
        <span className="dtb-btn dtb-pts">⭐ {totalPoints} pts</span>
      </div>
    </header>
    <AnimatePresence>
      {showMenu&&<motion.div className="hamburger-menu" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>
        <div className="hmenu-section">
          <div className="hmenu-label">View Mode</div>
          {([['mobile','📱 Mobile'],['tablet','📟 Tablet'],['desktop','🖥️ Desktop']] as const).map(([m,lbl])=>(
            <motion.button key={m} className={`hmenu-item${viewMode===m?' active':''}`} onClick={()=>set(m)} whileHover={{x:6}} whileTap={{scale:.95}}>
              {lbl}
            </motion.button>
          ))}
        </div>
        <div className="hmenu-divider"/>
        <div className="hmenu-section">
          <div className="hmenu-label">Settings</div>
          <motion.button className="hmenu-item" onClick={()=>{setScreen('home');play('nav');setShowMenu(false);}} whileHover={{x:6}}>
            ⚙️ Settings
          </motion.button>
          <motion.button className="hmenu-item" onClick={()=>{setScreen('awards');play('nav');setShowMenu(false);}} whileHover={{x:6}}>
            🏆 Achievements
          </motion.button>
        </div>
      </motion.div>}
    </AnimatePresence>
  </>);
}

/* ─── DESKTOP SIDEBAR ─────────────────────────────── */
export function DesktopSidebar(){
  const{screen,setScreen,sidebarCollapsed,toggleSidebar}=useAppStore();const{play}=useSFX();
  const items=[{id:'home',icon:'🏠',lbl:'Home'},{id:'subjects',icon:'📚',lbl:'Subjects'},{id:'k-pick',icon:'⚡',lbl:'Kahoot'},{id:'games',icon:'🎮',lbl:'Games',badge:'NEW'},{id:'awards',icon:'🏆',lbl:'Awards'}];
  return(<motion.aside className="sidebar" animate={{width:sidebarCollapsed?64:256}} transition={{type:'spring',stiffness:300,damping:30}}>
    <div className="sb-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px clamp(8px,2vw,14px)',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
      {!sidebarCollapsed&&<span style={{fontFamily:"'Baloo 2',sans-serif",fontWeight:900,fontSize:'0.9rem',color:'var(--text)'}}>Menu</span>}
      <motion.button onClick={()=>{toggleSidebar();play('click');}} whileHover={{scale:1.1}} whileTap={{scale:0.95}} style={{marginLeft:'auto',background:'rgba(0,0,0,0.1)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 8px',color:'var(--text)',fontSize:'1.1rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {sidebarCollapsed?'→':'←'}
      </motion.button>
    </div>
    <div className="sb-nav">
      {items.map(i=>(<button key={i.id} className={`sb-item${screen===i.id?' active':''}`} onClick={()=>{setScreen(i.id as any);play('nav');}}>
        <div className="sb-icon">{i.icon}</div><span className="sb-label">{i.lbl}</span>{i.badge&&<span className="sb-badge">{i.badge}</span>}
      </button>))}
      <div className="sb-section-label" style={{marginTop:8}}>Subjects</div>
      {SUBJECTS.map(s=>(<button key={s.id} className="sb-item" onClick={()=>{useAppStore.setState({cbtSubject:s});setScreen('subj-detail');play('nav');}}>
        <div className="sb-icon">{s.icon}</div><span className="sb-label">{s.name}</span>
      </button>))}
    </div>
  </motion.aside>);
}

/* ─── SIZE SWITCHER (HIDDEN - Now in hamburger menu) ───────────────────────────────── */
// This component is no longer rendered directly
// View mode controls are now integrated into DesktopTopbar hamburger menu
export function SizeSwitcher(){
  // Component kept for backward compatibility but not rendered
  return null;
}

/* ─── SPLASH ──────────────────────────────────────── */
export function SplashScreen(){
  const{setScreen}=useAppStore();const{play,speak}=useSFX();const done=useRef(false);
  useEffect(()=>{if(done.current)return;done.current=true;play('splash');setTimeout(()=>speak('Welcome to P3 Smart Learning!',0.9,1.3),500);setTimeout(()=>setScreen('home'),2400);},[]);
  return(<div className="screen splash-screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:14,background:'linear-gradient(160deg,#005c38,#008751)'}}>
    <motion.span style={{fontSize:'5rem'}} animate={{y:[0,-12,0]}} transition={{repeat:Infinity,duration:2}}>🎓</motion.span>
    <motion.div style={{fontFamily:"'Baloo 2',sans-serif",fontSize:'2.2rem',fontWeight:900,color:'white'}} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.3}}>P3 Smart Learn</motion.div>
    <motion.div style={{color:'rgba(255,255,255,.75)',fontSize:'.95rem',fontWeight:600}} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:.5}}>Primary 3 · 3rd Term · Nigeria</motion.div>
    <div style={{width:160,height:4,background:'rgba(255,255,255,.2)',borderRadius:4,overflow:'hidden',marginTop:12}}>
      <motion.div style={{height:4,background:'#F5A623',borderRadius:4}} initial={{width:0}} animate={{width:'100%'}} transition={{duration:2.2}}/>
    </div>
    <motion.div style={{color:'rgba(255,255,255,.4)',fontSize:'.72rem',position:'absolute',bottom:24}} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1}}>v2.0 · Works Offline ✅</motion.div>
  </div>);
}

/* ─── HOME ────────────────────────────────────────── */
export function HomeScreen(){
  const{setScreen,totalPoints}=useAppStore();const{play}=useSFX();
  const totalQ=SUBJECTS.reduce((a,s)=>a+s.questions.length,0);
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="scroll-c pad" style={{paddingTop:16}}>
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={fadeUp} className="hero-banner">
          <div><h2>Good day! 👋</h2><p>Ready to learn something new?</p></div>
          <motion.span style={{fontSize:'3.5rem'}} animate={{rotate:[0,-10,10,-10,0]}} transition={{repeat:Infinity,repeatDelay:3,duration:.6}}>🧠</motion.span>
        </motion.div>
        <motion.div variants={fadeUp} className="stats-row">
          {[{n:SUBJECTS.length,l:'Subjects'},{n:totalQ,l:'Questions'},{n:totalPoints,l:'Points',gold:true}].map(s=>(
            <div key={s.l} className="stat-box"><div className="n" style={s.gold?{color:'var(--gold)'}:{}}>{s.n}</div><div className="l">{s.l}</div></div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} className="section-lbl">Quick Play</motion.div>
        <motion.div variants={fadeUp} className="quick-grid" style={{marginBottom:16}}>
          {[{icon:'⚡',l:'Kahoot Battle',s:'Fast-paced quiz',c:'linear-gradient(135deg,#e91e8c,#ad1457)',sc:'k-pick'},{icon:'📝',l:'CBT Exam',s:'Full exam mode',c:'linear-gradient(135deg,#008751,#005c38)',sc:'subjects'},{icon:'🎮',l:'Fun Games',s:'Play & learn',c:'linear-gradient(135deg,#e67e22,#c0392b)',sc:'games'},{icon:'🏆',l:'Awards',s:'Badges & progress',c:'linear-gradient(135deg,#1a5276,#2980b9)',sc:'awards'}].map(b=>(
            <motion.button key={b.l} className="quick-btn" style={{background:b.c}} onClick={()=>{play('click');setScreen(b.sc as any);}} whileHover={{scale:1.03}} whileTap={{scale:.95}}>
              <span className="qi">{b.icon}</span><span className="ql">{b.l}</span><span className="qs">{b.s}</span>
            </motion.button>
          ))}
        </motion.div>
        <motion.div variants={fadeUp} className="section-lbl">Subjects</motion.div>
        <motion.div variants={fadeUp} className="subjects-grid">
          {SUBJECTS.map(s=>(
            <motion.div key={s.id} className="subj-card" style={{background:s.grad}} onClick={()=>{play('click');useAppStore.setState({cbtSubject:s});setScreen('subj-detail');}} whileHover={{scale:1.03,y:-2}} whileTap={{scale:.97}}>
              <span className="subj-icon">{s.icon}</span><div className="subj-name">{s.name}</div>
              <div className="subj-count">{s.questions.length} questions</div><div className="subj-tag">{s.term}</div>
            </motion.div>
          ))}
        </motion.div>
        <div style={{height:16}}/>
      </motion.div>
    </div>
  </div>);
}

/* ─── SUBJECTS ────────────────────────────────────── */
export function SubjectsScreen(){
  const{setScreen,progress}=useAppStore();const{play}=useSFX();
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="app-header"><div style={{flex:1}}/><div className="hdr-title">📚 All Subjects</div><div style={{width:38}}/></div>
    <div className="scroll-c pad">
      <p style={{fontSize:'.8rem',color:'var(--soft)',marginBottom:14,fontWeight:600}}>Primary 3 · 3rd Term · Nigerian Curriculum</p>
      <motion.div className="subjects-grid" variants={stagger} initial="hidden" animate="show">
        {SUBJECTS.map(s=>{const done=progress[s.id]||0;const pct=Math.round(done/s.questions.length*100);return(
          <motion.div key={s.id} className="subj-card" style={{background:s.grad}} variants={fadeUp} onClick={()=>{play('click');useAppStore.setState({cbtSubject:s});setScreen('subj-detail');}} whileHover={{scale:1.03}} whileTap={{scale:.97}}>
            <span className="subj-icon">{s.icon}</span><div className="subj-name">{s.name}</div>
            <div className="subj-count">{s.questions.length} questions</div>
            {pct>0&&<div style={{width:'100%',background:'rgba(255,255,255,.2)',borderRadius:20,height:4}}><div style={{width:`${pct}%`,background:'white',height:4,borderRadius:20}}/></div>}
            <div className="subj-tag">{pct>0?`${pct}% done`:s.term}</div>
          </motion.div>
        );})}
      </motion.div>
    </div>
  </div>);
}

/* ─── SUBJECT DETAIL ──────────────────────────────── */
export function SubjectDetailScreen(){
  const{cbtSubject,setScreen,startCbt,progress}=useAppStore();const{play}=useSFX();
  const s=cbtSubject;if(!s)return null;
  const done=progress[s.id]||0;const pct=Math.round(done/s.questions.length*100);
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="app-header" style={{background:s.color}}>
      <button className="hdr-back" onClick={()=>{play('nav');setScreen('subjects');}}>‹</button>
      <div className="hdr-title">{s.icon} {s.name}</div><div style={{width:38}}/>
    </div>
    <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} style={{background:s.color,padding:'16px 20px',color:'white',flexShrink:0}}>
      <p style={{fontSize:'.82rem',opacity:.85,lineHeight:1.5}}>{s.description}</p>
      <div style={{marginTop:10,background:'rgba(255,255,255,.2)',borderRadius:20,height:6}}>
        <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.8}} style={{background:'white',height:6,borderRadius:20}}/>
      </div>
      <p style={{fontSize:'.78rem',marginTop:6,opacity:.8}}>{done}/{s.questions.length} completed · {pct}%</p>
    </motion.div>
    <div className="scroll-c pad">
      <div className="section-lbl" style={{marginTop:4}}>Choose Mode</div>
      {[{icon:'📝',l:'CBT Exam Mode',sub:'Answer all questions at your own pace. Instant step-by-step explanations.',c:s.grad,fn:()=>{play('start');startCbt(s);setScreen('cbt');}},{icon:'⚡',l:'Kahoot Speed Battle',sub:'Race the clock! 20 sec/question. Earn up to 1000 points!',c:'linear-gradient(135deg,#e91e8c,#ad1457)',fn:()=>{play('start');useAppStore.setState({kSubject:s});setScreen('k-lobby');}}].map(m=>(
        <motion.div key={m.l} className="card" style={{display:'flex',alignItems:'center',gap:16,cursor:'pointer',marginBottom:12}} onClick={m.fn} whileHover={{scale:1.02,boxShadow:'0 8px 24px rgba(0,0,0,.1)'}} whileTap={{scale:.98}}>
          <div style={{width:52,height:52,borderRadius:14,background:m.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0}}>{m.icon}</div>
          <div style={{flex:1}}><div style={{fontWeight:800,marginBottom:4}}>{m.l}</div><div style={{fontSize:'.8rem',color:'var(--soft)',lineHeight:1.4}}>{m.sub}</div></div>
          <span style={{color:'var(--soft)',fontSize:'1.2rem'}}>›</span>
        </motion.div>
      ))}
    </div>
  </div>);
}

/* ─── CBT ─────────────────────────────────────────── */
function ExpBox({q,ans}:{q:Question,ans:{correct:boolean;chosen?:number;given?:string}}){
  return(<motion.div className="exp-box" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <div className={`exp-hdr ${ans.correct?'ok':'no'}`}>{ans.correct?'✅ Correct! Great job! 🎉':"❌ Let's learn from this!"}</div>
    <div className={`exp-body ${ans.correct?'ok':'no'}`}>
      <div className="topic-pill"><strong>📚 Topic: {q.topic}</strong>{q.tip}</div>
      <div className="steps-lbl">📋 Step-by-Step</div>
      {q.steps.map((s,i)=>(<div key={i} className="step-row"><div className="step-n">{i+1}</div><div className="step-t">{s}</div></div>))}
      <div className="final-pill">🏆 {ans.correct?'Excellent!':'Correct: '+(q.type==='mcq'?q.options![q.answer as number]:q.answer)}</div>
    </div>
  </motion.div>);
}

export function CBTScreen(){
  const{cbtSubject,cbtQuestions:qs,cbtIndex:idx,cbtAnswers,cbtScore,setCbtIndex,setCbtAnswer,setScreen,earnPoints,saveProgress}=useAppStore();
  const{play,speak}=useSFX();const{msg,visible,show}=useToast();const[sv,setSv]=useState('');
  const q=qs[idx];const total=qs.length;const ans=q?cbtAnswers[q.id]:undefined;
  useEffect(()=>{setSv('');},[idx]);
  if(!cbtSubject||!q)return null;
  const doMCQ=(chosen:number)=>{if(ans!==undefined)return;const correct=chosen===(q.answer as number);setCbtAnswer(q.id,{chosen,correct});if(correct){play('correct');earnPoints(50);show('✅ Correct! +50 pts');speak('Correct! Well done!',1,1.3);}else{play('wrong');show(`❌ ${q.options![q.answer as number]} was correct`);speak('Not quite!',1,1.1);}saveProgress(cbtSubject.id,Object.keys(cbtAnswers).length+1);};
  const doShort=()=>{if(ans!==undefined||!sv.trim())return;const correct=checkAnswer(q.answer,sv,q.altAnswers);setCbtAnswer(q.id,{given:sv.trim(),correct});if(correct){play('correct');earnPoints(50);show('✅ Correct! +50 pts');speak('Correct!',1,1.3);}else{play('wrong');show(`❌ Answer: ${q.answer}`);speak(`The answer is ${q.answer}`,1,1.1);}saveProgress(cbtSubject.id,Object.keys(cbtAnswers).length+1);};
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="app-header" style={{background:cbtSubject.color}}>
      <button className="hdr-back" onClick={()=>{play('nav');setScreen('subj-detail');}}>‹</button>
      <div className="hdr-title">{cbtSubject.name}</div><div style={{width:38}}/>
    </div>
    <div className="cbt-pbar"><motion.div className="cbt-pfill" animate={{width:`${Math.round(idx/total*100)}%`}} transition={{duration:.4}}/></div>
    <div className="cbt-meta"><span className="cbt-ql">Q {idx+1} of {total}</span><span className="cbt-sb">Score: {cbtScore}</span></div>
    <div className="scroll-c pad">
      <AnimatePresence mode="wait">
        <motion.div key={`q${idx}`} initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-30}} transition={{duration:.2}}>
          <div className="q-card">
            <span className="topic-tag">{q.topic}</span>
            <div className="q-text">{q.text}</div>
            {q.svg&&<div className="q-img"><div dangerouslySetInnerHTML={{__html:q.svg}} style={{width:'100%'}}/><div className="q-img-cap">Study this diagram</div></div>}
            {q.type==='mcq'?(
              <div className="opts">{q.options!.map((opt,i)=>{let cls='opt';if(ans){if(i===q.answer)cls+=' ok';else if(ans.chosen===i)cls+=' no';}return(<motion.button key={i} className={cls} onClick={()=>doMCQ(i)} disabled={!!ans} whileHover={!ans?{scale:1.01}:{}} whileTap={!ans?{scale:.98}:{}}><span className="opt-l">{LETTERS[i]}</span><span>{opt}{ans&&i===q.answer?' ✓':''}{ans&&ans.chosen===i&&i!==q.answer?' ✗':''}</span></motion.button>);})}</div>
            ):(
              <div className="short-wrap">
                <input className={`short-in${ans?(ans.correct?' ok':' no'):''}`} placeholder="Type your answer…" value={ans?ans.given||'':sv} onChange={e=>setSv(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doShort()} disabled={!!ans}/>
                <button className="sub-btn" onClick={doShort} disabled={!!ans}>OK</button>
              </div>
            )}
            <AnimatePresence>{ans&&<ExpBox q={q} ans={ans}/>}</AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="cbt-nav">
      <button className="btn-prev" onClick={()=>{if(idx>0){play('click');setCbtIndex(idx-1);}}} disabled={idx===0}>‹ Prev</button>
      <div className="cbt-dots">{qs.map((_,i)=>{const a=cbtAnswers[qs[i].id];return<span key={i} style={{color:i===idx?'var(--text)':a?(a.correct?'var(--green)':'var(--red)'):'var(--soft)'}}>{i===idx?'●':a?(a.correct?'✓':'✗'):'○'}</span>;})}</div>
      <button className="btn-nxt" onClick={()=>{if(idx>=total-1){setScreen('cbt-results');}else{play('click');setCbtIndex(idx+1);document.querySelector('.scroll-c')?.scrollTo(0,0);}}}>{idx===total-1?'Finish 🎓':'Next ›'}</button>
    </div>
    <AnimatePresence>{visible&&<motion.div className="toast" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{msg}</motion.div>}</AnimatePresence>
  </div>);
}

export function CBTResultsScreen(){
  const{cbtQuestions,cbtScore,cbtSubject,startCbt,setScreen,earnPoints}=useAppStore();const{play,speak}=useSFX();const done=useRef(false);
  const total=cbtQuestions.length,pct=Math.round(cbtScore/total*100),pass=pct>=50;
  const grades=[['A',80,'🌟 Excellent!'],['B',65,'👏 Very Good!'],['C',50,'✅ Good! Passed!'],['D',40,'📖 Keep studying!'],['F',0,'💪 Try again!']] as const;
  const[grade,,msg]=grades.find(([,min])=>pct>=min)??grades[4];
  useEffect(()=>{if(done.current)return;done.current=true;if(pass){play('win');earnPoints(pct*2);launchConfetti('app-root');setTimeout(()=>speak(`Congratulations! You scored ${cbtScore} out of ${total}!`,1,1.3),400);}else{play('gameover');speak(`You scored ${cbtScore} out of ${total}. Keep practising!`,1,1.1);}},[]);
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="scroll-c">
      <motion.div initial={{opacity:0,scale:.95}} animate={{opacity:1,scale:1}} transition={{duration:.35}}>
        <div className={`res-hero ${pass?'pass':'fail'}`}>
          <motion.div className="big-score" initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:280,damping:18,delay:.2}}>{cbtScore}/{total}</motion.div>
          <div className="grade-badge">Grade {grade} · {pct}%</div><div className="grade-msg">{msg}</div>
        </div>
      </motion.div>
      <div className="res-stats">
        {[{n:cbtScore,l:'Correct',c:'var(--green)'},{n:total-cbtScore,l:'Wrong',c:'var(--red)'},{n:pct+'%',l:'Score',c:'var(--blue)'}].map((s,i)=>(
          <motion.div key={s.l} className="r-stat" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.1*i+.3}}>
            <div className="n" style={{color:s.c}}>{s.n}</div><div className="l">{s.l}</div>
          </motion.div>
        ))}
      </div>
      <div className="pad" style={{display:'grid',gap:10}}>
        <button className="btn btn-green" onClick={()=>{if(cbtSubject){play('start');startCbt(cbtSubject);setScreen('cbt');}}}>🔄 Try Again</button>
        <button className="btn btn-gray" onClick={()=>{play('nav');setScreen('home');}}>🏠 Back Home</button>
      </div>
    </div>
  </div>);
}

/* ─── KAHOOT ──────────────────────────────────────── */
export function KahootPickerScreen(){
  const{setScreen}=useAppStore();const{play}=useSFX();
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="app-header"><button className="hdr-back" onClick={()=>{play('nav');setScreen('home');}}>‹</button><div className="hdr-title">⚡ Choose Subject</div><div style={{width:38}}/></div>
    <div className="scroll-c pad">
      <p style={{fontSize:'.85rem',color:'var(--soft)',marginBottom:14,fontWeight:600,textAlign:'center'}}>Pick a subject to battle on! 🔥</p>
      <motion.div className="subjects-grid" variants={stagger} initial="hidden" animate="show">
        {SUBJECTS.map(s=>(<motion.div key={s.id} className="subj-card" style={{background:s.grad}} variants={fadeUp} onClick={()=>{play('click');useAppStore.setState({kSubject:s});setScreen('k-lobby');}} whileHover={{scale:1.03}} whileTap={{scale:.96}}><span className="subj-icon">{s.icon}</span><div className="subj-name">{s.name}</div><div className="subj-count">{s.questions.length} Qs</div></motion.div>))}
      </motion.div>
    </div>
  </div>);
}

export function KahootLobbyScreen(){
  const{kSubject,setScreen,startKahoot}=useAppStore();const{play}=useSFX();const s=kSubject;
  const begin=()=>{if(!s)return;play('start');const raw=shuffle(s.questions).slice(0,Math.min(10,s.questions.length));const qs:Question[]=raw.map(q=>{if(q.type==='short'){const opts=shuffle([String(q.answer),...makeFakes(String(q.answer),3)]);return{...q,type:'mcq' as const,options:opts,answer:opts.indexOf(String(q.answer))};}return q;});startKahoot(s,qs);setScreen('k-count');};
  if(!s)return null;
  return(<div className="screen" style={{position:'absolute',inset:0,background:'#1a1a2e',display:'flex',flexDirection:'column'}}>
    <div className="k-hdr"><button className="k-back" onClick={()=>{play('nav');setScreen('k-pick');}}>‹</button><span className="k-title">⚡ Kahoot Battle</span><div style={{width:36}}/></div>
    <div className="k-lobby-inner">
      <motion.span className="k-lobby-ico" animate={{y:[0,-10,0]}} transition={{repeat:Infinity,duration:2}}>{s.icon}</motion.span>
      <div className="k-lobby-ttl">{s.name}</div>
      <div className="k-lobby-sub">10 questions · 20 sec each · Speed bonus!</div>
      <div className="k-rules">
        {[['⏱️','20 seconds per question'],['🏆','Up to 1,000 points each'],['🔥','Streak bonus for consecutive correct'],['📖','Full explanation after each answer']].map(([i,t])=>(<div key={t} className="k-rule"><span>{i}</span><span>{t}</span></div>))}
      </div>
      <motion.button className="k-start-btn" onClick={begin} whileHover={{scale:1.04}} whileTap={{scale:.97}}>🚀 Start Game!</motion.button>
    </div>
  </div>);
}

export function KahootCountScreen(){
  const{setScreen}=useAppStore();const{play,speak}=useSFX();const[count,setCount]=useState(3);const done=useRef(false);
  useEffect(()=>{if(done.current)return;done.current=true;speak('Get ready! Game starts in 3!',1.1,1.3);const iv=setInterval(()=>setCount(p=>{const n=p-1;if(n<=0){clearInterval(iv);setTimeout(()=>setScreen('kahoot'),500);}else play('tick');return n;}),1000);return()=>clearInterval(iv);},[]);
  return(<div className="screen k-count-screen" style={{position:'absolute',inset:0,background:'#1a1a2e',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
    <AnimatePresence mode="wait"><motion.div key={count} className="count-n" initial={{scale:3,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.5,opacity:0}} transition={{duration:.5}}>{count>0?count:'🚀'}</motion.div></AnimatePresence>
    <div className="count-msg">Get Ready!</div>
  </div>);
}

export function KahootGameScreen(){
  const st=useAppStore();const{play,speak}=useSFX();const timerRef=useRef<any>();
  const q=st.kQuestions[st.kIndex];
  useEffect(()=>{
    if(!q)return;
    useAppStore.setState({kAnswered:false,kTimeLeft:20});
    speak(q.text,1,1.2);
    timerRef.current=setInterval(()=>{
      const cur=useAppStore.getState();
      const next=cur.kTimeLeft-1;
      if(next<=5&&next>0)play('urgent');else if(next>5)play('tick');
      if(next<=0){clearInterval(timerRef.current);if(!cur.kAnswered){st.setKAnswered(true);st.setKStreak(0);st.setKRevealData({correct:false,pts:0,chosen:-1});setTimeout(()=>st.setScreen('k-reveal'),300);play('timeout');speak('Time is up!',1.1,1.1);}return;}
      st.setKTimeLeft(next);
    },1000);
    return()=>clearInterval(timerRef.current);
  },[st.kIndex]);
  const ans=(chosen:number)=>{
    if(!q||st.kAnswered)return;clearInterval(timerRef.current);st.setKAnswered(true);
    const ok=chosen===(q.answer as number),tB=Math.round((st.kTimeLeft/20)*800),sB=st.kStreak*50,pts=ok?200+tB+sB:0;
    if(ok){st.setKScore(st.kScore+pts);st.setKStreak(st.kStreak+1);st.earnPoints(pts);play('correct');speak(`Correct! ${pts} points!`,1.2,1.3);}
    else{st.setKStreak(0);play('wrong');speak(`Wrong! Answer was ${q.options![q.answer as number]}`,1.1,1.1);}
    st.setKRevealData({correct:ok,pts,chosen});setTimeout(()=>st.setScreen('k-reveal'),700);
  };
  if(!q)return null;
  return(<div className="screen" style={{position:'absolute',inset:0,background:'#1a1a2e',display:'flex',flexDirection:'column'}}>
    <div className="k-hdr"><div style={{width:36}}/><span className="k-title">Question {st.kIndex+1} of {st.kQuestions.length}</span><span className="k-streak">🔥 {st.kStreak}</span></div>
    <div className="k-tbar"><motion.div className="k-tfill" animate={{width:`${(st.kTimeLeft/20)*100}%`}} transition={{duration:1,ease:'linear'}}/></div>
    <motion.div className="k-tnum" animate={{color:st.kTimeLeft<=5?'#e74c3c':'white'}}>{st.kTimeLeft}</motion.div>
    <div className="k-qbox"><div className="k-qnum-lbl">QUESTION {st.kIndex+1}</div><div className="k-qtext">{q.text}</div>{q.svg&&<div className="k-qimg" dangerouslySetInnerHTML={{__html:q.svg}}/>}</div>
    <div className="k-ans-grid">
      {q.options!.map((opt,i)=>(<motion.button key={i} className={`k-ans ${K_COLS[i]}`} onClick={()=>ans(i)} disabled={st.kAnswered} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*.08}} whileHover={!st.kAnswered?{scale:1.03}:{}} whileTap={!st.kAnswered?{scale:.93}:{}}><span className="k-shape">{K_SHAPES[i]}</span><span>{opt}</span></motion.button>))}
    </div>
  </div>);
}

export function KahootRevealScreen(){
  const{kQuestions,kIndex,kRevealData,setScreen,setKIndex}=useAppStore();const{play}=useSFX();
  const q=kQuestions[kIndex];const d=kRevealData;
  const next=()=>{play('click');if(kIndex>=kQuestions.length-1)setScreen('k-results');else{setKIndex(kIndex+1);setScreen('kahoot');}};
  if(!q||!d)return null;
  return(<div className="screen" style={{position:'absolute',inset:0,background:'#1a1a2e',display:'flex',flexDirection:'column'}}>
    <div className="k-hdr"><div style={{width:36}}/><span className="k-title">Question {kIndex+1} of {kQuestions.length}</span><div style={{width:60}}/></div>
    <div className="k-reveal-scroll">
      <motion.div className="k-rev-icon" initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:260,damping:18}}>{d.chosen===-1?'⏰':d.correct?'✅':'❌'}</motion.div>
      <motion.div className="k-rev-status" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.15}}>
        <div className="k-rev-msg">{d.chosen===-1?"Time's up! ⏰":d.correct?'Correct! 🎉':`Answer: ${q.options![q.answer as number]}`}</div>
        <motion.div className="k-rev-pts" style={{color:d.correct?'#FFD700':'#e74c3c'}} initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:.25}}>{d.correct?`+${d.pts} pts`:'0 pts'}</motion.div>
      </motion.div>
      <motion.div className="k-rev-ans" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.3}}>
        <div className="k-rev-ans-lbl">💡 Explanation</div>
        <div className="k-rev-topic">📚 {q.topic}: {q.tip}</div>
        <div className="k-rev-steps">{q.steps.map((s,i)=>(<motion.div key={i} className="k-rev-step" initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:.35+i*.08}}><div className="k-rev-step-n">{i+1}</div><span>{s}</span></motion.div>))}</div>
      </motion.div>
    </div>
    <motion.button className="k-rev-next" onClick={next} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.5}} whileHover={{scale:1.02}} whileTap={{scale:.97}}>{kIndex>=kQuestions.length-1?'🏆 See Results':'Next Question →'}</motion.button>
  </div>);
}

export function KahootResultsScreen(){
  const{kSubject,kScore,setScreen,kahootBest,setKahootBest,startKahoot}=useAppStore();const{play,speak}=useSFX();const done=useRef(false);
  useEffect(()=>{if(done.current||!kSubject)return;done.current=true;const prev=kahootBest[kSubject.id]||0;if(kScore>prev)setKahootBest(kSubject.id,kScore);play('win');launchConfetti('app-root');speak(`Game over! You scored ${kScore} points!`,1,1.2);},[]);
  if(!kSubject)return null;
  const bots=[{name:'🤖 EduBot',score:Math.round(kScore*(.5+Math.random()*.6))},{name:'🤖 QuizKid',score:Math.round(kScore*(.3+Math.random()*.7))}];
  const all=[{name:'⭐ You',score:kScore},...bots].sort((a,b)=>b.score-a.score);
  const po=[all[1],all[0],all[2]].filter(Boolean),pCls=['p2','p1','p3'],pEm=['🥈','🥇','🥉'];
  return(<div className="screen" style={{position:'absolute',inset:0,background:'linear-gradient(160deg,#1a1a2e,#2c1654)',display:'flex',flexDirection:'column'}}>
    <div className="scroll-c">
      <motion.div className="k-res-hero" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}><h2>🏆 Game Over!</h2><p>You scored {kScore} points in {kSubject.name}!</p></motion.div>
      <div className="podium-row">{po.map((p,i)=>(<motion.div key={p.name} className={`podium ${pCls[i]}`} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.1*i+.2}}><div className="podium-nm">{p.name}</div><div className="podium-sc">{p.score}</div><div className="podium-blk">{pEm[i]}</div></motion.div>))}</div>
      <div className="k-scorelist">{all.map((p,i)=>(<motion.div key={p.name} className="k-si" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:.05*i+.4}}><div className="k-si-rank">{i+1}</div><div className="k-si-name">{p.name}</div><div className="k-si-pts">{p.score} pts</div></motion.div>))}</div>
      <div style={{padding:'0 16px',display:'grid',gap:10}}>
        <button className="k-play-again" onClick={()=>{play('start');const raw=shuffle(kSubject.questions).slice(0,10);const qs=raw.map(q=>q.type==='short'?{...q,type:'mcq' as const,options:shuffle([String(q.answer),...makeFakes(String(q.answer),3)]),answer:0}:q);startKahoot(kSubject,qs);setScreen('k-count');}}>⚡ Play Again</button>
        <button className="k-play-again" style={{background:'rgba(255,255,255,.1)',color:'white',border:'1px solid rgba(255,255,255,.15)'}} onClick={()=>{play('nav');setScreen('home');}}>🏠 Home</button>
      </div>
      <div style={{height:16}}/>
    </div>
  </div>);
}

/* ─── GAMES HUB ───────────────────────────────────── */
export function GamesScreen(){
  const{setScreen}=useAppStore();const{play}=useSFX();
  const games=[{icon:'🃏',name:'Memory Match',desc:'Flip cards to find matching pairs!',c:'linear-gradient(135deg,#e91e8c,#9c27b0)',sc:'memory'},{icon:'🎯',name:'Number Blaster',desc:'Pick the right answer before time runs out!',c:'linear-gradient(135deg,#e67e22,#c0392b)',sc:'blaster'},{icon:'🔤',name:'Word Scramble',desc:'Unscramble the mixed-up letters!',c:'linear-gradient(135deg,#1368ce,#0d47a1)',sc:'scramble'},{icon:'🍕',name:'Fraction Frenzy',desc:'Match fractions to the right bar!',c:'linear-gradient(135deg,#005c38,#008751)',sc:'fractions-game'},{icon:'🪢',name:'Tug of War',desc:'Math battles! Pull the rope with correct answers!',c:'linear-gradient(135deg,#1565C0,#C62828)',sc:'tug-of-war',badge:'NEW'}];
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="app-header"><button className="hdr-back" onClick={()=>{play('nav');setScreen('home');}}>‹</button><div className="hdr-title">🎮 Fun Games</div><div style={{width:38}}/></div>
    <div className="scroll-c">
      <p style={{padding:'12px 16px 0',fontSize:'.82rem',color:'var(--soft)',fontWeight:600}}>Learn while you play! 🌟</p>
      <motion.div className="games-grid" variants={stagger} initial="hidden" animate="show">
        {games.map(g=>(<motion.div key={g.name} className="game-card" style={{background:g.c,position:'relative'}} variants={fadeUp} onClick={()=>{play('click');setScreen(g.sc as any);}} whileHover={{scale:1.04,y:-3}} whileTap={{scale:.96}}>{'badge' in g&&(g as any).badge&&<span style={{position:'absolute',top:8,right:8,background:'#F5A623',color:'#1a1a2e',fontSize:'.6rem',fontWeight:900,borderRadius:6,padding:'2px 7px',letterSpacing:'.04em'}}>{(g as any).badge}</span>}<span className="gc-icon">{g.icon}</span><div className="gc-name">{g.name}</div><div className="gc-desc">{g.desc}</div></motion.div>))}
      </motion.div>
    </div>
  </div>);
}

/* ─── MEMORY GAME ─────────────────────────────────── */
const EMOJIS=['🍎','🌟','🎯','📚','🔬','🌍','⚡','🎮','🎓','🏆','🌙','💡','🦁','🐘','🌈','🎸'];
interface MC{id:number;emoji:string;flipped:boolean;matched:boolean;}
export function MemoryScreen(){
  const{setScreen,earnPoints}=useAppStore();const{play}=useSFX();
  const[cards,setCards]=useState<MC[]>([]);const[flipped,setFlipped]=useState<number[]>([]);
  const[matched,setMatched]=useState(0);const[moves,setMoves]=useState(0);const[secs,setSecs]=useState(0);const[go,setGo]=useState(false);
  const lockRef=useRef(false);const timerRef=useRef<any>();
  const init=useCallback(()=>{const p=EMOJIS.slice(0,8);setCards(shuffle([...p,...p]).map((e,i)=>({id:i,emoji:e,flipped:false,matched:false})));setFlipped([]);setMatched(0);setMoves(0);setSecs(0);setGo(false);lockRef.current=false;clearInterval(timerRef.current);timerRef.current=setInterval(()=>setSecs(s=>s+1),1000);},[]);
  useEffect(()=>{init();return()=>clearInterval(timerRef.current);},[]);
  const flip=(id:number)=>{
    if(lockRef.current)return;
    setCards(prev=>{const c=prev[id];if(c.flipped||c.matched||flipped.length>=2)return prev;play('flip');const nxt=[...prev];nxt[id]={...c,flipped:true};
      const nf=[...flipped,id];setFlipped(nf);
      if(nf.length===2){
        lockRef.current=true;setMoves(m=>m+1);const[a,b]=nf;
        if(prev[a].emoji===prev[b].emoji){
          play('match');earnPoints(100);const nn=[...nxt];nn[a]={...nn[a],matched:true};nn[b]={...nn[b],matched:true};
          const nm=matched+1;setMatched(nm);setFlipped([]);lockRef.current=false;
          if(nm===8){clearInterval(timerRef.current);play('win');earnPoints(500);setTimeout(()=>setGo(true),600);}
          return nn;
        }else{
          setTimeout(()=>{setCards(p2=>{const n2=[...p2];n2[a]={...n2[a],flipped:false};n2[b]={...n2[b],flipped:false};return n2;});setFlipped([]);lockRef.current=false;play('wrong');},900);
        }
      }else setFlipped(nf);
      return nxt;
    });
  };
  return(<div className="screen mem-screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'#1a1a2e'}}>
    <div className="k-hdr"><button className="k-back" onClick={()=>{play('nav');setScreen('games');}}>‹</button><span className="k-title">🃏 Memory Match</span><span className="k-streak">{matched}/8 pairs</span></div>
    <div className="mem-stats"><div className="mem-stat">Moves: {moves}</div><div className="mem-stat">⏱ {secs}s</div><div className="mem-stat">⭐ {matched*100}</div></div>
    <div className="mem-grid g4" style={{flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch' as any}}>
      {cards.map(c=>(<div key={c.id} className="mem-card" onClick={()=>flip(c.id)}>
        <motion.div className="mem-card-inner" animate={{rotateY:c.flipped||c.matched?180:0}} transition={{duration:.38}}>
          <div className="mem-face mem-front">❓</div>
          <div className={`mem-face mem-back${c.matched?' matched':''}`}>{c.emoji}</div>
        </motion.div>
      </div>))}
    </div>
    <AnimatePresence>{go&&(<motion.div className="go-overlay" initial={{opacity:0}} animate={{opacity:1}}><div className="go-icon">🏆</div><div className="go-title">All Matched!</div><div className="go-score">+{matched*100+500} pts</div><div className="go-msg">{moves} moves · {secs} seconds</div><div className="go-btns"><button className="go-btn go-retry" onClick={init}>🔄 Play Again</button><button className="go-btn go-home" onClick={()=>{play('nav');setScreen('games');}}>🎮 Games</button></div></motion.div>)}</AnimatePresence>
  </div>);
}

/* ─── NUMBER BLASTER ──────────────────────────────── */
type BT={topic:string;q:(a:number,b:number)=>string;ans:(a:number,b:number)=>number;gen:()=>[number,number];};
const BTS:BT[]=[{topic:'Multiplication',q:(a,b)=>`${a} × ${b} = ?`,ans:(a,b)=>a*b,gen:()=>[2+Math.floor(Math.random()*9),2+Math.floor(Math.random()*9)]},{topic:'Division',q:(a,b)=>`${a*b} ÷ ${a} = ?`,ans:(_,b)=>b,gen:()=>[2+Math.floor(Math.random()*9),2+Math.floor(Math.random()*9)]},{topic:'Addition',q:(a,b)=>`${a} + ${b} = ?`,ans:(a,b)=>a+b,gen:()=>[10+Math.floor(Math.random()*50),5+Math.floor(Math.random()*40)]},{topic:'Subtraction',q:(a,b)=>`${a+b} − ${a} = ?`,ans:(_,b)=>b,gen:()=>[10+Math.floor(Math.random()*40),5+Math.floor(Math.random()*30)]}];
export function BlasterScreen(){
  const{setScreen,earnPoints}=useAppStore();const{play}=useSFX();
  const[score,setScore]=useState(0);const[lives,setLives]=useState(3);const[streak,setStreak]=useState(0);const[tl,setTl]=useState(60);const[go,setGo]=useState(false);
  const[q,setQ]=useState<{topic:string;question:string;correct:number;opts:number[]}|null>(null);
  const timerRef=useRef<any>();
  const nextQ=useCallback(()=>{const t=BTS[Math.floor(Math.random()*BTS.length)];const[a,b]=t.gen();const c=t.ans(a,b);const w=new Set<number>();while(w.size<3){const x=c+Math.ceil((Math.random()-.5)*20);if(x!==c&&x>0)w.add(x);}setQ({topic:t.topic,question:t.q(a,b),correct:c,opts:shuffle([c,...w]) as number[]});},[]);
  const init=useCallback(()=>{setScore(0);setLives(3);setStreak(0);setTl(60);setGo(false);clearInterval(timerRef.current);timerRef.current=setInterval(()=>setTl(t=>{if(t<=1){clearInterval(timerRef.current);setGo(true);play('gameover');return 0;}if(t<=10)play('urgent');return t-1;}),1000);nextQ();},[nextQ]);
  useEffect(()=>{init();return()=>clearInterval(timerRef.current);},[]);
  const pick=(v:number)=>{if(!q||go)return;if(v===q.correct){play('correct');earnPoints(50);setScore(s=>s+100+streak*20);setStreak(s=>s+1);setTimeout(nextQ,250);}else{play('wrong');setStreak(0);setLives(l=>{if(l-1<=0){setTimeout(()=>{clearInterval(timerRef.current);setGo(true);play('gameover');},300);}return l-1;});setTimeout(nextQ,500);}};
  const COLS=['#e8254c','#1368ce','#d89e00','#26890c'];
  return(<div className="screen blast-screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column'}}>
    <div className="k-hdr"><button className="k-back" onClick={()=>{play('nav');setScreen('games');}}>‹</button><span className="k-title">🎯 Number Blaster</span><span className="k-streak">🔥 {streak}</span></div>
    <div className="blast-hud"><div className="blast-hud-item">Score: {score}</div><div className="blast-hud-item" style={{color:tl<=10?'#e74c3c':'white'}}>⏱ {tl}s</div><div className="blast-hud-item">{'❤️'.repeat(lives)}{'🖤'.repeat(3-lives)}</div></div>
    <div className="blast-display"><div className="blast-topic">{q?.topic.toUpperCase()}</div>
      <AnimatePresence mode="wait"><motion.div key={q?.question} className="blast-q" initial={{scale:.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:1.1,opacity:0}} transition={{duration:.18}}>{q?.question}</motion.div></AnimatePresence>
    </div>
    <div className="blast-opts">{q?.opts.map((o,i)=>(<motion.button key={`${q.question}-${i}`} className="blast-opt" style={{background:COLS[i]}} onClick={()=>pick(o)} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.06}} whileTap={{scale:.92}}>{o}</motion.button>))}</div>
    <AnimatePresence>{go&&(<motion.div className="go-overlay" initial={{opacity:0}} animate={{opacity:1}}><div className="go-icon">🎯</div><div className="go-title">Game Over!</div><div className="go-score">+{score} pts</div><div className="go-msg">Best streak: {streak}</div><div className="go-btns"><button className="go-btn go-retry" onClick={init}>🔄 Play Again</button><button className="go-btn go-home" onClick={()=>{play('nav');setScreen('games');}}>🎮 Games</button></div></motion.div>)}</AnimatePresence>
  </div>);
}

/* ─── WORD SCRAMBLE ───────────────────────────────── */
const WORDS=[{word:'fraction',hint:'Part of a whole number',subj:'Maths'},{word:'multiply',hint:'Find the product of two numbers',subj:'Maths'},{word:'perimeter',hint:'Distance around a shape',subj:'Maths'},{word:'grammar',hint:'Rules of a language',subj:'English'},{word:'adjective',hint:'Word that describes a noun',subj:'English'},{word:'sentence',hint:'Group of words that makes sense',subj:'English'},{word:'mammal',hint:'Animal that feeds young with milk',subj:'Science'},{word:'reptile',hint:'Cold-blooded scaly animal',subj:'Science'},{word:'chlorophyll',hint:'Green substance in leaves',subj:'Science'},{word:'nigeria',hint:'The Giant of Africa',subj:'Social'},{word:'community',hint:'Group of people in same area',subj:'Social'},{word:'citizen',hint:'Member of a country',subj:'Social'}];
export function ScrambleScreen(){
  const{setScreen,earnPoints}=useAppStore();const{play,speak}=useSFX();
  const[pool]=useState(()=>shuffle(WORDS).slice(0,8));
  const[idx,setIdx]=useState(0);const[score,setScore]=useState(0);const[go,setGo]=useState(false);
  const[sh,setSh]=useState<string[]>([]);const[placed,setPlaced]=useState<(string|null)[]>([]);const[used,setUsed]=useState<boolean[]>([]);const[ok,setOk]=useState<boolean|null>(null);
  const init2=useCallback((i:number)=>{if(i>=pool.length){setGo(true);play('win');earnPoints(500);speak('You completed Word Scramble! Excellent!',1,1.3);return;}const w=pool[i];const s=shuffle(w.word.split(''));setSh(s);setPlaced(Array(w.word.length).fill(null));setUsed(Array(s.length).fill(false));setOk(null);speak(w.hint,1,1.1);},[pool]);
  useEffect(()=>{init2(0);},[]);
  const addL=(si:number)=>{if(used[si])return;const e=placed.findIndex(x=>x===null);if(e===-1)return;play('type');const np=[...placed];np[e]=sh[si];const nu=[...used];nu[si]=true;setPlaced(np);setUsed(nu);};
  const remS=(si:number)=>{if(!placed[si])return;play('type');const l=placed[si]!;const np=[...placed];np[si]=null;setPlaced(np);const li=sh.findIndex((x,i)=>x===l&&used[i]);if(li>=0){const nu=[...used];nu[li]=false;setUsed(nu);}};
  const clear=()=>{play('click');setPlaced(Array(pool[idx].word.length).fill(null));setUsed(Array(sh.length).fill(false));};
  const check=()=>{const a=placed.join('').toLowerCase();if(a===pool[idx].word.toLowerCase()){play('correct');earnPoints(150);setScore(s=>s+150);setOk(true);speak(`Correct! The word is ${pool[idx].word}!`,1,1.3);setTimeout(()=>{setIdx(i=>i+1);init2(idx+1);},1300);}else{play('wrong');setOk(false);speak('Not quite! Try again.',1,1.1);setTimeout(()=>{setOk(null);clear();},900);}};
  const w=pool[idx];
  return(<div className="screen scram-screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column'}}>
    <div className="k-hdr"><button className="k-back" onClick={()=>{play('nav');setScreen('games');}}>‹</button><span className="k-title">🔤 Word Scramble</span><span className="k-streak">⭐ {score}</span></div>
    <div className="scram-scroll">
      {!go&&w&&(<>
        <motion.div className="scram-hint" key={idx} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
          <div className="scram-hint-lbl">{idx+1}/{pool.length} · {w.subj}</div>
          <div className="scram-hint-text">💡 {w.hint}</div>
        </motion.div>
        <div className="scram-lbl">Answer — tap slot to remove:</div>
        <div className="scram-slots">
          {placed.map((l,i)=>(<motion.div key={i} className={`scram-slot${l?' filled':''}${ok===true?' glow':''}`} onClick={()=>remS(i)} animate={ok===false?{x:[-6,6,-6,6,0]}:{}} transition={{duration:.4}}>{l?.toUpperCase()}</motion.div>))}
        </div>
        <div className="scram-lbl">Letters — tap to place:</div>
        <div className="scram-letters">
          {sh.map((l,i)=>(<motion.div key={i} className={`scram-letter${used[i]?' used':''}`} onClick={()=>addL(i)} whileTap={{scale:.88}}>{l.toUpperCase()}</motion.div>))}
        </div>
        <div className="scram-btns">
          <button className="scram-check" onClick={check} disabled={placed.includes(null)}>✅ Check</button>
          <button className="scram-clear" onClick={clear}>🔄 Clear</button>
        </div>
      </>)}
    </div>
    <AnimatePresence>{go&&(<motion.div className="go-overlay" initial={{opacity:0}} animate={{opacity:1}}><div className="go-icon">🔤</div><div className="go-title">All Words!</div><div className="go-score">+{score+500} pts</div><div className="go-msg">All {pool.length} words unscrambled!</div><div className="go-btns"><button className="go-btn go-retry" onClick={()=>{setIdx(0);setScore(0);setGo(false);init2(0);}}>🔄 Again</button><button className="go-btn go-home" onClick={()=>{play('nav');setScreen('games');}}>🎮 Games</button></div></motion.div>)}</AnimatePresence>
  </div>);
}

/* ─── FRACTION FRENZY ─────────────────────────────── */
const FRS=[{q:'Which bar is the SHORTEST?',fracs:['1/2','1/4','1/8','3/4'],correct:'1/8',bars:{'1/2':50,'1/4':25,'1/8':12.5,'3/4':75}},{q:'Which fraction equals 1/2?',fracs:['2/6','3/6','4/6','1/4'],correct:'3/6',bars:{'2/6':33,'3/6':50,'4/6':67,'1/4':25}},{q:'Which fraction is MORE than a half?',fracs:['1/4','1/3','2/3','1/8'],correct:'2/3',bars:{'1/4':25,'1/3':33,'2/3':67,'1/8':12.5}},{q:'Which fraction is BETWEEN 1/4 and 3/4?',fracs:['1/8','1/2','7/8','1/4'],correct:'1/2',bars:{'1/8':12.5,'1/2':50,'7/8':87.5,'1/4':25}},{q:'Which fraction equals 2/4?',fracs:['1/2','1/3','3/4','2/3'],correct:'1/2',bars:{'1/2':50,'1/3':33,'3/4':75,'2/3':67}}];
export function FractionsGameScreen(){
  const{setScreen,earnPoints}=useAppStore();const{play,speak}=useSFX();
  const[ri,setRi]=useState(0);const[score,setScore]=useState(0);const[picked,setPicked]=useState<string|null>(null);const[go,setGo]=useState(false);
  useEffect(()=>{speak('Fraction Frenzy! Look at the bars!',1,1.2);},[]);
  useEffect(()=>{if(FRS[ri])speak(FRS[ri].q,1,1.2);},[ri]);
  const pick=(v:string)=>{if(picked)return;setPicked(v);const r=FRS[ri];if(v===r.correct){play('correct');earnPoints(150);setScore(s=>s+150);speak(`Correct! ${v} is right!`,1.1,1.3);setTimeout(()=>{setPicked(null);if(ri>=FRS.length-1){setGo(true);play('win');earnPoints(500);}else setRi(i=>i+1);},1300);}else{play('wrong');speak(`Not quite. Answer is ${r.correct}`,1,1.1);setTimeout(()=>{setPicked(null);if(ri<FRS.length-1)setRi(i=>i+1);else{setGo(true);play('win');}},1600);}};
  const r=FRS[ri];
  return(<div className="screen frac-screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column'}}>
    <div className="k-hdr"><button className="k-back" onClick={()=>{play('nav');setScreen('games');}}>‹</button><span className="k-title">🍕 Fraction Frenzy</span><span className="k-streak">⭐ {score}</span></div>
    <div className="frac-scroll">
      {!go&&r&&(<>
        <motion.div className="frac-title" key={ri} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>Round {ri+1} of {FRS.length}</motion.div>
        <div className="frac-sub">{r.q}</div>
        <div className="frac-bars" style={{width:'100%'}}>
          {r.fracs.map(f=>{const pct=r.bars[f as keyof typeof r.bars]??50;return(<div key={f} className="frac-bar-row"><div className="frac-bar-lbl">{f}</div><div className="frac-bar-track"><motion.div className="frac-bar-fill" initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.6,ease:'easeOut',delay:.2}}/></div></div>);})}
        </div>
        <div style={{color:'rgba(255,255,255,.7)',fontSize:'.82rem',fontWeight:700}}>Tap the correct fraction:</div>
        <div className="frac-opts">
          {r.fracs.map(f=>{let cls='frac-chip';if(picked===f)cls+=f===r.correct?' ok':' no';return(<motion.button key={f} className={cls} onClick={()=>pick(f)} disabled={!!picked} whileHover={{scale:1.06}} whileTap={{scale:.93}}>{f}</motion.button>);})}
        </div>
      </>)}
    </div>
    <AnimatePresence>{go&&(<motion.div className="go-overlay" initial={{opacity:0}} animate={{opacity:1}}><div className="go-icon">🍕</div><div className="go-title">Frenzy Complete!</div><div className="go-score">+{score+500} pts</div><div className="go-msg">All {FRS.length} rounds done!</div><div className="go-btns"><button className="go-btn go-retry" onClick={()=>{setRi(0);setScore(0);setGo(false);setPicked(null);}}>🔄 Again</button><button className="go-btn go-home" onClick={()=>{play('nav');setScreen('games');}}>🎮 Games</button></div></motion.div>)}</AnimatePresence>
  </div>);
}

/* ─── AWARDS ──────────────────────────────────────── */
const BADGES=[{id:'first_win',icon:'🥇',name:'First Win',desc:'Score 50%+ on any exam',pts:100},{id:'math_star',icon:'📐',name:'Maths Star',desc:'Complete Maths CBT',pts:200},{id:'eng_star',icon:'📖',name:'English Star',desc:'Complete English CBT',pts:200},{id:'sci_star',icon:'🔬',name:'Science Star',desc:'Complete Science CBT',pts:200},{id:'soc_star',icon:'🌍',name:'Social Star',desc:'Complete Social Studies',pts:200},{id:'kahoot_ace',icon:'⚡',name:'Kahoot Ace',desc:'Score 3000+ in Kahoot',pts:300},{id:'streak_5',icon:'🔥',name:'Hot Streak',desc:'5 correct in a row',pts:150},{id:'perfect',icon:'💎',name:'Perfect Score',desc:'100% on any exam',pts:500},{id:'memory_master',icon:'🃏',name:'Memory Master',desc:'Complete Memory Match',pts:300},{id:'all_subjects',icon:'🌟',name:'All Subjects',desc:'Complete all 4 CBTs',pts:1000}];
export function AwardsScreen(){
  const{totalPoints,progress,badges}=useAppStore();
  return(<div className="screen" style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',background:'var(--bg)'}}>
    <div className="scroll-c">
      <motion.div className="aw-header" initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        <motion.div className="aw-avatar" animate={{rotate:[0,5,-5,0]}} transition={{repeat:Infinity,repeatDelay:4,duration:.6}}>🎓</motion.div>
        <div className="aw-name">Super Learner</div><div className="aw-pts">{totalPoints} points earned</div>
      </motion.div>
      <div className="pad">
        <div className="section-lbl">🏅 Badges</div>
        <motion.div className="badges-grid" variants={stagger} initial="hidden" animate="show">
          {BADGES.map(b=>(<motion.div key={b.id} className={`badge-box${badges.includes(b.id)?'':' locked'}`} variants={fadeUp}><span className="bi">{b.icon}</span><div className="bn">{b.name}</div><div className="bp">{badges.includes(b.id)?`✓ +${b.pts} pts`:b.desc}</div></motion.div>))}
        </motion.div>
        <div className="section-lbl">📊 Progress</div>
        <div className="prog-list">
          {SUBJECTS.map((s,i)=>{const done=progress[s.id]||0,pct=Math.round(done/s.questions.length*100);return(<motion.div key={s.id} className="prog-item" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:.08*i}}><span className="prog-icon">{s.icon}</span><div className="prog-info"><div className="prog-name">{s.name}</div><div className="prog-bar-w"><motion.div className="prog-bar-f" initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.8,delay:.1*i}} style={{background:s.color}}/></div><div className="prog-pct">{done}/{s.questions.length} · {pct}%</div></div></motion.div>);})}
        </div>
        <div style={{height:16}}/>
      </div>
    </div>
  </div>);
}

/* ─── TUG OF WAR SCREEN ───────────────────────────── */
export function TugOfWarScreen(){
  const{setScreen,earnPoints}=useAppStore();const{play}=useSFX();
  return(
    <div style={{position:'absolute',inset:0,zIndex:10}}>
      <TugOfWarGame
        onExit={()=>{play('nav');setScreen('games');}}
        onGameComplete={(_result:any)=>{ earnPoints(200); }}
      />
    </div>
  );
}
