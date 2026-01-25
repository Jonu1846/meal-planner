import React from "react";


function MealCard({ meal, onSelect, onView }) {
  return (
    <div className="meal-card">
      <h4>{meal.name}</h4>
      <p>Type: {meal.type}</p>
      <p>Calories: {meal.calories}</p>
      <button onClick={() => onView(meal)}>View</button>
      <button onClick={() => onSelect(meal)}>Select</button>
    </div>
  );
}

export default MealCard;
