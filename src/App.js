import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Planner from "./pages/Planner";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";

import Layout from "./components/layout/Layout";
import MealPopup from "./components/Popup/MealPopup";
import WarningPopup from "./components/Popup/WarningPopup";

import "./components/styles/layout.css"; // ensure this exists

function App() {

  // Popup states
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMealPopup, setShowMealPopup] = useState(false);
  const [showWarningPopup, setShowWarningPopup] = useState(false);

  const [selectedMeals] = useState({});

  const todayDate = new Date().getDate();

  const handleDateClick = (day) => {
    if (day < todayDate) {
      setShowWarningPopup(true);
    } else {
      setSelectedDate(day);
      setShowMealPopup(true);
    }
  };

  return (
    <Router>

      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/planner"
          element={
            <Layout>
              <Planner
                todayDate={todayDate}
                selectedMeals={selectedMeals}
                selectedDate={selectedDate}
                handleDateClick={handleDateClick}
              />
            </Layout>
          }
        />

        <Route
          path="/insights"
          element={
            <Layout>
              <Insights />
            </Layout>
          }
        />

        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
      </Routes>

      {/* Popups */}
      {showMealPopup && selectedDate && (
        <MealPopup
          date={selectedDate}
          selectedMeals={selectedMeals}
          onClose={() => setShowMealPopup(false)}
        />
      )}

      {showWarningPopup && (
        <WarningPopup onClose={() => setShowWarningPopup(false)} />
      )}
    </Router>
  );
}

export default App;
