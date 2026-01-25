// Sidebar.jsx
import React from "react";
import "./sidebar.css";

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      {/* Header row */}
      <div className="sidebar-header">
        <h3>Planner Panel</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="sidebar-section">
        <p><strong>Selected Date:</strong> —</p>
        <p><strong>Meal Time:</strong> —</p>
        <p><strong>Meal Type:</strong> —</p>

        <p className="sidebar-hint">
          Start planning a meal to see details here.
        </p>
      </div>

      <hr />

      <div className="sidebar-section">
        <p><strong>Coming Soon</strong></p>
        <ul>
          <li>Weekly Overview</li>
          <li>Favorite Meals</li>
          <li>Meal Templates</li>
          <li>Nutrition Summary</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
