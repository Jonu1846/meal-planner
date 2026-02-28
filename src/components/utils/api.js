const BASE_URL = "http://localhost:5000/api/meals";

/* =========================================================
   BACKEND APIs — PLANNED MEALS (MySQL via Express)
   Table: planned_meals
   Fields: id, meal_name, meal_type, meal_date, calories, isVeg
========================================================= */

/**
 * Fetch all planned meals for a specific date (YYYY-MM-DD)
 */
export const getMealsByDate = async (date) => {
  try {
    const res = await fetch(`${BASE_URL}/date/${date}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch meals");
    // Backend returns an array directly; guard against unexpected shapes
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("getMealsByDate error:", err);
    return [];
  }
};

/**
 * Fetch ALL planned meals (used for Insights)
 */
export const getAllPlannedMeals = async () => {
  try {
    const res = await fetch(`${BASE_URL}/all`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch all meals");
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("getAllPlannedMeals error:", err);
    return [];
  }
};

/**
 * Add a new planned meal
 * @param {string} meal_name   - Meal name (from MealDB or custom)
 * @param {string} meal_type   - "breakfast" | "lunch" | "snack" | "dinner"
 * @param {string} meal_date   - "YYYY-MM-DD"
 * @param {number} calories    - Optional, defaults to 0
 * @param {boolean} isVeg      - Optional, defaults to false
 */
export const addMeal = async ({ meal_name, meal_type, meal_date, meal_id = null, calories = 0, isVeg = false }) => {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meal_name, meal_type, meal_date, meal_id, calories, isVeg }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add meal");
    return data; // { id, meal_name, meal_type, meal_date, calories, isVeg }
  } catch (err) {
    console.error("addMeal error:", err);
    return null;
  }
};

/**
 * Update an existing planned meal by DB row id
 */
export const updateMeal = async (id, { meal_name, meal_type, meal_date, meal_id, calories = 0, isVeg = false }) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meal_name, meal_type, meal_date, meal_id, calories, isVeg }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update meal");
    return data;
  } catch (err) {
    console.error("updateMeal error:", err);
    return null;
  }
};

/**
 * Delete a planned meal by DB row id
 */
export const deleteMeal = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete meal");
    return data;
  } catch (err) {
    console.error("deleteMeal error:", err);
    return null;
  }
};

/* =========================================================
   EXTERNAL API — MEAL SEARCH (TheMealDB)
   Used for MealList search screen
========================================================= */

const isVegMeal = (category = "") => {
  const c = category.toLowerCase();
  return (
    !c.includes("chicken") &&
    !c.includes("beef") &&
    !c.includes("lamb") &&
    !c.includes("pork") &&
    !c.includes("fish") &&
    !c.includes("seafood")
  );
};

// The 4 visible tabs the user sees
export const CUISINE_TABS = ["Japanese", "Chinese", "American", "Indian"];

// Extra real-world cuisines fetched from MealDB and grouped into one of the 4 tabs.
// This gives more dishes without adding new tabs.
const CUISINE_SOURCES = [
  // Japanese tab
  { fetch: "Japanese", tab: "Japanese" },

  // Chinese tab — also pull Korean as it's closest culinarily
  { fetch: "Chinese", tab: "Chinese" },
  { fetch: "Korean", tab: "Chinese" },

  // American tab — also pull Canadian, British, Irish
  { fetch: "American", tab: "American" },
  { fetch: "Canadian", tab: "American" },
  { fetch: "British", tab: "American" },
  { fetch: "Irish", tab: "American" },

  // Indian tab — also pull Moroccan, Turkish, Malaysian as spiced cuisines
  { fetch: "Indian", tab: "Indian" },
  { fetch: "Malaysian", tab: "Indian" },
  { fetch: "Turkish", tab: "Indian" },
];

/**
 * Fetch meals from all cuisine sources and group them under the 4 visible tabs.
 * Uses filter.php?a= (returns id + name + thumbnail only).
 * Results are deduplicated by meal id.
 */
export const fetchMealsByCuisines = async () => {
  try {
    const results = await Promise.all(
      CUISINE_SOURCES.map(({ fetch: area, tab }) =>
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`)
          .then((r) => r.json())
          .then((data) =>
            (data.meals || []).map((meal) => ({
              id: meal.idMeal,
              name: meal.strMeal,
              area: tab,           // show under this tab
              realArea: area,      // actual origin for display
              isVeg: null,         // resolved lazily in MealList
              category: "",
            }))
          )
          .catch(() => [])
      )
    );

    // Flatten + deduplicate by id (keep first occurrence)
    const seen = new Set();
    return results.flat().filter((meal) => {
      if (seen.has(meal.id)) return false;
      seen.add(meal.id);
      return true;
    });
  } catch (err) {
    console.error("fetchMealsByCuisines error:", err);
    return [];
  }
};

export const fetchMealDetails = async (ids = []) => {
  const map = {};
  // Process sequentially to prevent browser origin connection limits 
  // and API 429 errors from dropping late-stage items (like Indian meals)
  for (const id of ids) {
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
      if (!r.ok) throw new Error("API rate limited");
      const data = await r.json();
      if (data.meals?.[0]) {
        const m = data.meals[0];
        map[id] = {
          category: m.strCategory,
          isVeg: isVegMeal(m.strCategory),
        };
      }
    } catch (err) {
      console.warn(`Skipped details for ${id}`);
    }
  }
  return map;
};

/**
 * Fetch full meal details by MealDB ID.
 * Returns name, category, area, ingredients list, instructions, youtube link.
 * MealDB does not provide calories or cook time — we estimate cook time from
 * instruction length as a rough heuristic.
 */
export const fetchMealById = async (mealId) => {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    const data = await res.json();
    if (!data.meals) return null;

    const m = data.meals[0];

    // Extract up to 20 ingredient+measure pairs
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = m[`strIngredient${i}`]?.trim();
      const measure = m[`strMeasure${i}`]?.trim();
      if (ingredient) {
        ingredients.push(measure ? `${measure} ${ingredient}` : ingredient);
      }
    }

    // Rough cook time estimate based on instruction word count
    const wordCount = (m.strInstructions || "").split(/\s+/).length;
    const estimatedMinutes = Math.max(15, Math.min(120, Math.round(wordCount / 10) * 5));

    return {
      id: m.idMeal,
      name: m.strMeal,
      image: m.strMealThumb,
      category: m.strCategory,
      area: m.strArea,
      isVeg: isVegMeal(m.strCategory),
      calories: 0,
      ingredients,
      instructions: m.strInstructions || "",
      cookTime: estimatedMinutes,
      youtube: m.strYoutube || "",
    };
  } catch (err) {
    console.error("fetchMealById error:", err);
    return null;
  }
};
