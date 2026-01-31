import React from "react";
import "./calendar.css";

function Calendar({
  dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  daysInMonth = 0,
  firstDayOfMonth = 0,
  todayDate,
  selectedMeals,
  selectedDate,
  handleDateClick,
  setPopupDate,
  setWarningMessage,
  setShowWarningPopup,
}) {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  return (
    <div className="calendar-container bg-image">
      <div className="calendar-header">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={i} className="calendar-cell empty"></div>
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateKey = new Date(currentYear, currentMonth, day)
            .toISOString()
            .split("T")[0];

          const mealsForDay = selectedMeals[dateKey] || {};
          const hasMeals = Object.keys(mealsForDay).length > 0;
          const isSelected = selectedDate === day;
          const isToday = day === todayDate;

          const thisDate = new Date(currentYear, currentMonth, day);
          const todayDateObj = new Date(currentYear, currentMonth, currentDay);
          const isPast = thisDate < todayDateObj;

          return (
            <div
              key={day}
              className={`calendar-cell
                ${isSelected ? "selected" : ""}
                ${isToday ? "today" : ""}
                ${hasMeals ? "has-meals" : ""}
                ${isPast ? "past-date" : ""}`}
              onClick={() => {
                if (isPast) {
                  setWarningMessage("You cannot add meals for past dates!");
                  setShowWarningPopup(true);
                  return;
                }

                if (hasMeals) {
                  setWarningMessage(
                    "Meal(s) already planned. Click the icon 🍽 to update or plan other slots."
                  );
                  setShowWarningPopup(true);
                  return;
                }

                handleDateClick(day);
              }}
            >
              <span className="date-number">{day}</span>

              {hasMeals && (
                <div
                  className="meal-indicators"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPast) {
                      setWarningMessage("You cannot add meals for past dates!");
                      setShowWarningPopup(true);
                      return;
                    }
                    setPopupDate(day);
                  }}
                >
                  🍽
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
