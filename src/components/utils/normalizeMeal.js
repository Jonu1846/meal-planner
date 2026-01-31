import { fetchMealById } from "./api";

export const normalizeMeal = async (meal, source = "API") => {
  /* =====================
     FROM API (Meal List)
  ===================== */
  if (source === "API") {
    return {
      id: String(meal.id),
      name: meal.name,
      image: meal.image,
      mealTime: meal.mealTime || "lunch",
      category: meal.category || "Veg",
      calories: meal.calories || 0,
      date: meal.date || null,
      source,
    };
  }

  /* =====================
     FROM BACKEND (MySQL)
  ===================== */
  if (source === "backend") {
    // 🔥 FORCE STRING (THIS FIXES IT)
    const mealApiId = String(meal.meal_id);

    const mealDetails = await fetchMealById(mealApiId);

    return {
      id: meal.id,                 // DB row ID
      mealApiId,                   // MealDB ID
      name: mealDetails?.name || "Unknown Meal",
      image: mealDetails?.image || "",
      mealTime: meal.meal_type,
      category: meal.is_veg ? "Veg" : "Non-Veg",
      calories: mealDetails?.calories || 0,
      date: meal.date,
      source,
    };
  }

  return {
    id: meal.id,
    name: meal.name || "Unnamed Meal",
    mealTime: meal.mealTime || "lunch",
    category: meal.category || "Veg",
    calories: meal.calories || 0,
    date: meal.date || null,
    source,
  };
};
