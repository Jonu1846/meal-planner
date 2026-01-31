import React from "react";
import MealSlot from "./MealSlot";
import "./popup.css";

function MealPopup({
  date,                 // day number (e.g. 25)
  selectedMeals = {},   // { "2026-01-25": { breakfast: {...} } }
  onClose,
  onViewMeal,
  onAddOrChange,
}) {
  const mealTimes = ["breakfast", "lunch", "snack", "dinner"];

  // 🔥 FIX: rebuild YYYY-MM-DD key
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-based

  const dateKey = new Date(year, month, date)
    .toISOString()
    .split("T")[0];

  const mealsForDay = selectedMeals[dateKey] || {};

  const totalCalories = mealTimes.reduce((sum, time) => {
    const meal = mealsForDay[time];
    return sum + (meal?.calories || 0);
  }, 0);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Meals for {dateKey}</h3>

        {mealTimes.map((time) => {
          const meal = mealsForDay[time];

          return (
            <MealSlot
              key={time}
              time={time}
              meal={meal}              // ✅ now has name
              onViewMeal={onViewMeal}
              onAddOrChange={onAddOrChange}
            />
          );
        })}

        <div className="daily-calorie-summary">
          <strong>Total Calories:</strong>{" "}
          {totalCalories > 0 ? `${totalCalories} kcal` : "—"}
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default MealPopup;
