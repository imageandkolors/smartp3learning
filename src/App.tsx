import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { GradeSelector } from './components/GradeSelector';
import {
  StatusBar, BottomNav, DesktopTopbar, DesktopSidebar, SizeSwitcher,
  SplashScreen, HomeScreen, SubjectsScreen, SubjectDetailScreen,
  CBTScreen, CBTResultsScreen,
  KahootPickerScreen, KahootLobbyScreen, KahootCountScreen,
  KahootGameScreen, KahootRevealScreen, KahootResultsScreen,
  GamesScreen, MemoryScreen, BlasterScreen, ScrambleScreen, FractionsGameScreen,
  AwardsScreen, TugOfWarScreen,
} from './screens/index';

const SCREEN_MAP: Record<string, React.FC> = {
  splash: SplashScreen, home: HomeScreen, subjects: SubjectsScreen,
  'subj-detail': SubjectDetailScreen, cbt: CBTScreen, 'cbt-results': CBTResultsScreen,
  'k-pick': KahootPickerScreen, 'k-lobby': KahootLobbyScreen,
  'k-count': KahootCountScreen, kahoot: KahootGameScreen,
  'k-reveal': KahootRevealScreen, 'k-results': KahootResultsScreen,
  games: GamesScreen, memory: MemoryScreen, blaster: BlasterScreen,
  scramble: ScrambleScreen, 'fractions-game': FractionsGameScreen,
  awards: AwardsScreen, 'tug-of-war': TugOfWarScreen,
};

export default function App() {
  const { screen, viewMode, sidebarCollapsed, selectedGrade, setViewMode } = useAppStore();
  const isDesktop = viewMode === 'desktop';
  const showGradeSelector = !selectedGrade;

  useEffect(() => {
    // Auto-detect viewport size and set appropriate mode
    const handleResize = () => {
      const width = window.innerWidth;
      let newMode: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      
      if (width < 768) {
        newMode = 'mobile';
      } else if (width < 1280) {
        newMode = 'tablet';
      }
      
      if (newMode !== viewMode) {
        setViewMode(newMode);
      }
    };

    // Check on initial load
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode, setViewMode]);

  useEffect(() => {
    let cls = 'mode-' + viewMode;
    if (sidebarCollapsed) cls += ' sb-collapsed';
    document.body.className = cls;
    document.documentElement.className = 'mode-' + viewMode;
  }, [viewMode, sidebarCollapsed]);

  // Show grade selector on first launch
  if (showGradeSelector) {
    return (
      <div id="app-root" className="app-shell">
        <GradeSelector />
      </div>
    );
  }

  const ActiveScreen = SCREEN_MAP[screen] ?? HomeScreen;
  const isFullscreenGame = screen === 'tug-of-war';

  return (
    <>
      <div id="app-root" className="app-shell">
        {!isDesktop && !isFullscreenGame && <StatusBar />}
      <DesktopTopbar />
      <DesktopSidebar />
      <div className="screens-wrap" style={{ position:'relative', flex:1, overflow:'hidden', gridArea: isDesktop ? 'main' : undefined, width:'100%', height:'100%' }}>
        <AnimatePresence mode="wait">
          <ActiveScreen key={screen} />
        </AnimatePresence>
      </div>
      {!isDesktop && !isFullscreenGame && <BottomNav />}
      </div>
      <SizeSwitcher />
    </>
  );
}
