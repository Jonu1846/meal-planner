import React from "react";
import { normalizeMeal } from "../utils/normalizeMeal";

function MealDetails({ meal, pendingMeal, onConfirm, onBack }) {
  if (!meal) return null;

  // Normalize before displaying
  const normalizedMeal = normalizeMeal(meal, meal.source);

  return (
    <div>
      <h2>Meal Details</h2>
      <p><b>Name:</b> {normalizedMeal.name}</p>
      <p><b>Type:</b> {normalizedMeal.type}</p>
      <p><b>Calories:</b> {normalizedMeal.calories}</p>
      <p><b>Ingredients:</b> {normalizedMeal.ingredients.join(", ")}</p>
      <p><b>Instructions:</b> {normalizedMeal.instructions}</p>
      {pendingMeal && <button onClick={onConfirm}>Confirm & Add</button>}
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default MealDetails;
