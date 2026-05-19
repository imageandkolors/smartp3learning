import { useState, useEffect, useRef, useCallback } from 'react';

export function useToast(){
  const [msg,setMsg]=useState('');const[visible,setVisible]=useState(false);const t=useRef<any>();
  const show=useCallback((m:string,ms=2400)=>{setMsg(m);setVisible(true);clearTimeout(t.current);t.current=setTimeout(()=>setVisible(false),ms);},[]);
  return{msg,visible,show};
}
export function useClock(){
  const fmt=()=>{const n=new Date();return`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;};
  const[time,setTime]=useState(fmt);
  useEffect(()=>{const iv=setInterval(()=>setTime(fmt()),15000);return()=>clearInterval(iv);},[]);
  return time;
}
export function checkAnswer(answer:string|number,given:string,altAnswers?:string[]):boolean{
  const g=given.trim().toLowerCase();
  if(g===String(answer).toLowerCase())return true;
  return altAnswers?.some(a=>a.toLowerCase()===g)??false;
}
export function shuffle<T>(arr:T[]):T[]{return[...arr].sort(()=>Math.random()-.5);}
export function makeFakes(correct:string,n:number):string[]{
  const nums=['2','3','4','5','6','7','8','9','10','12','15','16','18','20','24','25','27','30','36','40','45','48','50','54','56','60','64','72','80','90','100'];
  const words=['played','leaves','children','modern','joyful','ran','wide','reptile','chlorophyll','solid','carbohydrates','beautiful','mammal'];
  const isNum=!isNaN(parseInt(correct));
  return shuffle((isNum?nums:words).filter(x=>x.toLowerCase()!==correct.toLowerCase())).slice(0,n);
}
export function launchConfetti(pid='root'){
  const p=document.getElementById(pid)||document.getElementById('root')||document.body;
  const cols=['#008751','#F5A623','#e74c3c','#2980b9','#8e44ad','#e67e22','#FFD700'];
  for(let i=0;i<55;i++){
    const c=document.createElement('div');
    const dur=1.5+Math.random(),dx=(Math.random()-.5)*240;
    c.style.cssText=`left:${Math.random()*100}%;top:-14px;width:${6+Math.random()*9}px;height:${6+Math.random()*9}px;background:${cols[i%7]};border-radius:${Math.random()>.5?'50%':'2px'};position:absolute;z-index:999;pointer-events:none;animation:confetti-fall ${dur}s ease-in ${Math.random()*.6}s forwards;--dx:${dx}px;`;
    p.appendChild(c);
    setTimeout(()=>c.remove(),(dur+.7)*1000);
  }
}
// inject keyframe once
if(!document.getElementById('cf-style')){
  const s=document.createElement('style');s.id='cf-style';
  s.textContent='@keyframes confetti-fall{0%{transform:translate(0,0) rotate(0deg);opacity:1}100%{transform:translate(var(--dx),110vh) rotate(720deg);opacity:0}}';
  document.head.appendChild(s);
}
