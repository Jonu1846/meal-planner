/**
 * Converts a raw DB row from the backend into the meal shape used in the UI.
 *
 * Backend row shape:
 *   { id, meal_name, meal_type, meal_date, calories, isVeg }
 *
 * Normalized shape (used everywhere in the app):
 *   { id, name, image, mealTime, category, calories, date, isVeg }
 */
export const normalizeMealFromDB = (row) => ({
  id: row.id,                              // DB primary key (for update/delete)
  mealDbId: row.meal_id,                   // MealDB API primary key (for fetching details)
  name: row.meal_name,
  image: row.image || "",                  // backend doesn't store image — filled in later from MealDB if needed
  mealTime: row.meal_type,                 // "breakfast" | "lunch" | "snack" | "dinner"
  category: row.isVeg ? "Veg" : "Non-Veg",
  calories: row.calories || 0,
  date: row.meal_date ? row.meal_date.split("T")[0] : null, // Guarantee "YYYY-MM-DD" shape
  isVeg: Boolean(row.isVeg),
});

/**
 * Converts a MealDB API result (already mapped in api.js) into the same UI shape.
 * The MealDB result shape coming in:
 *   { id, name, image, category, area, isVeg }
 */
export const normalizeMealFromAPI = (meal) => ({
  id: null,                                // no DB id yet — assigned after addMeal()
  mealDbId: meal.id,                       // ID from MealDB API
  name: meal.name,
  image: meal.image || "",
  mealTime: null,                          // set by Planner when user picks a time slot
  category: meal.isVeg ? "Veg" : "Non-Veg",
  calories: meal.calories || 0,
  date: null,                              // set by Planner
  isVeg: Boolean(meal.isVeg),
});
