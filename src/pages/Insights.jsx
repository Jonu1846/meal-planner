import React, { useState, useEffect, useMemo } from "react";
import { getAllPlannedMeals } from "../components/utils/api";
import "./insights.css"; // We'll create a simple CSS file for this next if needed, but going with inline/existing styles where possible.

function Insights() {
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchMeals = async () => {
            setLoading(true);
            const data = await getAllPlannedMeals();
            if (isMounted) {
                setMeals(data);
                setLoading(false);
            }
        };
        fetchMeals();
        return () => {
            isMounted = false;
        };
    }, []);

    // Compute Analytics using useMemo
    const analytics = useMemo(() => {
        if (!meals || meals.length === 0) return null;

        // Time boundaries
        const today = new Date();
        today.setHours(0, 0, 0, 0); // start of today
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); // Includes today + 6 previous days = 7 days

        // Initialize accumulators
        let totalCaloriesAllTime = 0;
        let totalCalories7Days = 0;
        let vegCount = 0;

        // Most eaten meal tracking map
        const mealFrequency = {};

        // Group calories by type
        const mealTypeStats = {
            breakfast: 0,
            lunch: 0,
            snack: 0,
            dinner: 0,
        };

        // Track unique days planned in the last 7 days using a Set
        const uniqueDays7Days = new Set();

        meals.forEach((meal) => {
            // Fix timezone shift: Force the date string to be parsed as local time by appending T00:00:00
            // This ensures "YYYY-MM-DD" is treated as local midnight, not UTC midnight.
            const dateStr = meal.meal_date.split("T")[0]; // "YYYY-MM-DD"
            const mealDate = new Date(dateStr + 'T00:00:00');
            mealDate.setHours(0, 0, 0, 0); // Ensure time is exactly midnight local

            const cal = Number(meal.calories) || 0;

            // 1. Total overall calories
            totalCaloriesAllTime += cal;

            // 2. Veg / Non-Veg
            if (meal.isVeg) {
                vegCount++;
            }

            // 3. Frequency Map
            if (meal.meal_name) {
                mealFrequency[meal.meal_name] = (mealFrequency[meal.meal_name] || 0) + 1;
            }

            // 4. Meal Type breakdown
            if (meal.meal_type && mealTypeStats[meal.meal_type] !== undefined) {
                mealTypeStats[meal.meal_type] += cal;
            }

            // 5. Last 7 Days specifics
            if (mealDate >= sevenDaysAgo && mealDate <= today) {
                totalCalories7Days += cal;
                // The date format YYYY-MM-DD from the DB is stable for a Set
                uniqueDays7Days.add(meal.meal_date.split("T")[0]);
            }
        });

        // Post-loop calculations
        const nonVegCount = meals.length - vegCount;
        // Math.round to 1 decimal place. Or fallback to 0.
        const vegPercentage = meals.length > 0 ? Math.round((vegCount / meals.length) * 100) : 0;

        // Find the most frequent meal
        let mostEatenMealName = "Nothing yet";
        let maxEatenTimes = 0;
        Object.entries(mealFrequency).forEach(([name, count]) => {
            if (count > maxEatenTimes) {
                mostEatenMealName = name;
                maxEatenTimes = count;
            }
        });

        // Averages (using unique days planned in the last 7 days to avoid dividing by empty days if desired, 
        // but standard average per day over exactly 7 calendar days is total / 7)
        // The requirement says: "Average calories per day (last 7 days)".
        const avgPerDay7Days = Math.round(totalCalories7Days / 7);

        return {
            totalCaloriesAllTime,
            totalCalories7Days,
            avgPerDay7Days,
            vegPercentage,
            vegCount,
            nonVegCount,
            daysPlanned7Days: uniqueDays7Days.size,
            mostEatenMealName,
            maxEatenTimes,
            mealTypeStats,
            totalMeals: meals.length
        };
    }, [meals]);

    if (loading) {
        return (
            <div className="insights-page">
                <h2>Analytics & Insights</h2>
                <div className="loading-placeholder">Loading your meal data...</div>
            </div>
        );
    }

    if (!analytics) { // analytics will be null if meals.length === 0
        return (
            <div className="insights-page" style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
                <h2 style={{ marginBottom: "20px", fontSize: "2rem", color: "#333" }}>Analytics & Insights</h2>
                <div className="empty-state">
                    <h3>No Meals Planned Yet</h3>
                    <p>Start planning some meals to see your analytics here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="insights-page" style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <h2 style={{ marginBottom: "20px", fontSize: "2rem", color: "#333" }}>Analytics & Insights</h2>

            {/* SECTION 1: Summary Cards */}
            <h3 style={{ textTransform: "uppercase", fontSize: "1rem", color: "#666", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                Summary (Last 7 Days)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "40px" }}>

                <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "5px", fontWeight: "bold" }}>Total Calories</div>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: "#e74c3c" }}>{analytics.totalCalories7Days.toLocaleString()}</div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>kcal</div>
                </div>

                <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "5px", fontWeight: "bold" }}>Daily Average</div>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: "#3498db" }}>{analytics.avgPerDay7Days.toLocaleString()}</div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>kcal / day</div>
                </div>

                <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "5px", fontWeight: "bold" }}>Consistency</div>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: "#2ecc71" }}>{analytics.daysPlanned7Days} <span style={{ fontSize: "1.2rem", color: "#aaa" }}>/ 7</span></div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>days planned</div>
                </div>

                <div style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", textAlign: "center" }}>
                    <div style={{ fontSize: "0.9rem", color: "#555", marginBottom: "5px", fontWeight: "bold" }}>Diet Type</div>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: "#9b59b6" }}>{analytics.vegPercentage}%</div>
                    <div style={{ fontSize: "0.8rem", color: "#888" }}>Vegetarian (All Time)</div>
                </div>
            </div>

            {/* SECTION 2: Meal Type Breakdown */}
            <h3 style={{ textTransform: "uppercase", fontSize: "1rem", color: "#666", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                Calorie Breakdown by Meal Type (All Time)
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "40px" }}>

                <div style={{ backgroundColor: "#fff5e6", padding: "20px", borderRadius: "10px", border: "1px solid #ffe8cc", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#e67e22", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        🍳 Breakfast
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", marginTop: "10px" }}>{analytics.mealTypeStats.breakfast.toLocaleString()} kcal</div>
                </div>

                <div style={{ backgroundColor: "#e8f6f3", padding: "20px", borderRadius: "10px", border: "1px solid #d1f2eb", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#1abc9c", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        🥪 Lunch
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", marginTop: "10px" }}>{analytics.mealTypeStats.lunch.toLocaleString()} kcal</div>
                </div>

                <div style={{ backgroundColor: "#ebf5fb", padding: "20px", borderRadius: "10px", border: "1px solid #d6eaf8", textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#2980b9", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        🥩 Dinner
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "900", marginTop: "10px" }}>{analytics.mealTypeStats.dinner.toLocaleString()} kcal</div>
                </div>

            </div>

            {/* SECTION 3: Most Eaten Meal */}
            <h3 style={{ textTransform: "uppercase", fontSize: "1rem", color: "#666", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                Favorites
            </h3>
            <div style={{ backgroundColor: "#f9fbfd", borderLeft: "4px solid #34495e", padding: "25px", borderRadius: "0 10px 10px 0" }}>
                <p style={{ fontSize: "1.3rem", color: "#2c3e50", margin: 0, lineHeight: "1.5" }}>
                    You eat <strong style={{ color: "#e74c3c" }}>{analytics.mostEatenMealName}</strong> most often.
                </p>
                <p style={{ fontSize: "0.9rem", color: "#7f8c8d", margin: "5px 0 0 0" }}>
                    Planned <strong>{analytics.maxEatenTimes}</strong> times in total.
                </p>
            </div>

        </div>
    );
}

export default Insights;
