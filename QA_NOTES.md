# QA notes

The editable source project builds successfully with `npm run build` after correcting the missing `useEffect` import in `src/App.tsx`.

The rebuilt preview starts at `http://127.0.0.1:4175/` and shows the grade selector. Selecting Primary 3 opens the existing P3 Smart Learning home screen with six subject tiles: Quantitative Reasoning, Verbal Reasoning, Mathematics, English Language, Basic Science, and Social Studies. The Subjects screen now shows mastery labels (`Starting`, `Practising`, `Secure`) and a learning-path roadmap with objectives and topic chips for Mathematics, English Studies, Basic Science & Technology, National Values & Social Studies, Culture & Creative Arts, and Nigerian Languages. Planned strands are explicitly marked `Coming next` rather than being presented as playable content.

The existing navigation and game entry points remain intact. The preview screenshot confirms the roadmap is visible on desktop and responsive CSS rules are present for tablet/mobile layouts.


A blank preview appeared briefly after rebuild because stale service-worker/persisted browser state interfered with the local preview. Unregistering the service worker, clearing local/session storage, and reloading restored the grade selector successfully. This is a browser-preview cache issue, not a TypeScript or Vite build failure.


Final browser verification: selecting Primary 3 opens the home dashboard; Subjects opens the roadmap; selecting Mathematics opens a subject detail screen with the objective “Use numbers, money, measurement and shapes in everyday problems” and the visible four-step sequence Learn → Practise → Play → Review. Existing CBT Exam Mode and Kahoot Speed Battle entry points are preserved.
