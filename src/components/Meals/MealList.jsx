import React, { useState, useEffect } from "react";
import MealCard from "./MealCard";
import "./meals.css";

// ✅ Temporary mock data (replaces API)
const mockMeals = [
  {
    id: 1,
    name: "Paneer Butter Masala",
    isVeg: true,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 2,
    name: "Chicken Biryani",
    isVeg: false,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 3,
    name: "Veg Fried Rice",
    isVeg: true,
    image: "https://via.placeholder.com/150",
  },
  {
    id: 4,
    name: "Mutton Curry",
    isVeg: false,
    image: "https://via.placeholder.com/150",
  },
];

function MealList({
  filter = "All",
  searchTerm,
  setSearchTerm,
  onSelectMeal,
  onBack,
}) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔍 Local search logic (NO API)
  useEffect(() => {
    setLoading(true);

    // simulate async behavior (like API, but local)
    const timeout = setTimeout(() => {
      if (!searchTerm || searchTerm.trim() === "") {
        setMeals([]);
        setLoading(false);
        return;
      }

      const filtered = mockMeals.filter((meal) =>
        meal.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setMeals(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
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
