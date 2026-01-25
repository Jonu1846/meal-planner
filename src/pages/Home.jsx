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
          <h1>🍖Banquet Planner🍖</h1>
          <p>
            Plan your meals easily, stay organized, and eat better every day.
          </p>
          <button className="hero-button" onClick={() => navigate("/planner")}>
            <span className="emoji">🍽️</span> Plan Your Feast
          </button>
        </div>
      </section>

      {/* WHY THIS APP */}
      <section className="home-why">
        <div className="why-card">
          <span>📅</span>
          <h3>Plan by Date</h3>
          <p>Choose any date and organize meals clearly.</p>
        </div>

        <div className="why-card">
          <span>🟢 🔴</span>
          <h3>Veg / Non-Veg</h3>
          <p>Track veg and non-veg meals easily.</p>
        </div>

        <div className="why-card">
          <span>⏰</span>
          <h3>Multiple Meals</h3>
          <p>Manage morning, lunch, snacks, and dinner.</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">
        <h2>What you can do</h2>
        <ul>
          <li>Calendar-based meal planning</li>
          <li>Clean popup-based meal selection</li>
          <li>Simple and distraction-free interface</li>
        </ul>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-steps">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">1. Select a date</div>
          <div className="step">2. Choose meal & time</div>
          <div className="step">3. View and manage meals</div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="home-cta">
        <h2>Ready to plan your meals?</h2>
        <button className="hero-button" onClick={() => navigate("/planner")}>
          <span className="emoji">🍽️</span> Plan Your Feast
        </button>
      </section>

    </div>
  );
};

export default Home;
