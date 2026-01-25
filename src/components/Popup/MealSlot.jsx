import React from "react";
import "./popup.css";

function MealSlot({ time, meal, onViewMeal, onAddOrChange }) {
  return (
    <div className="meal-slot">
      {/* Meal time label */}
      <span className="meal-time-label">
        {time.charAt(0).toUpperCase() + time.slice(1)}
      </span>

      {/* Action buttons */}
      <div className="meal-slot-buttons">
        {meal ? (
          <>
            {/* View existing meal details */}
            <button onClick={() => onViewMeal(meal)}>
              {meal.name}
            </button>

            {/* Change meal for this time slot */}
            <button onClick={() => onAddOrChange(time)}>
              Change food
            </button>
          </>
        ) : (
          /* Add meal for this time slot */
          <button onClick={() => onAddOrChange(time)}>
            Add food
          </button>
        )}
      </div>
    </div>
  );
}

export default MealSlot;
