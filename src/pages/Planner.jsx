import { useState, useEffect } from "react";
import Calendar from "../components/Calendar/Calendar";
import MealPopup from "../components/Popup/MealPopup";
import MealList from "../components/Meals/MealList";
import MealDetails from "../components/Meals/MealDetails";
import WarningPopup from "../components/Popup/WarningPopup";

import {
  getPlannedMeals,
  addPlannedMeal,
  updatePlannedMeal,
} from "../components/utils/api";
import { normalizeMeal } from "../components/utils/normalizeMeal";

import "../components/Popup/popup.css";
import "../components/Meals/meals.css";

function Planner() {
  const [plannedMealsByDate, setPlannedMealsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupDate, setPopupDate] = useState(null);

  const [selectedMealTime, setSelectedMealTime] = useState(null);
  const [mealTypeChoice, setMealTypeChoice] = useState(null);

  const [currentView, setCurrentView] = useState("calendar");
  const [mealForDetails, setMealForDetails] = useState(null);

  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [showMealTimePopup, setShowMealTimePopup] = useState(false);
  const [showMealTypePopup, setShowMealTypePopup] = useState(false);

  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const today = new Date();
  const todayDate = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* ----------------------
     Reset Flow
  ---------------------- */
  const resetFlow = () => {
    setShowMealTimePopup(false);
    setShowMealTypePopup(false);
    setMealForDetails(null);
    setSelectedMealTime(null);
    setMealTypeChoice(null);
    setCurrentView("calendar");
    setSearchTerm("");
  };

  /* ----------------------
     Fetch backend meals
  ---------------------- */
  useEffect(() => {
    const fetchAllPlannedMeals = async () => {
      try {
        const allMeals = await getPlannedMeals();

        const normalized = [];
        for (let m of allMeals) {
          const meal = await normalizeMeal(m, "backend"); // <-- await here
          normalized.push(meal);
        }

        const grouped = {};
        normalized.forEach((meal) => {
          if (!meal.date) return;
          const dateKey = new Date(meal.date).toISOString().split("T")[0];
          if (!grouped[dateKey]) grouped[dateKey] = {};
          grouped[dateKey][meal.mealTime] = meal;
        });

        setPlannedMealsByDate(grouped);
      } catch (err) {
        console.error("Failed to fetch planned meals:", err);
      }
    };

    fetchAllPlannedMeals();
  }, []);

  /* ----------------------
     Calendar click
  ---------------------- */
  const handleDateClick = (day) => {
    const dateKey = new Date(year, month, day).toISOString().split("T")[0];
    const mealsForDay = plannedMealsByDate[dateKey] || {};
    if (Object.keys(mealsForDay).length > 0) {
      setWarningMessage(
        "Meal(s) already planned. Click the 🍽 icon to update or plan other slots."
      );
      setShowWarningPopup(true);
      return;
    }
    setSelectedDate(day);
    setShowMealTimePopup(true);
  };

  /* ----------------------
     Meal Time -> Meal Type
  ---------------------- */
  const handleMealTimeSelect = (time) => {
    setSelectedMealTime(time);
    setShowMealTimePopup(false);
    setShowMealTypePopup(true);
  };

  const handleMealTypeSelect = (type) => {
    setMealTypeChoice(type);
    setFilter(type);

    setShowPopup(false);
    setShowMealTypePopup(false);
    setCurrentView("mealList");
  };

  /* ----------------------
     Persist selection to backend
  ---------------------- */
  const handleStartSelection = async (meal) => {
    const targetDate = popupDate ?? selectedDate;
    const dateKey = new Date(year, month, targetDate).toISOString().split("T")[0];

    const normalizedMeal = await normalizeMeal(
      {
        ...meal,
        mealTime: selectedMealTime,
        category: mealTypeChoice,
        date: dateKey,
      },
      "API"
    );

    try {
      const existingMeal = plannedMealsByDate[dateKey]?.[selectedMealTime];

      if (existingMeal) {
        await updatePlannedMeal(existingMeal.id, {
          date: dateKey,
          meal_type: selectedMealTime,
          meal_id: normalizedMeal.id,
          is_veg: normalizedMeal.category === "Veg",
        });
      } else {
        await addPlannedMeal({
          date: dateKey,
          meal_type: selectedMealTime,
          meal_id: normalizedMeal.id,
          is_veg: normalizedMeal.category === "Veg",
        });
      }

      // Refresh all planned meals
      const allMeals = await getPlannedMeals();

      const normalizedAll = [];
      for (let m of allMeals) {
        const meal = await normalizeMeal(m, "backend");
        normalizedAll.push(meal);
      }

      const grouped = {};
      normalizedAll.forEach((m) => {
        if (!m.date) return;
        const key = new Date(m.date).toISOString().split("T")[0];
        if (!grouped[key]) grouped[key] = {};
        grouped[key][m.mealTime] = m;
      });
      setPlannedMealsByDate(grouped);

      setCurrentView("calendar");
      setSearchTerm("");
    } catch (err) {
      console.error("Failed to persist meal:", err);
    }
  };

  /* ----------------------
     Popup actions
  ---------------------- */
  const handleViewMealFromPopup = (meal) => setMealForDetails(meal);
  const handleAddOrChangeFromPopup = (time) => {
    setSelectedMealTime(time);
    setShowMealTypePopup(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      {currentView === "calendar" && (
        <Calendar
          selectedDate={selectedDate}
          selectedMeals={plannedMealsByDate}
          todayDate={todayDate}
          firstDayOfMonth={firstDayOfMonth}
          daysInMonth={daysInMonth}
          dayNames={dayNames}
          handleDateClick={handleDateClick}
          setPopupDate={(d) => {
            setPopupDate(d);
            setShowPopup(true);
          }}
          setWarningMessage={setWarningMessage}
          setShowWarningPopup={setShowWarningPopup}
        />
      )}

      {currentView === "mealList" && (selectedDate || popupDate) && (
        <MealList
          filter={filter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSelectMeal={handleStartSelection}
          onBack={resetFlow}
        />
      )}

      {showPopup && popupDate && (
        <MealPopup
          date={popupDate}
          selectedMeals={plannedMealsByDate}
          onClose={() => setShowPopup(false)}
          onViewMeal={handleViewMealFromPopup}
          onAddOrChange={handleAddOrChangeFromPopup}
        />
      )}

      {showMealTimePopup && selectedDate && (
        <div className="small-popup-overlay">
          <div className="small-popup">
            <h4>Select Meal Time</h4>
            {["breakfast", "lunch", "snack", "dinner"].map((time) => (
              <button key={time} onClick={() => handleMealTimeSelect(time)}>
                {time}
              </button>
            ))}
            <button onClick={resetFlow}>Cancel</button>
          </div>
        </div>
      )}

      {showMealTypePopup && (
        <div className="small-popup-overlay">
          <div className="small-popup">
            <h4>Select Meal Type</h4>
            <button onClick={() => handleMealTypeSelect("Veg")}>Veg</button>
            <button onClick={() => handleMealTypeSelect("Non-Veg")}>
              Non-Veg
            </button>
            <button onClick={resetFlow}>Cancel</button>
          </div>
        </div>
      )}

      {mealForDetails && (
        <div className="small-popup-overlay">
          <div className="small-popup">
            <MealDetails meal={mealForDetails} onBack={resetFlow} />
          </div>
        </div>
      )}

      {showWarningPopup && (
        <WarningPopup
          message={warningMessage}
          onClose={() => setShowWarningPopup(false)}
        />
      )}
    </div>
  );
}

export default Planner;
