import React from "react";
import "./calendar.css";

function Calendar({
  dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  daysInMonth = 0,
  firstDayOfMonth = 0,
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  selectedMeals,
  selectedDate,
  handleDateClick,
  setPopupDate,
  setWarningMessage,
  setShowWarningPopup,
}) {
  const realToday = new Date();
  const realCurrentDay = realToday.getDate();
  const realCurrentMonth = realToday.getMonth();
  const realCurrentYear = realToday.getFullYear();

  // Determine if the previous month should be disabled
  const isPrevDisabled =
    currentYear < realCurrentYear ||
    (currentYear === realCurrentYear && currentMonth <= realCurrentMonth);

  return (
    <div className="calendar-container bg-image">
      {/* Month Navigation Header */}
      <div className="month-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", marginBottom: "15px", background: "rgba(255, 255, 255, 0.9)", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <button
          className="nav-arrow"
          onClick={onPrevMonth}
          disabled={isPrevDisabled}
          style={{
            padding: "8px 16px",
            cursor: isPrevDisabled ? "not-allowed" : "pointer",
            border: "none",
            background: "#ff8c5a",
            color: "white",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            transition: "0.2s",
            opacity: isPrevDisabled ? 0.35 : 1
          }}
        >
          ◀
        </button>
        <h2 style={{ margin: 0, fontSize: "22px", color: "#333", fontWeight: "700" }}>
          {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })} {currentYear}
        </h2>
        <button className="nav-arrow" onClick={onNextMonth} style={{ padding: "8px 16px", cursor: "pointer", border: "none", background: "#ff8c5a", color: "white", borderRadius: "8px", fontSize: "16px", fontWeight: "bold", transition: "0.2s" }}>
          ▶
        </button>
      </div>

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

          // Fix UTC shift: construct YYYY-MM-DD manually in local time
          const localMonth = String(currentMonth + 1).padStart(2, "0");
          const localDay = String(day).padStart(2, "0");
          const dateKey = `${currentYear}-${localMonth}-${localDay}`;

          const mealsForDay = selectedMeals[dateKey] || {};
          const hasMeals = Object.keys(mealsForDay).length > 0;
          const isSelected = selectedDate === day;

          // Only highlight 'today' if we are actually looking at the current active month/year
          const isToday = day === realCurrentDay && currentMonth === realCurrentMonth && currentYear === realCurrentYear;

          const thisDate = new Date(currentYear, currentMonth, day);
          const todayDateObj = new Date(realCurrentYear, realCurrentMonth, realCurrentDay);
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

                if (!day) {
                  return; // 🛑 absolute safety guard
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
                    setPopupDate(dateKey); // ✅ FIXED LINE
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
