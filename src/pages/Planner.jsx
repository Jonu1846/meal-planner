import { useState } from "react";

import Calendar from "../components/Calendar/Calendar";
import MealPopup from "../components/Popup/MealPopup";
import MealList from "../components/Meals/MealList";
import MealDetails from "../components/Meals/MealDetails";
import WarningPopup from "../components/Popup/WarningPopup";

import "../components/Popup/popup.css";
import "../components/Meals/meals.css";

function Planner() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMealTime, setSelectedMealTime] = useState(null);
  const [mealTypeChoice, setMealTypeChoice] = useState(null);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [popupDate, setPopupDate] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [showMealTimePopup, setShowMealTimePopup] = useState(false);
  const [showMealTypePopup, setShowMealTypePopup] = useState(false);

  const [currentView, setCurrentView] = useState("calendar");
  const [mealForDetails, setMealForDetails] = useState(null);

  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Warning Popup
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const meals = [
    { id: 1, name: "Idli", type: "Veg", calories: 120 },
    { id: 2, name: "Chicken Rice", type: "Non-Veg", calories: 350 },
    { id: 3, name: "Paneer Butter Masala", type: "Veg", calories: 250 },
    { id: 4, name: "Fish Curry", type: "Non-Veg", calories: 300 },
  ];

  const today = new Date();
  const todayDate = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 🔑 SINGLE RESET POINT
  const resetFlow = () => {
    setShowPopup(false);
    setShowMealTimePopup(false);
    setShowMealTypePopup(false);
    setMealForDetails(null);
    setPopupDate(null);
    setSelectedDate(null);
    setSelectedMealTime(null);
    setMealTypeChoice(null);
    setCurrentView("calendar");
    setSearchTerm("");
  };

  // 📅 Calendar date click → always reset
  const handleDateClick = (day) => {
    resetFlow();
    setSelectedDate(day);
    setShowMealTimePopup(true);
  };

  const handleMealTimeSelect = (time) => {
    setSelectedMealTime(time);
    setShowMealTimePopup(false);
    setShowMealTypePopup(true);
  };

  const handleMealTypeSelect = (type) => {
    setMealTypeChoice(type);
    setFilter(type);
    setShowMealTypePopup(false);
    setCurrentView("mealList");
  };

  const handleStartSelection = (meal) => {
    setSelectedMeals((prev) => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [selectedMealTime]: meal,
      },
    }));
    resetFlow();
  };

  // 👁 View meal → force close everything else
  const handleViewMealFromPopup = (meal) => {
    resetFlow();
    setMealForDetails(meal);
  };

  const handleAddOrChangeFromPopup = (time) => {
    resetFlow();
    setSelectedDate(popupDate);
    setSelectedMealTime(time);
    setShowMealTypePopup(true);
  };

  return (
    <div style={{ padding: "20px" }}>
      {currentView === "calendar" && (
        <Calendar
          selectedDate={selectedDate}
          selectedMeals={selectedMeals}
          todayDate={todayDate}
          firstDayOfMonth={firstDayOfMonth}
          daysInMonth={daysInMonth}
          dayNames={dayNames}
          handleDateClick={handleDateClick}
          setPopupDate={(d) => {
            resetFlow();
            setPopupDate(d);
            setShowPopup(true);
          }}
          setShowPopup={setShowPopup}
          setWarningMessage={setWarningMessage}
          setShowWarningPopup={setShowWarningPopup}
        />
      )}

      {currentView === "mealList" && (
        <MealList
          meals={meals}
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
          selectedMeals={selectedMeals}
          onClose={resetFlow}
          onViewMeal={handleViewMealFromPopup}
          onAddOrChange={handleAddOrChangeFromPopup}
        />
      )}

      {showMealTimePopup && selectedDate && (
        <div className="small-popup-overlay">
          <div className="small-popup">
            <h4>Select Meal Time</h4>
            {["morning", "afternoon", "snack", "dinner"].map((time) => (
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
