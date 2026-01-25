import React from "react";
import MealSlot from "./MealSlot";
import "./popup.css";

function MealPopup({
  date,
  selectedMeals = {},
  onClose,
  onViewMeal,
  onAddOrChange,
}) {
  const mealTimes = ["morning", "afternoon", "snack", "dinner"];

  // Calculate total calories for the selected day
  const totalCalories = mealTimes.reduce((sum, time) => {
    const meal = selectedMeals[date]?.[time];
    return sum + (meal?.calories || 0);
  }, 0);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup-container"
        onClick={(e) => e.stopPropagation()} // prevent overlay close
      >
        <h3>Meals for Day {date}</h3>

        {mealTimes.map((time) => (
          <MealSlot
            key={time}
            time={time}
            meal={selectedMeals[date]?.[time]}
            onViewMeal={onViewMeal}       // signal intent only
            onAddOrChange={onAddOrChange} // signal intent only
          />
        ))}

        {/* Daily calorie summary */}
        <div className="daily-calorie-summary">
          <strong>Total Calories:</strong> {totalCalories} kcal
        </div>

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default MealPopup;
