import React from "react";

function MealDetails({ meal, pendingMeal, onConfirm, onBack }) {
  if (!meal) return null;

  return (
    <div>
      <h2>Meal Details</h2>

      <p>
        <b>Name:</b> {meal.name}
      </p>

      <p>
        <b>Type:</b> {meal.isVeg ? "Veg" : "Non-Veg"}
      </p>

      <p>
        <b>Calories:</b> {meal.calories ?? "N/A"}
      </p>

      <p>
        <b>Ingredients:</b>{" "}
        {meal.ingredients ? meal.ingredients.join(", ") : "N/A"}
      </p>

      <p>
        <b>Instructions:</b> {meal.instructions ?? "N/A"}
      </p>

      {pendingMeal && (
        <button onClick={onConfirm}>Confirm & Add</button>
      )}

      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default MealDetails;
