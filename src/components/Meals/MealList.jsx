import React, { useState, useEffect } from "react";
import MealCard from "./MealCard";
import "./meals.css";
import { fetchMealsFromAPI } from "../utils/api";

function MealList({
  filter = "All",
  searchTerm,
  setSearchTerm,
  onSelectMeal,
  onBack,
}) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Fetch meals from external API when searchTerm changes
  useEffect(() => {
    // Do not call API for empty search
    if (!searchTerm || searchTerm.trim() === "") {
      setMeals([]);
      return;
    }

    const fetchMeals = async () => {
      setLoading(true);
      try {
        const data = await fetchMealsFromAPI(searchTerm);
        setMeals(data || []);
      } catch (err) {
        console.error("Failed to fetch meals from API:", err);
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, [searchTerm]);

  // 🥗 Veg / Non-Veg filter
  const filteredMeals = meals.filter((meal) => {
    if (filter === "All") return true;
    if (filter === "Veg") return meal.isVeg === true;
    if (filter === "Non-Veg") return meal.isVeg === false;
    return true;
  });

  return (
    <div className="meal-list-page">
      {/* Header */}
      <div className="meal-list-header">
        <h2>{filter} Meals</h2>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Search */}
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
        {loading ? (
          <p>Loading meals...</p>
        ) : filteredMeals.length > 0 ? (
          filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onSelect={() => onSelectMeal(meal)}
            />
          ))
        ) : searchTerm ? (
          <p className="no-meals">No meals found.</p>
        ) : (
          <p className="no-meals">Start typing to search meals.</p>
        )}
      </div>
    </div>
  );
}

export default MealList;
