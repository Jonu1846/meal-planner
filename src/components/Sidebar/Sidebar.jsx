import React, { useMemo, useEffect, useRef } from "react";
import "./sidebar.css";

// ── Helpers ────────────────────────────────────────────────────────────────────
function getDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function computeDailyGoal() {
  const BASE = 2200, MIN = 1800, MAX = 2500;
  const stored = localStorage.getItem("mp_yesterday_calories");
  const y = stored ? Number(stored) : null;
  if (y === null) return BASE;
  if (y > BASE + 300) return Math.max(BASE - 100, MIN);
  if (y < BASE) return Math.min(BASE + 50, MAX);
  return BASE;
}

function computeWeeklyAnalysis(plannedMealsByDate) {
  const SLOTS = ["breakfast", "lunch", "dinner"];
  let totalCal = 0, dayCount = 0;
  const skipped = { breakfast: 0, lunch: 0, dinner: 0 };
  const slotCal = { breakfast: 0, lunch: 0, dinner: 0 };

  for (let i = 1; i <= 7; i++) {
    const key = getDateKey(-i);
    const dayObj = plannedMealsByDate?.[key];
    dayCount++;
    if (!dayObj) { SLOTS.forEach((s) => skipped[s]++); continue; }
    for (const s of SLOTS) {
      if (dayObj && dayObj[s]) {
        const c = Number(dayObj[s]?.calories) || 0;
        totalCal += c;
        slotCal[s] += c;
      } else {
        skipped[s]++;
      }
    }
  }

  const avgCal = dayCount ? Math.round(totalCal / dayCount) : 0;
  const mostSkipped = SLOTS.reduce((a, b) => skipped[a] >= skipped[b] ? a : b);
  const heaviestSlot = SLOTS.reduce((a, b) => slotCal[a] >= slotCal[b] ? a : b);
  return { avgCal, mostSkipped, heaviestSlot };
}

function getStreak(totalCaloriesToday, dailyGoal) {
  const today = getDateKey(0);
  const lastDate = localStorage.getItem("mp_streak_date");
  const streak = Number(localStorage.getItem("mp_streak") || "0");
  if (totalCaloriesToday === 0) return streak;
  const withinGoal = totalCaloriesToday <= dailyGoal;
  if (lastDate === today) {
    const updated = withinGoal ? streak : 0;
    localStorage.setItem("mp_streak", String(updated));
    return updated;
  }
  const newStreak = withinGoal ? streak + 1 : 0;
  localStorage.setItem("mp_streak", String(newStreak));
  localStorage.setItem("mp_streak_date", today);
  return newStreak;
}

// ── XP & Level helpers ─────────────────────────────────────────────────────────
const LEVELS = [
  { min: 0, max: 200, label: "Starter", glow: "glow-blue" },
  { min: 201, max: 500, label: "Disciplined", glow: "glow-blue" },
  { min: 501, max: 900, label: "Focused", glow: "glow-violet" },
  { min: 901, max: 1500, label: "Elite Planner", glow: "glow-gold" },
  { min: 1501, max: Infinity, label: "Nutrition Master", glow: "glow-gold" },
];

function getLevelInfo(xp) {
  const idx = LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const level = idx === -1 ? LEVELS.length : idx + 1;
  const info = LEVELS[Math.min(idx, LEVELS.length - 1)];
  const next = LEVELS[Math.min(idx + 1, LEVELS.length - 1)];
  const progress = info.max === Infinity ? 100 :
    Math.min(((xp - info.min) / (info.max - info.min)) * 100, 100);
  return { level, label: info.label, glow: info.glow, progress, nextThreshold: next.min };
}

function computeXP(mealsPlannedToday, totalCaloriesToday, dailyGoal, streak, storedXP) {
  // XP earned this session (today)
  let sessionXP = mealsPlannedToday * 10;
  if (mealsPlannedToday === 3) sessionXP += 30;
  if (totalCaloriesToday <= dailyGoal && totalCaloriesToday > 0) sessionXP += 50;
  if (streak >= 3) sessionXP += 20;

  const base = Number(storedXP || 0);
  const today = getDateKey(0);
  const lastXPDay = localStorage.getItem("mp_xp_date");
  // Award session XP freshly each day
  if (lastXPDay !== today) {
    localStorage.setItem("mp_xp_date", today);
    const newTotal = base + sessionXP;
    localStorage.setItem("mp_xp", String(newTotal));
    return newTotal;
  }
  return base;
}

// ── Achievements ───────────────────────────────────────────────────────────────
const ALL_BADGES = [
  { id: "first_meal", emoji: "🏆", label: "First Meal", check: (s) => s.totalMealsEver >= 1 },
  { id: "streak3", emoji: "🔥", label: "3-Day Streak", check: (s) => s.streak >= 3 },
  { id: "balanced_wk", emoji: "⚖", label: "Balanced Week", check: (s) => s.avgCal > 0 && s.avgCal <= s.dailyGoal },
  { id: "xp1000", emoji: "👑", label: "1000+ XP", check: (s) => s.xp >= 1000 },
];

function getTotalMealsEver(plannedMealsByDate) {
  let count = 0;
  Object.values(plannedMealsByDate || {}).forEach((dayObj) => {
    count += Object.keys(dayObj || {}).length;
  });
  return count;
}

// ─────────────────────────────────────────────────────────────────────────────
const Sidebar = ({ isOpen, onClose, plannedMealsByDate }) => {
  const today = useMemo(() => getDateKey(0), []);

  const dailyGoal = useMemo(() => computeDailyGoal(), []);

  const { totalCaloriesToday, mealsPlannedToday, nextMeal } = useMemo(() => {
    const dayObj = (plannedMealsByDate && plannedMealsByDate[today]) || {};
    let totalCalories = 0, mealsCount = 0;

    Object.values(dayObj).forEach((meal) => {
      if (meal) {
        mealsCount++;
        const cal = Number(meal.calories);
        if (!isNaN(cal)) totalCalories += cal;
      }
    });

    let upcoming = "All meals planned 🎉";
    if (!dayObj.breakfast) upcoming = "Next: Plan Breakfast";
    else if (!dayObj.lunch) upcoming = "Next: Plan Lunch";
    else if (!dayObj.dinner) upcoming = "Next: Plan Dinner";

    return { totalCaloriesToday: totalCalories, mealsPlannedToday: mealsCount, nextMeal: upcoming };
  }, [plannedMealsByDate, today]);

  useEffect(() => {
    if (totalCaloriesToday > 0) {
      localStorage.setItem("mp_yesterday_calories", String(totalCaloriesToday));
    }
  }, [totalCaloriesToday]);

  const remainingCalories = dailyGoal - totalCaloriesToday;
  const progressPercentage = Math.min((totalCaloriesToday / dailyGoal) * 100, 100);
  const ratio = totalCaloriesToday / dailyGoal;

  const { avgCal, mostSkipped, heaviestSlot } = useMemo(
    () => computeWeeklyAnalysis(plannedMealsByDate),
    [plannedMealsByDate]
  );

  const streak = useMemo(() => getStreak(totalCaloriesToday, dailyGoal), [totalCaloriesToday, dailyGoal]);

  // ── XP — read localStorage fresh inside useMemo so stale value is never used ──
  const xp = useMemo(() => {
    const storedXP = localStorage.getItem("mp_xp");
    return computeXP(mealsPlannedToday, totalCaloriesToday, dailyGoal, streak, storedXP);
  }, [mealsPlannedToday, totalCaloriesToday, dailyGoal, streak]);
  const { level, label: levelLabel, glow, progress: xpProgress, nextThreshold } = useMemo(() => getLevelInfo(xp), [xp]);

  // ── Achievements ──
  const totalMealsEver = useMemo(() => getTotalMealsEver(plannedMealsByDate), [plannedMealsByDate]);
  const badgeStatus = useMemo(() =>
    ALL_BADGES.map((b) => ({
      ...b,
      unlocked: b.check({ totalMealsEver, streak, avgCal, dailyGoal, xp }),
    })),
    [totalMealsEver, streak, avgCal, dailyGoal, xp]
  );

  // ── XP bounce animation on change ──
  const xpRef = useRef(xp);
  const xpBounce = useRef(false);
  if (xp !== xpRef.current) { xpBounce.current = true; xpRef.current = xp; }

  // ── Status dot ──
  const statusDotClass = mealsPlannedToday === 3 ? "status-dot green"
    : mealsPlannedToday > 0 ? "status-dot orange" : "status-dot red";

  // ── Personality badge ──
  let badge, badgeSubtitle;
  if (totalCaloriesToday === 0) { badge = "🧊 Fasting Mode"; badgeSubtitle = "No calories logged yet today"; }
  else if (ratio < 0.5) { badge = "🥗 Light Eater"; badgeSubtitle = "Keep fueling your day"; }
  else if (ratio <= 1) { badge = "⚖ Balanced Planner"; badgeSubtitle = "You're managing well today"; }
  else { badge = "🔥 Calorie King"; badgeSubtitle = "Careful, you're exceeding your goal"; }

  // ── Motivation ──
  const motivation =
    ratio < 0.5 ? "Keep building your fuel 💪" :
      ratio <= 1 ? "You're on track today 🚀" :
        "Balance it out tomorrow 🔄";

  // ── Meal suggestion ──
  const currentHour = new Date().getHours();
  const mealSuggestion =
    ratio > 1 ? "Try a lighter next meal 🥦" :
      ratio < 0.4 && currentHour >= 17 ? "Consider adding a balanced dinner 🍽" :
        (ratio >= 0.85 && ratio <= 1) ? "Maintain this consistency 🔥" :
          "You're doing great — keep it up! ✅";

  const isAdaptive = dailyGoal !== 2200;

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>

      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="header-title-row">
          <span className={statusDotClass}></span>
          <h3>Planner Panel</h3>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      {/* ── XP & Level card (Phase 5) ── */}
      <div className={`xp-card ${glow}`}>
        <div className="xp-top-row">
          <span className="level-badge">⭐ Level {level} — {levelLabel}</span>
          <span className={`xp-count ${xpBounce.current ? "xp-bounce" : ""}`}
            onAnimationEnd={() => { xpBounce.current = false; }}>
            {xp} XP
          </span>
        </div>
        <div className="xp-bar-track">
          <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
        </div>
        <p className="xp-next-label">
          {level < 5 ? `Next level at ${nextThreshold} XP` : "Max level reached 🎖"}
        </p>
      </div>

      {/* ── Achievements (Phase 5) ── */}
      <div className="sidebar-section achievements-section">
        <p className="achievements-title"><strong>Achievements</strong></p>
        <div className="badges-grid">
          {badgeStatus.map((b) => (
            <div
              key={b.id}
              className={`badge-item ${b.unlocked ? "unlocked" : "locked"}`}
              title={b.label}
            >
              <span className="badge-emoji">{b.emoji}</span>
              <span className="badge-item-label">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Streak Bar ── */}
      {streak > 0 && (
        <div className="streak-bar">
          🔥 <strong>{streak} Day</strong> Balanced Streak
        </div>
      )}

      {/* ── Personality Badge ── */}
      <div className="badge-card">
        <div className="badge-top">
          <span className="badge-label">{badge}</span>
        </div>
        <p className="badge-subtitle">{badgeSubtitle}</p>
        <p className="motivation-text">{motivation}</p>
      </div>

      {/* ── Today's Snapshot ── */}
      <div className="sidebar-section snapshot-section">
        <div className="snapshot-title-row">
          <p><strong>Today's Snapshot</strong></p>
          {isAdaptive && (
            <span className="adaptive-badge" title="Goal adjusts based on your previous day">
              Adaptive ⚡
            </span>
          )}
        </div>
        <div className="snapshot-card">
          <p className="daily-goal-text">Daily Goal: <strong>{dailyGoal} kcal</strong></p>
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="calories-info">
            <p>🔥 {totalCaloriesToday} kcal</p>
            {remainingCalories >= 0 ? (
              <p className="remaining-text">Remaining: <strong>{remainingCalories} kcal</strong></p>
            ) : (
              <p className="exceeded-text">Exceeded by <strong>{Math.abs(remainingCalories)} kcal</strong></p>
            )}
          </div>
          <p className="meals-planned-text">🍽 Meals Planned: <strong>{mealsPlannedToday} / 3</strong></p>
        </div>
      </div>

      {/* ── Upcoming Meal Reminder ── */}
      <div className="sidebar-section reminder-section">
        <div className="reminder-card">
          <span className="reminder-icon">{mealsPlannedToday === 3 ? "🎉" : "💡"}</span>
          <p>{nextMeal}</p>
        </div>
      </div>

      {/* ── Smart Suggestion ── */}
      <div className="sidebar-section suggestion-section">
        <div className="suggestion-card">
          <span className="suggestion-icon">🤖</span>
          <p>{mealSuggestion}</p>
        </div>
      </div>

      {/* ── Weekly Insight ── */}
      <div className="sidebar-section weekly-section">
        <p className="weekly-title"><strong>Weekly Insight 📊</strong></p>
        <div className="weekly-card">
          <div className="weekly-row">
            <span className="weekly-key">Avg/day</span>
            <span className="weekly-val">{avgCal} kcal</span>
          </div>
          <div className="weekly-row">
            <span className="weekly-key">Most Skipped</span>
            <span className="weekly-val capitalize">{mostSkipped}</span>
          </div>
          <div className="weekly-row">
            <span className="weekly-key">Heavy Meal</span>
            <span className="weekly-val capitalize">{heaviestSlot}</span>
          </div>
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;
