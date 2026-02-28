import React, { useState, useEffect, useMemo } from "react";
import MealCard from "./MealCard";
import { fetchMealsByCuisines, fetchMealDetails, CUISINE_TABS } from "../utils/api";
import "./meals.css";

const CUISINE_LABELS = {
  Japanese: "🇯🇵",
  Chinese: "🇨🇳",
  American: "🇺🇸",
  Indian: "🇮🇳",
};

function MealList({
  filter = "All",
  searchTerm,
  setSearchTerm,
  onSelectMeal,
  onBack,
}) {
  const [allMeals, setAllMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCuisine, setActiveCuisine] = useState("All");

  // Load from cache first, then fetch updates silently in the background
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let parsedCache = null;

      // 1. Attempt to load from localStorage cache immediately
      try {
        const cached = localStorage.getItem("mealdb_cache");
        if (cached) {
          parsedCache = JSON.parse(cached);
          if (Array.isArray(parsedCache) && parsedCache.length > 0) {
            setAllMeals(parsedCache);
            setLoading(false);
          }
        }
      } catch (e) {
        console.error("Cache parsing error", e);
      }

      if (!parsedCache) setLoading(true);
      setError(null);

      let fetchedMeals = [];
      try {
        // 2. Fetch fresh list from server in background
        fetchedMeals = await fetchMealsByCuisines();
      } catch (err) {
        if (!parsedCache) {
          setError("Failed to load meals. Please check your connection.");
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;

      // 3. Merge fresh structures with cached details (to preserve known isVeg/category properties)
      let currentMeals = fetchedMeals.map((meal) => {
        const cachedMeal = parsedCache?.find((c) => c.id === meal.id);
        return cachedMeal && cachedMeal.isVeg !== null ? cachedMeal : meal;
      });

      if (!parsedCache) {
        setAllMeals(currentMeals);
        setLoading(false);
      }

      // 4. Resolve missing isVeg details intelligently (skip items we already know)
      const BATCH = 20;
      for (let i = 0; i < currentMeals.length; i += BATCH) {
        if (cancelled) break;

        const batch = currentMeals.slice(i, i + BATCH);
        // Only hit the lookup endpoint for meals that don't have isVeg resolved yet
        const idsToFetch = batch.filter((m) => m.isVeg === null).map((m) => m.id);

        if (idsToFetch.length > 0) {
          const detailsMap = await fetchMealDetails(idsToFetch);
          if (cancelled) break;

          currentMeals = currentMeals.map((meal) =>
            detailsMap[meal.id] ? { ...meal, ...detailsMap[meal.id] } : meal
          );

          setAllMeals([...currentMeals]);
          localStorage.setItem("mealdb_cache", JSON.stringify(currentMeals));

          // Subtle rate limit protection
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }

      // Final cache sync
      if (!cancelled) {
        setAllMeals([...currentMeals]);
        localStorage.setItem("mealdb_cache", JSON.stringify(currentMeals));
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // Filter by cuisine tab, search term, and Veg/Non-Veg
  const filteredMeals = useMemo(() => {
    return allMeals.filter((meal) => {
      // 1. Case-insensitive cuisine validation
      if (activeCuisine !== "All" && meal.area) {
        if (meal.area.toLowerCase() !== activeCuisine.toLowerCase()) return false;
      }

      // 2. Search filtering
      if (searchTerm && searchTerm.trim() !== "") {
        if (!meal.name || !meal.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      }

      // 3. Veg / Non-Veg strict matching (handling boolean, string, or number mismatches)
      if (filter === "Veg") {
        return meal.isVeg === true || meal.isVeg === "true" || meal.isVeg === 1;
      }
      if (filter === "Non-Veg" || filter === "Non-veg") { // Case insensitive for filter name
        return meal.isVeg === false || meal.isVeg === "false" || meal.isVeg === 0;
      }

      return true;
    });
  }, [allMeals, activeCuisine, searchTerm, filter]);

  return (
    <div className="meal-list-page">
      <div className="meal-list-header">
        <h2>{filter} Meals</h2>
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Cuisine tabs */}
      <div className="cuisine-tabs">
        {["All", ...CUISINE_TABS].map((c) => (
          <button
            key={c}
            className={`cuisine-tab ${activeCuisine === c ? "active" : ""}`}
            onClick={() => setActiveCuisine(c)}
          >
            {CUISINE_LABELS[c] ? `${CUISINE_LABELS[c]} ${c}` : c}
          </button>
        ))}
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

      {/* Meal Content Area */}
      {loading ? (
        <div className="state-container">
          <div className="spinner"></div>
          <p className="state-text">Please wait... Meals are loading.</p>
        </div>
      ) : error ? (
        <div className="state-container">
          <p className="state-text error-text">{error}</p>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="state-container">
          <p className="state-text no-meals">
            {searchTerm
              ? `No meals found for "${searchTerm}".`
              : "No meals available for this selection."}
          </p>
        </div>
      ) : (
        <div className="meal-cards">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onSelect={() => onSelectMeal(meal)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MealList;
