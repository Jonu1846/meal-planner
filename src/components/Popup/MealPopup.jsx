import React from "react";
import MealSlot from "./MealSlot";
import "./popup.css";

function MealPopup({
  date,
  selectedMeals = {},
  onClose,
  onAddOrChange,
  onViewDetails,
}) {
  const mealTimes = ["breakfast", "lunch", "snack", "dinner"];

  const dateKey = date; // ✅ FIX

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

        {mealTimes.map((time) => (
          <MealSlot
            key={time}
            time={time}
            meal={mealsForDay[time]}
            onAddOrChange={onAddOrChange}
            onViewDetails={onViewDetails}
          />
        ))}

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
