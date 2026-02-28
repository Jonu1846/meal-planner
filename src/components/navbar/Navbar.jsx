import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "🏠", end: true },
    { path: "/planner", label: "Planner", icon: "📅" },
    { path: "/insights", label: "Insights", icon: "📊" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Brand */}
        <NavLink
          to="/"
          className="navbar-brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="brand-emoji">🍽️</span>
          <span className="brand-text">Banquet Planner</span>
        </NavLink>

        {/* Hamburger (mobile) */}
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `pill-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                <span className="pill-icon">{item.icon}</span>
                <span className="pill-text">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
