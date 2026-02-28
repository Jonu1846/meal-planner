import { useState, useEffect, useCallback } from "react";
import Calendar from "../components/Calendar/Calendar";
import MealPopup from "../components/Popup/MealPopup";
import MealList from "../components/Meals/MealList";
import MealDetails from "../components/Meals/MealDetails";
import WarningPopup from "../components/Popup/WarningPopup";
import Sidebar from "../components/Sidebar/Sidebar";
import { getMealsByDate, addMeal, updateMeal } from "../components/utils/api";
import { normalizeMealFromDB } from "../components/utils/normalizeMeal";

import "../components/Popup/popup.css";
import "../components/Meals/meals.css";

function Planner() {
  const [plannedMealsByDate, setPlannedMealsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [popupDate, setPopupDate] = useState(null);
  // Locked-in date for the active meal selection flow — set when user picks a date,
  // never cleared until resetFlow so MealList always has a target date to save to
  const [targetDateKey, setTargetDateKey] = useState(null);

  const [selectedMealTime, setSelectedMealTime] = useState(null);
  const [mealTypeChoice, setMealTypeChoice] = useState(null);
  const [selectedMealDetails, setSelectedMealDetails] = useState(null);

  const [currentView, setCurrentView] = useState("calendar");

  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [showMealTimePopup, setShowMealTimePopup] = useState(false);
  const [showMealTypePopup, setShowMealTypePopup] = useState(false);

  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date()); // Active view month/year
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Handlers for month navigation
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    setTargetDateKey(null);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
    setTargetDateKey(null);
  };

  // Stable string key for the current month so the load effect only fires once
  const monthKey = `${year}-${month}`;

  /* -------------------------------------------------------
     Load meals for a specific date from the backend
     and merge into plannedMealsByDate state
  ------------------------------------------------------- */
  const loadMealsForDate = useCallback(async (dateKey) => {
    const rows = await getMealsByDate(dateKey);
    if (!Array.isArray(rows) || rows.length === 0) return;

    const validSlots = ["breakfast", "lunch", "snack", "dinner"];
    const mealsBySlot = {};

    rows.forEach((row) => {
      const normalized = normalizeMealFromDB(row);
      // Only add rows that have a recognised meal_type
      if (normalized.mealTime && validSlots.includes(normalized.mealTime)) {
        mealsBySlot[normalized.mealTime] = normalized;
      }
    });

    if (Object.keys(mealsBySlot).length === 0) return;

    setPlannedMealsByDate((prev) => ({
      ...prev,
      [dateKey]: mealsBySlot,
    }));
  }, []);

  /* -------------------------------------------------------
     On mount (once per month): load all meals so calendar
     icons appear immediately. monthKey is stable — won't
     re-fire on every render.
  ------------------------------------------------------- */
  useEffect(() => {
    const loadWholeMonth = async () => {
      const days = new Date(year, month + 1, 0).getDate();
      const promises = [];
      for (let day = 1; day <= days; day++) {
        const localMonth = String(month + 1).padStart(2, "0");
        const localDay = String(day).padStart(2, "0");
        const dateKey = `${year}-${localMonth}-${localDay}`;
        promises.push(loadMealsForDate(dateKey));
      }
      await Promise.all(promises);
    };
    loadWholeMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey]);

  /* -------------------------------------------------------
     Reset flow
  ------------------------------------------------------- */
  const resetFlow = () => {
    setShowMealTimePopup(false);
    setShowMealTypePopup(false);
    setSelectedMealTime(null);
    setMealTypeChoice(null);
    setTargetDateKey(null);
    setCurrentView("calendar");
    setSearchTerm("");
  };

  /* -------------------------------------------------------
     Calendar date click
  ------------------------------------------------------- */
  const handleDateClick = (day) => {
    // Fix UTC shift: construct YYYY-MM-DD manually in local time
    const localMonth = String(month + 1).padStart(2, "0");
    const localDay = String(day).padStart(2, "0");
    const dateKey = `${year}-${localMonth}-${localDay}`;
    const mealsForDay = plannedMealsByDate[dateKey] || {};

    if (Object.keys(mealsForDay).length > 0) {
      setWarningMessage(
        "Meal(s) already planned. Click the 🍽 icon to update or view."
      );
      setShowWarningPopup(true);
      return;
    }

    setSelectedDate(day);
    setTargetDateKey(dateKey);
    setShowMealTimePopup(true);
  };

  /* -------------------------------------------------------
     Meal Time → Meal Type
  ------------------------------------------------------- */
  const handleMealTimeSelect = (time) => {
    setSelectedMealTime(time);
    setShowMealTimePopup(false);
    setShowMealTypePopup(true);
  };

  const handleMealTypeSelect = (type) => {
    setMealTypeChoice(type);
    setFilter(type);
    setShowMealTypePopup(false);
    setShowMealTimePopup(false);
    setShowPopup(false);

    // Lock in the target date before clearing popupDate
    if (popupDate) setTargetDateKey(popupDate);

    setPopupDate(null);
    setCurrentView("mealList");
  };

  /* -------------------------------------------------------
     Save selected meal → backend + local state
  ------------------------------------------------------- */
  const handleStartSelection = async (meal) => {
    const dateKey = targetDateKey;

    const isVeg = mealTypeChoice === "Veg";
    const existingMeals = plannedMealsByDate[dateKey] || {};
    const existingEntry = existingMeals[selectedMealTime];

    let savedMeal;

    if (existingEntry?.id) {
      // Slot already has a DB record — update it
      const updated = await updateMeal(existingEntry.id, {
        meal_name: meal.name,
        meal_type: selectedMealTime,
        meal_date: dateKey,
        meal_id: meal.mealDbId || meal.id,
        calories: meal.calories || 0,
        isVeg,
      });

      savedMeal = updated
        ? {
          ...meal,
          id: existingEntry.id,   // DB row id (for update/delete)
          mealDbId: meal.id,      // MealDB API id (for fetching details)
          mealTime: selectedMealTime,
          category: mealTypeChoice,
          date: dateKey,
          isVeg,
        }
        : null;
    } else {
      // New slot — insert into DB
      const created = await addMeal({
        meal_name: meal.name,
        meal_type: selectedMealTime,
        meal_date: dateKey,
        meal_id: meal.mealDbId || meal.id,
        calories: meal.calories || 0,
        isVeg,
      });

      savedMeal = created
        ? {
          ...meal,
          id: created.id,         // DB row id (for update/delete)
          mealDbId: meal.id,      // MealDB API id (for fetching details)
          mealTime: selectedMealTime,
          category: mealTypeChoice,
          date: dateKey,
          isVeg,
        }
        : null;
    }

    if (!savedMeal) {
      setWarningMessage("Failed to save meal. Is the backend running?");
      setShowWarningPopup(true);
      resetFlow();
      return;
    }

    setPlannedMealsByDate((prev) => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [selectedMealTime]: savedMeal,
      },
    }));

    setCurrentView("calendar");
    setSearchTerm("");
  };

  /* -------------------------------------------------------
     Popup actions
  ------------------------------------------------------- */
  const handleAddOrChangeFromPopup = (time) => {
    setSelectedMealTime(time);
    setShowMealTypePopup(true);
  };

  const handleViewDetails = (meal) => {
    setShowPopup(false); // Close the calendar popup to enforce single-popup rule
    setSelectedMealDetails(meal);
  };

  return (
    <div style={{ padding: "40px 20px", minHeight: "100vh", background: "linear-gradient(135deg, #0F172A, #1E3A5F)" }}>

      {/* Sidebar — receives real meal data */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        plannedMealsByDate={plannedMealsByDate}
      />

      {/* Floating toggle button for the sidebar */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "fixed", top: "15px", left: "20px",
            zIndex: 1100, // Above navbar
            background: "linear-gradient(135deg, #1e3c72, #2a5298)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: "72px", height: "72px",
            fontSize: "42px",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(30,60,114,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
          title="Open Planner Panel"
        >
          🍔
        </button>
      )}
      {currentView === "calendar" && (
        <Calendar
          currentMonth={month}
          currentYear={year}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          selectedDate={selectedDate}
          selectedMeals={plannedMealsByDate}
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

      {currentView === "mealList" && targetDateKey && (
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
          onAddOrChange={handleAddOrChangeFromPopup}
          onViewDetails={handleViewDetails}
        />
      )}

      {selectedMealDetails && (
        <MealDetails
          mealId={selectedMealDetails.mealDbId || selectedMealDetails.id}
          mealName={selectedMealDetails.name}
          onClose={() => setSelectedMealDetails(null)}
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
