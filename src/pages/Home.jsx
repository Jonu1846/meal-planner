import { useNavigate } from "react-router-dom";
import "./home.css";
import calendarImg from "../assets/calender-img.jpg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-logo-container">
          <img src={calendarImg} alt="Meal planner logo" />
        </div>

        <div className="hero-text">
          <h1>🍖 Banquet Planner 🍖</h1>
          <p>
            Master your nutrition, track your habits, and build a healthier lifestyle with an intuitive, calendar-based meal planner.
          </p>
          <button className="hero-button" onClick={() => navigate("/planner")}>
            <span className="emoji">🍽️</span> Start Planning
          </button>
        </div>
      </section>

      {/* WHY THIS APP */}
      <section className="home-why">
        <div className="why-card">
          <span>📅</span>
          <h3>Better Planning</h3>
          <p>Organize your week in advance to save time, reduce food waste, and eliminate the daily "what's for dinner" stress.</p>
        </div>

        <div className="why-card">
          <span>📈</span>
          <h3>Consistency Tracking</h3>
          <p>Build lifelong sustainable habits by visually tracking your daily meal consistency on your personal calendar.</p>
        </div>

        <div className="why-card">
          <span>🥦</span>
          <h3>Smarter Eating</h3>
          <p>Raise your health awareness by balancing your calorie intake and actively monitoring your diet type and nutrition.</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">
        <h2>Key Features</h2>
        <ul>
          <li>Calendar-based meal planning for long-term organization</li>
          <li>Clear Veg & Non-Veg indicators for dietary preferences</li>
          <li>Detailed calorie tracking to meet your health goals</li>
          <li>Interactive popups displaying full recipes and ingredients</li>
          <li>Weekly analytics in the Insights dashboard to track progress</li>
          <li>A clean, distraction-free interface built for speed</li>
        </ul>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-steps">
        <h2>How to Use Banquet Planner</h2>
        <div className="steps">
          <div className="step">1. Open the Planner from the menu</div>
          <div className="step">2. Click on any date in the calendar</div>
          <div className="step">3. Add Breakfast, Lunch, or Dinner</div>
          <div className="step">4. Click a meal name to read full details</div>
          <div className="step">5. Visit Insights to track your progress</div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-cta">
        <h2>Ready to take control of your diet?</h2>
        <button className="hero-button" onClick={() => navigate("/planner")}>
          <span className="emoji">🚀</span> Start Planning Now
        </button>
      </section>

    </div>
  );
};

export default Home;
