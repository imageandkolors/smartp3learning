# Tug of War Competition Features Implementation Guide

## Current Implementation Status

### ✅ Completed
1. **Side-by-Side Layout** - Both teams visible simultaneously
2. **Toast with Correct Answer** - Shows feedback with solution for 2 seconds
3. **Time-Based Auto-Submit** - Auto-submits when timer reaches 0
4. **Sidebar Collapse** - Hamburger collapse/expand button
5. **Responsive UI** - Adapts to mobile/tablet/desktop views
6. **Multi-Subject Support** - Infrastructure added (subject field in settings)

---

## 🎮 Competition Features Still to Implement

### 1. **Team Setup/Configuration Screen**
**Purpose**: Allow customization before match starts

**Features**:
- Team name input fields (currently hardcoded)
- Team avatar/color selection
- Round count selector (3-10 rounds instead of fixed)
- Subject selection dropdown (Math, English, Quantitative Reasoning, General Knowledge)
- Questions per round selector (currently 1, should allow 3-5)
- Time per question adjustment (10-60 seconds)

**Implementation Location**: `SettingsPanel.tsx` - extend the existing settings UI

### 2. **Multi-Subject Question Pool**
**Current**: Only Mathematics questions available

**Required Subjects**:
- ✅ Mathematics (exists - has Arithmetic, Algebra, Geometry topics)
- English Language (Comprehension, Grammar, Vocabulary)
- Quantitative Reasoning (Data Interpretation, Logical Reasoning)
- General Knowledge (History, Science, Geography)

**Implementation**:
- Extend `tugQuestions.ts` with question generators for other subjects
- Filter questions by selected subject when game starts
- Populate initial question pool based on subject choice

### 3. **Adaptive Keypads Based on Subject**
**Current**: Numeric keypad (0-9) for all subjects

**Required Keypads**:
```
Math:       0-9, +, -, ×, ÷, =, CLR, ✓
English:    A-Z keyboard, space, CLR, ✓
Quantitative: 0-9, %, (,), <, >, =, CLR, ✓
General Kn: A-Z plus common abbreviations, CLR, ✓
```

**Implementation**: 
- Add `getKeypadForSubject()` function in `TeamSide.tsx`
- Replace hardcoded `ROWS` with dynamic keypad based on question subject
- Update button click handlers to support alpha characters

### 4. **Questions Per Round Implementation**
**Current**: Single question per round, winner gets 1 point

**New System**:
- Each round consists of N questions (default 3-5, configurable)
- Teams alternate after each correct answer
- Running score within the round
- Team with more correct answers in the round wins that round and gets rope pull

**Implementation Changes**:
- Update `RoundState` in `tugTypes.ts` to track:
  - `questionsInRound: number`
  - `questionsAnswered: number[]` (per team)
  - `roundScore: Record<TeamId, number>`
- Modify `tugReducer.ts` logic:
  - Track per-team round scores
  - Determine round winner based on round score
  - Load next question after each answer (until round complete)

### 5. **Competitive Leaderboard/Statistics**
**Feature**: Track performance metrics for competitive play

**Metrics to Track**:
- Total rounds won
- Correct answers
- Average response time
- Streaks
- Accuracy percentage

**Display During Game**:
- Real-time round statistics
- After match: Final leaderboard with all stats

**Implementation**:
- Extend `TeamState` to include accuracy/timing data
- Create `Leaderboard.tsx` component
- Display in `MatchOverOverlay` (final results screen)

### 6. **Final Match Announcement & Leaderboard**
**Current**: Simple winner screen exists

**Enhancements**:
- Animated winner banner with confetti
- Detailed statistics per team:
  - Total score
  - Rounds won
  - Total correct answers
  - Accuracy %
  - Best streak
- Medals/ranking display
- Option to play again or go back

**Implementation**: Enhance `MatchOverOverlay` in `WinScreen.tsx`

---

## 📊 Questions Per Round Example

**Scenario**: 5-Round Match, 3 Questions Per Round, Total Possible: 15 Points

```
ROUND 1: 3 Questions
  Q1: Team1 Wrong, Team2 Correct → T2: +1
  Q2: Team1 Correct, Team2 Correct → Active switches to T2, T1: +1
  Q3: Team2 Correct → T2: +1
  Round Winner: Team 2 (2 pts) → Pulls rope right

ROUND 2: 3 Questions
  Q1: Team1 Correct → T1: +1
  Q2: Team2 Wrong → T1 still active
  Q3: Team1 Correct → T1: +1
  Round Winner: Team 1 (2 pts) → Pulls rope left

...and so on
```

---

## 🔄 Implementation Priority

**Phase 1 (Critical)**:
1. Fix responsive layout ✅
2. Add subject selection to settings
3. Multi-subject question pool
4. Adaptive keypads

**Phase 2 (Important)**:
5. Questions per round system
6. Enhanced leaderboard
7. Competitive statistics tracking

**Phase 3 (Nice to Have)**:
8. Animation improvements
9. Sound effects per subject
10. Mobile-optimized layout variants

---

## 📝 Files to Modify

1. **SettingsPanel.tsx** - Add subject selector, questions per round
2. **TeamSide.tsx** - Implement adaptive keypad
3. **TugOfWarGame.tsx** - Handle subject filtering
4. **tugReducer.ts** - Update round/match logic for multiple questions
5. **tugTypes.ts** - Add new state fields ✅
6. **tugQuestions.ts** - Add other subjects
7. **WinScreen.tsx** - Enhanced leaderboard display

---

## 🎯 Next Steps

1. Update SettingsPanel with subject dropdown
2. Extend tugQuestions.ts with new subjects
3. Implement `getKeypadForSubject()` function
4. Modify round logic for multiple questions per round
5. Enhance final leaderboard display

