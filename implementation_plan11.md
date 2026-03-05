# NEUROSTOCK Full Upgrade Plan

Upgrade the NEUROSTOCK stock market prediction platform so **every feature works** end-to-end and the UI is polished and complete.

---

## Key Issues Found

1. **`animate-marquee` CSS not defined** — [MarketOverviewBar](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/components/MarketOverviewBar.jsx#5-41) uses `animate-marquee` class but the keyframe is missing from Tailwind/CSS, so the ticker bar is static.
2. **`dark-secondary` Tailwind color missing** — Learner pages use `dark-secondary` but it's not in [tailwind.config.js](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/tailwind.config.js), causing styling breakage.
3. **Watchlist "Predict" (Zap) button broken** — navigates to `/` but doesn't trigger the prediction search for the ticker.
4. **Home page day-selector change doesn't re-fetch** — Days selector is visual-only; changes don't re-trigger prediction if data already loaded.
5. **`/learner/simulator` route missing** — LearnerDashboard links to `/learner/simulator` but no route or page exists (broken link).
6. **Learner progress not persisted** — XP, streak, completed lessons all reset on page refresh (local state only).
7. **Modules 2 & 3 locked forever** — No logic to unlock modules after completing Module 1 quiz.
8. **No `/stock-info` endpoint** — No way to show company info (name, sector, market cap) on the frontend.
9. **Sentiment uses 100% mock news** — All news headlines are fake templates. yfinance provides real news.
10. **CommandPalette search doesn't pass ticker to StockInput** — After searching via Cmd+K palette, ticker is searched but not reflected in the input field.

---

## Proposed Changes

### Backend (`src/`)

#### [MODIFY] [app.py](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/src/app.py)
- Add `/stock-info` GET endpoint — fetches company name, sector, market cap, PE ratio via `yfinance`.
- Returns structured JSON for frontend `StockInfoCard` component.

#### [MODIFY] [sentiment.py](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/src/sentiment.py)
- Use `yfinance` ticker `.news` to fetch **real** news headlines (title, publisher, link).
- Fall back to mock news only if the real API returns nothing.

---

### Frontend: CSS & Config

#### [MODIFY] [tailwind.config.js](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/tailwind.config.js)
- Add `dark-secondary` color for learner page backgrounds.
- Add `marquee` animation + keyframes so the market overview ticker bar scrolls.

#### [MODIFY] [index.css](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/index.css)
- Add `@keyframes marquee` as fallback for the scrolling ticker.

---

### Frontend: Core Components

#### [MODIFY] [App.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/App.jsx)
- Add route `/learner/simulator` → `<VirtualTradingPage />`
- Wire ticker state so [WatchlistPage](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/pages/WatchlistPage.jsx#8-143) Zap button triggers prediction on HomePage
- Add initial ticker state management via URL search param `?ticker=SYM`

#### [MODIFY] [StockInput.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/components/StockInput.jsx)
- Accept `value` prop so external state (from URL param, CommandPalette) can set the visible ticker.

#### [MODIFY] [NavBar.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/components/NavBar.jsx)
- Add "Learn" link with `GraduationCap` icon.

#### [NEW] [StockInfoCard.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/components/StockInfoCard.jsx)
- Shows company name, sector, market cap, P/E ratio, 52-week high/low.
- Fetches from `/stock-info?ticker=XXX` endpoint.

---

### Frontend: Home Page

#### [MODIFY] [App.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/App.jsx) (HomePage section)
- Read `?ticker` URL param on mount to auto-trigger prediction (fixes Watchlist Zap button).
- Day selector: re-fetch prediction when `days` changes if a ticker is already loaded.
- Show `StockInfoCard` below stats cards when data is available.

---

### Frontend: Watchlist Page

#### [MODIFY] [WatchlistPage.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/pages/WatchlistPage.jsx)
- Fix Zap button: navigate to `/?ticker=SYM` (URL param) so HomePage auto-triggers prediction.

---

### Frontend: Learner Pages

#### [MODIFY] [LearnerDashboard.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/pages/Learner/LearnerDashboard.jsx)
- Persist progress (XP, streak, completedLessons, unlockedModules) to `localStorage`.
- Unlock Module 2 when Module 1 quiz is passed; unlock Module 3 when Module 2 is passed.
- Add module 3 (Fundamental Analysis) — same structure.

#### [NEW] [VirtualTradingPage.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/pages/Learner/VirtualTradingPage.jsx)
- Virtual portfolio starting at $10,000.
- Search a stock, see current price from `/watchlist-prices`, buy/sell shares.
- Track portfolio value, holdings, P&L. All persisted to localStorage.

#### [MODIFY] [LessonPage.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/pages/Learner/LessonPage.jsx)
- After completing a lesson, update XP and completedLessons in localStorage.

#### [MODIFY] [QuizPage.jsx](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/pages/Learner/QuizPage.jsx)
- After passing quiz, mark module complete and unlock next module in localStorage.

---

### Data Files

#### [MODIFY] [lessons.json](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/data/lessons.json)
- Add 5 lessons for Module 2 (Technical Analysis): Moving Averages, RSI, MACD, Bollinger Bands, Chart Patterns.

#### [MODIFY] [quizzes.json](file:///c:/Users/FARAZ%20KHAN/Desktop/DEKSTOP/PROJECTS/stock_market%20prediction/frontend/src/data/quizzes.json)
- Add Module 2 quiz with 5 questions.

---

## Verification Plan

### Automated checks
- `npm run build` in `frontend/` — must complete with no errors.

### Manual Verification (Browser)
1. **Start backend**: `cd src && python app.py` (or activate venv first). Confirm `http://localhost:5000/health` returns `{"status": "healthy"}`.
2. **Start frontend**: `cd frontend && npm run dev`. Open `http://localhost:5173`.
3. **Market bar**: Confirm scrolling ticker bar shows live prices (animated).
4. **Home prediction**: Search "AAPL" → stats cards, chart, and sentiment gauge all populate.
5. **Day selector**: With AAPL loaded, click "14d" → chart and prediction details update.
6. **Stock info card**: Below stats cards, company info (name, sector, market cap) appears.
7. **Watchlist**: Add AAPL to watchlist (star button) → go to Watchlist page → click Zap ⚡ → redirects to Home, prediction for AAPL runs automatically.
8. **Compare**: Click Compare, enter AAPL vs MSFT, click Compare → both cards and chart populated.
9. **Learner**: Go to `/learner`, click Module 1, complete Lesson 1 → XP increases. Complete all 5 lessons → Quiz unlocks. Pass quiz → Module 2 unlocks.
10. **Virtual Trading**: Click "Virtual Trading" → `/learner/simulator` page loads, can search stock and buy shares.
11. **Command Palette**: Press `Ctrl+K` → type "TSLA" → press Enter → search triggers, ticker appears in search bar.
