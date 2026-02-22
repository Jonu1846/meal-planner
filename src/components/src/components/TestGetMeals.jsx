import { useEffect } from "react";

export default function TestGetMeals() {
  useEffect(() => {
    const fetchMeals = async () => {
      const date = "2026-02-20"; // test a date you already have meals for
      try {
        const res = await fetch(`http://localhost:5000/api/meals/date/${date}`);
        if (!res.ok) throw new Error("Failed to fetch meals");

        const data = await res.json();
        console.log("Meals fetched for", date, ":", data);
      } catch (err) {
        console.error("Error fetching meals:", err);
      }
    };

    fetchMeals();
  }, []);

  return <div>Check console for GET meals result ✅</div>;
}