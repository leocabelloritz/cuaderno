import { useState } from "react";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import Planner from "./pages/Planner";
import Recipes from "./pages/Recipes";

function App() {
  const [activeView, setActiveView] = useState("planner");

  return (
    <div className="app-shell">
      <div className="decorative-line" />

      <Header />

      <Navigation
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {activeView === "planner" ? <Planner /> : <Recipes />}

      <footer className="app-footer">
        <span>Cuaderno</span>
        <span>Hecho para Victoria y Leo</span>
      </footer>
    </div>
  );
}

export default App;
