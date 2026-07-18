import { useEffect, useState } from "react";
import RecipeSelectorModal from "../components/RecipeSelectorModal";
import WeeklyTable from "../components/WeeklyTable";
import { colors } from "../styles/theme";

const STORAGE_KEY = "cuaderno-planner";

function getStoredPlanner() {
  try {
    const storedPlanner = localStorage.getItem(STORAGE_KEY);

    return storedPlanner ? JSON.parse(storedPlanner) : {};
  } catch (error) {
    console.error("No fue posible cargar el planificador:", error);
    return {};
  }
}

function Planner({ recipes }) {
  const [planner, setPlanner] = useState(getStoredPlanner);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planner));
  }, [planner]);

  function handleSelectRecipe(recipe) {
    const { person, day, meal } = selectedSlot;

    setPlanner((currentPlanner) => ({
      ...currentPlanner,

      [person]: {
        ...currentPlanner[person],

        [day]: {
          ...currentPlanner[person]?.[day],

          [meal]: {
            id: recipe.id,
            name: recipe.name,
            portion: recipe.portion,
            baseCalories: recipe.calories,
            servings: person === "Leo" ? 1.5 : 1,
          },
        },
      },
    }));

    setSelectedSlot(null);
  }

  function handleRemoveMeal({ person, day, meal }) {
    setPlanner((currentPlanner) => {
      const updatedPlanner = structuredClone(currentPlanner);

      delete updatedPlanner[person]?.[day]?.[meal];

      return updatedPlanner;
    });
  }

  function handleChangeServings({
    person,
    day,
    meal,
    change,
  }) {
    setPlanner((currentPlanner) => {
      const selectedMeal = currentPlanner[person]?.[day]?.[meal];

      if (!selectedMeal) {
        return currentPlanner;
      }

      const currentServings = selectedMeal.servings ?? 1;

      const newServings = Math.max(
        0.5,
        Number((currentServings + change).toFixed(1)),
      );

      return {
        ...currentPlanner,

        [person]: {
          ...currentPlanner[person],

          [day]: {
            ...currentPlanner[person]?.[day],

            [meal]: {
              ...selectedMeal,
              servings: newServings,
            },
          },
        },
      };
    });
  }

  return (
    <main className="page-content">
      <div className="page-introduction">
        <p className="section-label">Planificación familiar</p>

        <h2>El menú de esta semana</h2>

        <p>
          Agrega preparaciones a cada comida. Las porciones y calorías se
          calcularán de manera independiente para cada uno.
        </p>

        <p className="available-recipes-count">
          {recipes.length === 1
            ? "1 preparación disponible"
            : `${recipes.length} preparaciones disponibles`}
        </p>
      </div>

      <div className="planner-stack">
        <WeeklyTable
          person="Victoria"
          subtitle="Porción base: 1"
          accent={colors.terracotta}
          planner={planner}
          onOpenSelector={setSelectedSlot}
          onRemoveMeal={handleRemoveMeal}
          onChangeServings={handleChangeServings}
        />

        <WeeklyTable
          person="Leo"
          subtitle="Porción base sugerida: 1,5"
          accent={colors.olive}
          planner={planner}
          onOpenSelector={setSelectedSlot}
          onRemoveMeal={handleRemoveMeal}
          onChangeServings={handleChangeServings}
        />
      </div>

      {selectedSlot && (
        <RecipeSelectorModal
          recipes={recipes}
          person={selectedSlot.person}
          dayName={selectedSlot.day}
          mealName={selectedSlot.meal}
          onSelect={handleSelectRecipe}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </main>
  );
}

export default Planner;
