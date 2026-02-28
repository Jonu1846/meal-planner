import React, { useState } from "react";
import MealDetails from "./MealDetails";

function MealCard({ meal, onSelect }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="meal-card">
        <div className="meal-card-header">
          <h4>{meal.name}</h4>
          <span className="meal-type-indicator">
            {meal.isVeg === true ? "🟢" : meal.isVeg === false ? "🔴" : "⏳"}
          </span>
        </div>

        {meal.realArea && (
          <p className="meal-cuisine-label">{meal.realArea} Cuisine</p>
        )}

        <div className="meal-card-actions">
          <button
            className="btn-details"
            onClick={() => setShowDetails(true)}
          >
            Details
          </button>
          <button
            className="btn-select"
            onClick={() => onSelect(meal)}
          >
            Select
          </button>
        </div>
      </div>

      {showDetails && (
        <MealDetails
          mealId={meal.id}
          mealName={meal.name}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

export default MealCard;
