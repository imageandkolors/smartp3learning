import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, Question } from '../data/questions';

export type Grade = 'P1'|'P2'|'P3'|'P4'|'P5'|'P6';
export type Screen = 'splash'|'home'|'subjects'|'subj-detail'|'cbt'|'cbt-results'|'k-pick'|'k-lobby'|'k-count'|'kahoot'|'k-reveal'|'k-results'|'games'|'memory'|'blaster'|'scramble'|'fractions-game'|'awards'|'tug-of-war';
export type ViewMode = 'mobile'|'tablet'|'desktop';
export interface CbtAnswer { chosen?: number; given?: string; correct: boolean; }

interface S {
  screen: Screen; viewMode: ViewMode; sidebarCollapsed: boolean;
  selectedGrade: Grade|null; fontSize: 1|1.1|1.2|1.3|1.5; soundEnabled: boolean; colorBlindMode: boolean;
  totalPoints: number; progress: Record<string,number>; badges: string[]; kahootBest: Record<string,number>;
  cbtSubject: Subject|null; cbtQuestions: Question[]; cbtIndex: number; cbtAnswers: Record<number,CbtAnswer>; cbtScore: number;
  kSubject: Subject|null; kQuestions: Question[]; kIndex: number; kScore: number; kStreak: number;
  kAnswered: boolean; kTimeLeft: number; kRevealData: {correct:boolean;pts:number;chosen:number}|null;
  setScreen:(s:Screen)=>void; setViewMode:(m:ViewMode)=>void; toggleSidebar:()=>void;
  setGrade:(g:Grade)=>void; setFontSize:(s:1|1.1|1.2|1.3|1.5)=>void; setSoundEnabled:(e:boolean)=>void; setColorBlindMode:(m:boolean)=>void;
  earnPoints:(n:number)=>void; saveProgress:(id:string,done:number)=>void; addBadge:(id:string)=>void;
  setKahootBest:(id:string,score:number)=>void; startCbt:(s:Subject)=>void; setCbtIndex:(i:number)=>void;
  setCbtAnswer:(qId:number,ans:CbtAnswer)=>void;
  startKahoot:(s:Subject,qs:Question[])=>void; setKIndex:(i:number)=>void;
  setKScore:(s:number)=>void; setKStreak:(s:number)=>void; setKAnswered:(a:boolean)=>void;
  setKTimeLeft:(t:number)=>void; setKRevealData:(d:{correct:boolean;pts:number;chosen:number}|null)=>void;
}

export const useAppStore = create<S>()(persist((set)=>({
  screen:'splash', viewMode:'mobile', sidebarCollapsed:false,
  selectedGrade:null, fontSize:1, soundEnabled:true, colorBlindMode:false,
  totalPoints:0, progress:{}, badges:[], kahootBest:{},
  cbtSubject:null, cbtQuestions:[], cbtIndex:0, cbtAnswers:{}, cbtScore:0,
  kSubject:null, kQuestions:[], kIndex:0, kScore:0, kStreak:0,
  kAnswered:false, kTimeLeft:20, kRevealData:null,
  setScreen:(screen)=>set((st)=>({screen,prevScreen:st.screen} as any)),
  setViewMode:(viewMode)=>set({viewMode}),
  toggleSidebar:()=>set((st)=>({sidebarCollapsed:!st.sidebarCollapsed})),
  setGrade:(selectedGrade)=>set({selectedGrade}),
  setFontSize:(fontSize)=>set({fontSize}),
  setSoundEnabled:(soundEnabled)=>set({soundEnabled}),
  setColorBlindMode:(colorBlindMode)=>set({colorBlindMode}),
  earnPoints:(n)=>set((st)=>({totalPoints:st.totalPoints+n})),
  saveProgress:(id,done)=>set((st)=>({progress:{...st.progress,[id]:done}})),
  addBadge:(id)=>set((st)=>st.badges.includes(id)?st:{badges:[...st.badges,id]}),
  setKahootBest:(id,score)=>set((st)=>({kahootBest:{...st.kahootBest,[id]:score}})),
  startCbt:(s)=>set({cbtSubject:s,cbtQuestions:s.questions,cbtIndex:0,cbtAnswers:{},cbtScore:0}),
  setCbtIndex:(i)=>set({cbtIndex:i}),
  setCbtAnswer:(qId,ans)=>set((st)=>({cbtAnswers:{...st.cbtAnswers,[qId]:ans},cbtScore:ans.correct?st.cbtScore+1:st.cbtScore})),
  startKahoot:(s,qs)=>set({kSubject:s,kQuestions:qs,kIndex:0,kScore:0,kStreak:0,kAnswered:false,kTimeLeft:20}),
  setKIndex:(i)=>set({kIndex:i}),
  setKScore:(s)=>set({kScore:s}),
  setKStreak:(s)=>set({kStreak:s}),
  setKAnswered:(a)=>set({kAnswered:a}),
  setKTimeLeft:(t)=>set({kTimeLeft:t}),
  setKRevealData:(d)=>set({kRevealData:d}),
}),{name:'p3-store',partialize:(st)=>({selectedGrade:st.selectedGrade,fontSize:st.fontSize,soundEnabled:st.soundEnabled,colorBlindMode:st.colorBlindMode,totalPoints:st.totalPoints,progress:st.progress,badges:st.badges,kahootBest:st.kahootBest,viewMode:st.viewMode})}));
