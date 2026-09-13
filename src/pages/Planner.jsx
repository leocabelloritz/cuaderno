import { useEffect, useState } from "react";
import RecipeSelectorModal from "../components/RecipeSelectorModal";
import WeeklyTable from "../components/WeeklyTable";
import { colors } from "../styles/theme";
import {
  deletePlannerEntry,
  fetchPlanner,
  upsertPlannerEntry,
} from "../services/supabaseService";

const STORAGE_KEY = "cuaderno-planner";

function migrateMealNames(planner) {
  const migratedPlanner = structuredClone(planner || {});

  Object.values(migratedPlanner).forEach((personPlanner) => {
    Object.values(personPlanner || {}).forEach((dayPlanner) => {
      if (dayPlanner?.Once && !dayPlanner?.Merienda) dayPlanner.Merienda = dayPlanner.Once;
      if (dayPlanner?.Once) delete dayPlanner.Once;
    });
  });

  return migratedPlanner;
}

function getStoredPlanner() {
  try {
    const storedPlanner = localStorage.getItem(STORAGE_KEY);
    return storedPlanner ? migrateMealNames(JSON.parse(storedPlanner)) : {};
  } catch {
    return {};
  }
}

function remoteRowsToPlanner(rows) {
  const next = {};

  (rows || []).forEach((row) => {
    if (!next[row.person]) next[row.person] = {};
    if (!next[row.person][row.day]) next[row.person][row.day] = {};

    next[row.person][row.day][row.meal] = {
      id: row.recipe_id,
      name: row.recipe_name,
      portion: row.portion,
      baseCalories: Number(row.base_calories ?? 0),
      baseProtein: Number(row.base_protein ?? 0),
      baseCarbs: Number(row.base_carbs ?? 0),
      baseFat: Number(row.base_fat ?? 0),
      servings: Number(row.servings ?? 1),
    };
  });

  return migrateMealNames(next);
}

function Planner({ recipes, session, householdId }) {
  const [planner, setPlanner] = useState(getStoredPlanner);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planner));
  }, [planner]);

  useEffect(() => {
    if (!session?.access_token || !householdId) return;

    let cancelled = false;

    fetchPlanner(session.access_token, householdId)
      .then((rows) => {
        if (!cancelled) setPlanner(remoteRowsToPlanner(rows));
      })
      .catch((error) => console.error("No fue posible sincronizar el menú:", error));

    return () => { cancelled = true; };
  }, [session?.access_token, householdId]);

  async function saveMeal(person, day, meal, mealData) {
    if (!session?.access_token || !householdId) return;

    await upsertPlannerEntry(session.access_token, householdId, session.user?.id, {
      person,
      day,
      meal,
      recipeId: mealData.id,
      recipeName: mealData.name,
      portion: mealData.portion,
      baseCalories: mealData.baseCalories,
      baseProtein: mealData.baseProtein,
      baseCarbs: mealData.baseCarbs,
      baseFat: mealData.baseFat,
      servings: mealData.servings,
    });
  }

  function handleSelectRecipe(recipe) {
    const { person, day, meal } = selectedSlot;
    const mealData = {
      id: recipe.id,
      name: recipe.name,
      portion: recipe.portion,
      baseCalories: recipe.calories,
      baseProtein: recipe.protein ?? 0,
      baseCarbs: recipe.carbs ?? 0,
      baseFat: recipe.fat ?? 0,
      servings: person === "Leo" ? 1.5 : 1,
    };

    setPlanner((currentPlanner) => ({
      ...currentPlanner,
      [person]: {
        ...currentPlanner[person],
        [day]: {
          ...currentPlanner[person]?.[day],
          [meal]: mealData,
        },
      },
    }));

    saveMeal(person, day, meal, mealData).catch(console.error);
    setSelectedSlot(null);
  }

  function handleRemoveMeal({ person, day, meal }) {
    setPlanner((currentPlanner) => {
      const updatedPlanner = structuredClone(currentPlanner);
      delete updatedPlanner[person]?.[day]?.[meal];
      return updatedPlanner;
    });

    if (session?.access_token && householdId) {
      deletePlannerEntry(session.access_token, householdId, person, day, meal).catch(console.error);
    }
  }

  function handleChangeServings({ person, day, meal, change }) {
    const selectedMeal = planner[person]?.[day]?.[meal];
    if (!selectedMeal) return;

    const currentServings = selectedMeal.servings ?? 1;
    const newServings = Math.max(0.5, Number((currentServings + change).toFixed(1)));
    const updatedMeal = { ...selectedMeal, servings: newServings };

    setPlanner((currentPlanner) => ({
      ...currentPlanner,
      [person]: {
        ...currentPlanner[person],
        [day]: {
          ...currentPlanner[person]?.[day],
          [meal]: updatedMeal,
        },
      },
    }));

    saveMeal(person, day, meal, updatedMeal).catch(console.error);
  }

  function handleCopyDay({ fromPerson, toPerson, day }) {
    const sourceMeals = planner[fromPerson]?.[day];
    if (!sourceMeals || Object.keys(sourceMeals).length === 0) return;

    const targetServings = toPerson === "Leo" ? 1.5 : 1;
    const copiedMeals = Object.fromEntries(
      Object.entries(sourceMeals).map(([mealName, mealData]) => [
        mealName,
        { ...mealData, servings: targetServings },
      ]),
    );

    setPlanner((currentPlanner) => ({
      ...currentPlanner,
      [toPerson]: {
        ...currentPlanner[toPerson],
        [day]: copiedMeals,
      },
    }));

    Object.entries(copiedMeals).forEach(([mealName, mealData]) => {
      saveMeal(toPerson, day, mealName, mealData).catch(console.error);
    });
  }

  function handleExportPdf() {
    const previousTitle = document.title;
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    document.title = "";
    window.addEventListener("afterprint", restoreTitle);
    window.print();
  }

  return (
    <main className="page-content planner-page">
      <section className="planner-intro">
        <div className="page-introduction">
          <p className="section-label">Planificación familiar</p>
          <h2>El menú de esta semana</h2>
          <p>Una vista simple de lo que vamos a comer, con porciones ajustadas para cada uno y el cálculo nutricional de las preparaciones.</p>
          <p className="available-recipes-count">
            {recipes.length === 1 ? "1 preparación disponible" : `${recipes.length} preparaciones disponibles`}
          </p>
        </div>

        <div className="planner-actions no-print">
          <span className="planner-actions-note">Edición semanal</span>
          <button type="button" className="pdf-button" onClick={handleExportPdf}>
            <span aria-hidden="true">↓</span>
            Descargar menú PDF
          </button>
        </div>
      </section>

      <div className="print-only print-title">
        <span>CUADERNO / MENÚ SEMANAL</span>
        <strong>Victoria & Leo</strong>
      </div>

      <div className="planner-stack">
        <WeeklyTable
          person="Victoria"
          targetPerson="Leo"
          subtitle="Porción base: 1"
          accent={colors.terracotta}
          planner={planner}
          onOpenSelector={setSelectedSlot}
          onRemoveMeal={handleRemoveMeal}
          onChangeServings={handleChangeServings}
          onCopyDay={handleCopyDay}
        />

        <WeeklyTable
          person="Leo"
          targetPerson="Victoria"
          subtitle="Porción base sugerida: 1,5"
          accent={colors.olive}
          planner={planner}
          onOpenSelector={setSelectedSlot}
          onRemoveMeal={handleRemoveMeal}
          onChangeServings={handleChangeServings}
          onCopyDay={handleCopyDay}
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
