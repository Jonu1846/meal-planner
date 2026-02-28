import React from "react";
import "./popup.css";

function MealSlot({ time, meal, onAddOrChange, onViewDetails }) {
  const timeLabel = time.charAt(0).toUpperCase() + time.slice(1);
  const isVeg = meal?.category === "Veg";
  const isNonVeg = meal?.category === "Non-Veg";

  return (
    <div className="meal-slot">
      <span className="meal-time-label">{timeLabel}</span>

      <div className="meal-slot-buttons">
        {meal ? (
          <>
            <button
              className="meal-slot-name-btn"
              onClick={() => onViewDetails && onViewDetails(meal)}
              title="Click to view details"
            >
              🍽 {meal.name}
              {isVeg && <span style={{ marginLeft: "6px" }}>🟢</span>}
              {isNonVeg && <span style={{ marginLeft: "6px" }}>🔴</span>}
            </button>

            <button onClick={() => onAddOrChange(time)}>
              Change food
            </button>
          </>
        ) : (
          <button onClick={() => onAddOrChange(time)}>
            Add food
          </button>
        )}
      </div>
    </div>
  );
}

export default MealSlot;
