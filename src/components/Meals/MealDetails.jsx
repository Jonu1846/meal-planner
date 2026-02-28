import React, { useEffect, useState } from "react";
import { fetchMealById } from "../utils/api";

function MealDetails({ mealId, mealName, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mealId) return;
    setLoading(true);
    fetchMealById(mealId).then((data) => {
      setDetails(data);
      setLoading(false);
    });
  }, [mealId]);

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="details-close-btn" onClick={onClose}>✕</button>

        {loading ? (
          <div className="details-loading">Loading details...</div>
        ) : !details ? (
          <div className="details-loading">Could not load details.</div>
        ) : (
          <>
            <h2 className="details-title">{details.name}</h2>

            {/* Meta row */}
            <div className="details-meta">
              <span className="details-badge cuisine">{details.area} Cuisine</span>
              <span className={`details-badge ${details.isVeg ? "veg" : "nonveg"}`}>
                {details.isVeg ? "🟢 Vegetarian" : "🔴 Non-Vegetarian"}
              </span>
              <span className="details-badge calories">🔥 {details.calories || "N/A"} kcal</span>
            </div>

            <div className="details-body">
              {/* Ingredients */}
              <div className="details-section">
                <h3>Ingredients</h3>
                <ul className="details-ingredients">
                  {details.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="details-section">
                <h3>How to Prepare</h3>
                <div className="details-instructions">
                  {details.instructions
                    .split(/\r?\n/)
                    .filter((line) => line.trim())
                    .map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MealDetails;
