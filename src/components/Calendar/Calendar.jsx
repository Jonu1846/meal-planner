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
      {/* Day Names */}
      <div className="calendar-header">
        {dayNames.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={i} className="calendar-cell empty"></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const mealsForDay = selectedMeals[day];
          const hasMeals = mealsForDay && Object.keys(mealsForDay).length > 0;

          const isSelected = selectedDate === day;
          const isToday = day === todayDate;

          const thisDate = new Date(currentYear, currentMonth, day);
          const todayDateObj = new Date(
            currentYear,
            currentMonth,
            currentDay
          );
          const isPast = thisDate < todayDateObj;

          return (
            <div
              key={day}
              className={`calendar-cell
                ${isSelected ? "selected" : ""}
                ${isToday ? "today" : ""}
                ${hasMeals ? "has-meals" : ""}
                ${isPast ? "past-date" : ""}
              `}
              onClick={() => {
                if (isPast) {
                  setWarningMessage(
                    "You cannot add meals for past dates!"
                  );
                  setShowWarningPopup(true);
                  return;
                }
                handleDateClick(day);
              }}
            >
              {/* Date */}
              <span className="date-number">{day}</span>

              {/* Existing meals indicator */}
              {hasMeals && (
                <div
                  className="meal-indicators"
                  onClick={(e) => {
                    e.stopPropagation();

                    if (isPast) {
                      setWarningMessage(
                        "You cannot add meals for past dates!"
                      );
                      setShowWarningPopup(true);
                      return;
                    }

                    // 🔑 Just signal intent
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
