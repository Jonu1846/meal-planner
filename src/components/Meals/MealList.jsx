import React from "react";
import MealCard from "./MealCard";
import "./meals.css";

function MealList({
  meals = [],
  filter = "All",
  searchTerm,
  setSearchTerm,
  onSelectMeal,
  onBack,
}) {
  const filteredMeals = meals.filter(
    (meal) =>
      (filter === "All" || meal.type === filter) &&
      meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="meal-list-page">
      {/* Header */}
      <div className="meal-list-header">
        <h2>{filter} Meals</h2>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Search Bar */}
      <div className="meal-search">
        <input
          type="text"
          placeholder="Search meals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Meal Cards */}
      <div className="meal-cards">
        {filteredMeals.length > 0 ? (
          filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onSelect={() => onSelectMeal(meal)}
            />
          ))
        ) : (
          <p className="no-meals">No meals found.</p>
        )}
      </div>
    </div>
  );
}

export default MealList;
