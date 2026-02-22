import { useState } from "react";
import Calendar from "../components/Calendar/Calendar";
import MealPopup from "../components/Popup/MealPopup";
import MealList from "../components/Meals/MealList";
import MealDetails from "../components/Meals/MealDetails";
import WarningPopup from "../components/Popup/WarningPopup";

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
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
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
     Calendar click
  ---------------------- */
  const handleDateClick = (day) => {
    const dateKey = new Date(year, month, day).toISOString().split("T")[0];
    const mealsForDay = plannedMealsByDate[dateKey] || {};

    if (Object.keys(mealsForDay).length > 0) {
      setWarningMessage(
        "Meal(s) already planned. Click the 🍽 icon to update or view."
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

  // 🔑 CLOSE ALL POPUPS BEFORE MOVING FORWARD
  setShowMealTypePopup(false);
  setShowMealTimePopup(false);
  setShowPopup(false);
  setPopupDate(null);

  setCurrentView("mealList");
};


  /* ----------------------
     Save meal LOCALLY (KEY FIX)
  ---------------------- */
  const handleStartSelection = (meal) => {
    const targetDate = popupDate ?? selectedDate;
    const dateKey = new Date(year, month, targetDate)
      .toISOString()
      .split("T")[0];

    setPlannedMealsByDate((prev) => ({
      ...prev,
      [dateKey]: {
        ...(prev[dateKey] || {}),
        [selectedMealTime]: {
          ...meal,
          mealTime: selectedMealTime,
          category: mealTypeChoice,
          date: dateKey,
        },
      },
    }));

    setCurrentView("calendar");
    setSearchTerm("");
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

  /* 🔑 ADD THESE TWO LINES */
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
