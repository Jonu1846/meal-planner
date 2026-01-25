import React from "react";

function MealDetails({ meal, pendingMeal, onConfirm, onBack }) {
  if (!meal) return null;

  return (
    <div>
      <h2>Meal Details</h2>
      <p><b>Name:</b> {meal.name}</p>
      <p><b>Type:</b> {meal.type}</p>
      <p><b>Calories:</b> {meal.calories}</p>
      {pendingMeal && <button onClick={onConfirm}>Confirm & Add</button>}
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default MealDetails;
