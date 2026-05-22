// useSFX.ts
import { useCallback } from 'react';
let _ctx: AudioContext|null=null;
const getCtx=()=>{if(!_ctx)try{_ctx=new((window as any).AudioContext||(window as any).webkitAudioContext)();}catch{}return _ctx;};
function tone(freq:number,type:OscillatorType,dur:number,vol=0.3,delay=0){const c=getCtx();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type=type;o.frequency.setValueAtTime(freq,c.currentTime+delay);g.gain.setValueAtTime(vol,c.currentTime+delay);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+delay+dur);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+dur+0.05);}

// Noise burst for variety
function noise(dur:number,vol=0.2,delay=0){const c=getCtx();if(!c)return;const b=c.createBufferSource(),buf=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),g=c.createGain();const arr=buf.getChannelData(0);for(let i=0;i<buf.length;i++)arr[i]=Math.random()*2-1;b.buffer=buf;b.connect(g);g.connect(c.destination);g.gain.setValueAtTime(vol,c.currentTime+delay);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+delay+dur);b.start(c.currentTime+delay);}

export function useSFX(){
  const play=useCallback((name:string)=>{
    switch(name){
      case'click':   tone(600,'sine',.06,.15);break;
      case'correct': [523,659,784,1047].forEach((f,i)=>tone(f,'sine',.12,.25,i*.1));break;
      case'clap':    noise(.3,.25);break;
      case'wrong':   [200,150].forEach((f,i)=>tone(f,'sawtooth',.1,.2,i*.1));break;
      case'timeout': [300,250,200].forEach((f,i)=>tone(f,'square',.07,.2,i*.08));break;
      case'tick':    tone(800,'square',.04,.07);break;
      case'urgent':  [440,440].forEach((f,i)=>tone(f,'square',.06,.2,i*.12));break;
      case'flip':    tone(400,'sine',.06,.2);tone(600,'sine',.08,.15,.06);break;
      case'match':   [523,784,1047].forEach((f,i)=>tone(f,'sine',.1,.25,i*.1));break;
      case'win':     [523,659,784,1047,1319].forEach((f,i)=>tone(f,'sine',.15,.25,i*.1));break;
      case'gameover':[300,250,180].forEach((f,i)=>tone(f,'sawtooth',.12,.25,i*.12));break;
      case'nav':     tone(440,'sine',.05,.1);break;
      case'splash':  [261,329,392,523].forEach((f,i)=>tone(f,'sine',.14,.22,i*.12));break;
      case'start':   [392,523,659,784].forEach((f,i)=>tone(f,'triangle',.12,.28,i*.1));break;
      case'type':    tone(700,'sine',.03,.07);break;
      case'rope-pull': tone(440,'triangle',.08,.2);tone(550,'triangle',.08,.18,.04);break;
      case'crowd-cheer': [500,600,700].forEach((f,i)=>noise(.15,.15,i*.05));break;
      case'countdown': tone(880,'square',.2,.25);break;
      case'victory': [659,784,987,1047].forEach((f,i)=>tone(f,'sine',.2,.3,i*.08));break;
      case'defeat': [440,330,220].forEach((f,i)=>tone(f,'sine',.2,.2,i*.1));break;
    }
  },[]);
  
  const speak=useCallback((text:string,rate=1,pitch=1.2)=>{
    if(!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    // Replace underscores with dashes for proper speech
    const cleanText = text.replace(/_/g, ' dash ').replace(/-/g, ' dash ');
    const u=new SpeechSynthesisUtterance(cleanText);
    u.rate=rate;u.pitch=pitch;u.volume=.85;
    const vs=window.speechSynthesis.getVoices();
    const v=vs.find(v=>v.lang.startsWith('en')&&v.name.includes('Google'))||vs[0];
    if(v)u.voice=v;
    window.speechSynthesis.speak(u);
  },[]);
  
  return{play,speak};
}
