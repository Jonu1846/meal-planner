const BASE_URL = "http://localhost:5000"; // backend base url

/* =========================================================
   BACKEND APIs — PLANNED MEALS
   Stores ONLY planning data (date, time, meal_id, veg)
========================================================= */

/**
 * Fetch all planned meals
 * Optional filter by date (YYYY-MM-DD)
 */
export const getPlannedMeals = async (date = "") => {
  try {
    const res = await fetch(
      `${BASE_URL}/planned-meals${date ? `?date=${date}` : ""}`
    );

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch planned meals");
    }

    return data.meals || [];
  } catch (err) {
    console.error("Error in getPlannedMeals:", err);
    return [];
  }
};

/**
 * Add a new planned meal
 * meal_id comes from external API
 */
export const addPlannedMeal = async ({
  date,
  meal_type,
  meal_id,
  is_veg,
}) => {
  try {
    const res = await fetch(`${BASE_URL}/planned-meals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        meal_type,
        meal_id,
        is_veg,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to add planned meal");
    }

    return data;
  } catch (err) {
    console.error("Error in addPlannedMeal:", err);
    return null;
  }
};

/**
 * Update existing planned meal
 */
export const updatePlannedMeal = async (
  plannedMealId,
  { date, meal_type, meal_id, is_veg }
) => {
  try {
    const res = await fetch(`${BASE_URL}/planned-meals/${plannedMealId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        meal_type,
        meal_id,
        is_veg,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to update planned meal");
    }

    return data;
  } catch (err) {
    console.error("Error in updatePlannedMeal:", err);
    return null;
  }
};

/* =========================================================
   EXTERNAL API — MEAL SEARCH (MealDB)
   Used for MealList screen
========================================================= */

/**
 * Search meals from MealDB
 */
export const fetchMealsFromAPI = async (searchTerm = "") => {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
    );

    const data = await res.json();
    if (!data.meals) return [];

    return data.meals.map((meal) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      isVeg:
        !meal.strCategory?.toLowerCase().includes("chicken") &&
        !meal.strCategory?.toLowerCase().includes("beef") &&
        !meal.strCategory?.toLowerCase().includes("fish"),
    }));
  } catch (err) {
    console.error("Error in fetchMealsFromAPI:", err);
    return [];
  }
};

/* =========================================================
   EXTERNAL API — SINGLE MEAL FETCH BY ID
   Used for popup + calendar rendering
========================================================= */

/**
 * Fetch full meal details by ID
 */
export const fetchMealById = async (mealId) => {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );

    const data = await res.json();
    if (!data.meals) return null;

    const meal = data.meals[0];

    return {
      id: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      category: meal.strCategory,
      isVeg:
        !meal.strCategory?.toLowerCase().includes("chicken") &&
        !meal.strCategory?.toLowerCase().includes("beef") &&
        !meal.strCategory?.toLowerCase().includes("fish"),
      calories: 0, // optional placeholder
    };
  } catch (err) {
    console.error("Error in fetchMealById:", err);
    return null;
  }
};
