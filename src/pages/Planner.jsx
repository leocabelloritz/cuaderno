import { useEffect, useMemo, useState } from "react";
import RecipeSelectorModal from "../components/RecipeSelectorModal";
import WeeklyTable from "../components/WeeklyTable";
import { colors } from "../styles/theme";
import {
  deletePlannerEntry,
  fetchPlanner,
  upsertPlannerEntry,
} from "../services/supabaseService";

const STORAGE_KEY = "cuaderno-planner";
const PEOPLE = ["Victoria", "Leo"];
const MEAL_SLOTS = [
  { meal: "Desayuno", time: "07:00 – 11:00" },
  { meal: "Almuerzo", time: "11:00 – 16:00" },
  { meal: "Merienda", time: "16:00 – 20:00" },
  { meal: "Cena", time: "20:00 – 24:00" },
];

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

function capitalize(text = "") {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getTodayInfo(date = new Date()) {
  return {
    key: capitalize(new Intl.DateTimeFormat("es-CL", { weekday: "long" }).format(date)),
    label: capitalize(new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long" }).format(date)),
  };
}

function getUpcomingMeal(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return "Desayuno";
  if (hour < 16) return "Almuerzo";
  if (hour < 20) return "Merienda";
  return "Cena";
}

function Planner({ recipes, session, householdId }) {
  const [planner, setPlanner] = useState(getStoredPlanner);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planner));
  }, [planner]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!session?.access_token || !householdId) return;
    let cancelled = false;
    fetchPlanner(session.access_token, householdId)
      .then((rows) => { if (!cancelled) setPlanner(remoteRowsToPlanner(rows)); })
      .catch((error) => console.error("No fue posible sincronizar el menú:", error));
    return () => { cancelled = true; };
  }, [session?.access_token, householdId]);

  const today = useMemo(() => getTodayInfo(now), [now]);
  const upcomingMeal = useMemo(() => getUpcomingMeal(now), [now]);

  const dailyTimeline = useMemo(() => {
    return MEAL_SLOTS.map(({ meal, time }) => ({
      meal,
      time,
      isCurrent: meal === upcomingMeal,
      people: PEOPLE.map((person) => ({
        person,
        name: planner?.[person]?.[today.key]?.[meal]?.name || "Sin preparación asignada",
      })),
    }));
  }, [planner, today.key, upcomingMeal]);

  async function saveMeal(person, day, meal, mealData) {
    if (!session?.access_token || !householdId) return;
    await upsertPlannerEntry(session.access_token, householdId, session.user?.id, {
      person, day, meal,
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
        [day]: { ...currentPlanner[person]?.[day], [meal]: mealData },
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
    if (session?.access_token && householdId) deletePlannerEntry(session.access_token, householdId, person, day, meal).catch(console.error);
  }

  function handleChangeServings({ person, day, meal, change }) {
    const selectedMeal = planner[person]?.[day]?.[meal];
    if (!selectedMeal) return;
    const newServings = Math.max(0.5, Number(((selectedMeal.servings ?? 1) + change).toFixed(1)));
    const updatedMeal = { ...selectedMeal, servings: newServings };
    setPlanner((currentPlanner) => ({
      ...currentPlanner,
      [person]: {
        ...currentPlanner[person],
        [day]: { ...currentPlanner[person]?.[day], [meal]: updatedMeal },
      },
    }));
    saveMeal(person, day, meal, updatedMeal).catch(console.error);
  }

  function handleCopyDay({ fromPerson, toPerson, day }) {
    const sourceMeals = planner[fromPerson]?.[day];
    if (!sourceMeals || Object.keys(sourceMeals).length === 0) return;
    const targetServings = toPerson === "Leo" ? 1.5 : 1;
    const copiedMeals = Object.fromEntries(Object.entries(sourceMeals).map(([mealName, mealData]) => [mealName, { ...mealData, servings: targetServings }]));
    setPlanner((currentPlanner) => ({
      ...currentPlanner,
      [toPerson]: { ...currentPlanner[toPerson], [day]: copiedMeals },
    }));
    Object.entries(copiedMeals).forEach(([mealName, mealData]) => saveMeal(toPerson, day, mealName, mealData).catch(console.error));
  }

  function handleExportPdf() {
    const previousTitle = document.title;
    const restoreTitle = () => { document.title = previousTitle; window.removeEventListener("afterprint", restoreTitle); };
    document.title = "";
    window.addEventListener("afterprint", restoreTitle);
    window.print();
  }

  return (
    <main className="page-content planner-page">
      <section className="planner-intro planner-cover">
        <div className="planner-cover-main compact-daily-heading">
          <div className="page-introduction">
            <p className="section-label">Planificación diaria</p>
            <h2>El menú de hoy</h2>
            <p>{today.label} · ahora corresponde <strong>{upcomingMeal.toLowerCase()}</strong>.</p>
          </div>
          <div className="planner-day-badge"><small>Hoy</small><span>{today.key}</span></div>
        </div>

        <div className="shared-day-timeline no-print" aria-label="Menú de hoy">
          {dailyTimeline.map(({ meal, time, isCurrent, people }, index) => (
            <div className={`shared-meal-row ${isCurrent ? "is-current" : ""}`} key={meal}>
              <div className="timeline-rail" aria-hidden="true">
                <span className="timeline-dot" />
                {index < dailyTimeline.length - 1 && <span className="timeline-line" />}
              </div>

              <div className="shared-meal-label">
                <strong>{meal}</strong>
                <small>{time}</small>
              </div>

              <div className="shared-meal-people">
                {people.map(({ person, name }) => (
                  <div className="shared-person-meal" key={person}>
                    <span className={`person-mini-badge ${person === "Victoria" ? "victoria" : "leo"}`}>{person.charAt(0)}</span>
                    <span>{name}</span>
                  </div>
                ))}
              </div>

              {isCurrent && <span className="current-meal-pill">Ahora</span>}
              <span className="shared-meal-chevron" aria-hidden="true">›</span>
            </div>
          ))}
        </div>

        <div className="planner-summary-card compact-summary no-print">
          <div className="planner-summary-content">
            <div className="planner-summary-count"><span aria-hidden="true">▦</span><strong>{recipes.length === 1 ? "1 preparación disponible" : `${recipes.length} preparaciones disponibles`}</strong></div>
            <p>Aquí aparecerán tus recetas para asignar al día de hoy.</p>
          </div>
        </div>

        <div className="planner-actions no-print">
          <button type="button" className="pdf-button" onClick={handleExportPdf}><span aria-hidden="true">↓</span>Descargar menú PDF</button>
        </div>
      </section>

      <div className="print-only print-title"><span>CUADERNO / MENÚ SEMANAL</span><strong>Victoria & Leo</strong></div>

      <div className="planner-stack">
        <WeeklyTable person="Victoria" targetPerson="Leo" subtitle="Porción base: 1" accent={colors.terracotta} planner={planner} onOpenSelector={setSelectedSlot} onRemoveMeal={handleRemoveMeal} onChangeServings={handleChangeServings} onCopyDay={handleCopyDay} />
        <WeeklyTable person="Leo" targetPerson="Victoria" subtitle="Porción base sugerida: 1,5" accent={colors.olive} planner={planner} onOpenSelector={setSelectedSlot} onRemoveMeal={handleRemoveMeal} onChangeServings={handleChangeServings} onCopyDay={handleCopyDay} />
      </div>

      {selectedSlot && <RecipeSelectorModal recipes={recipes} person={selectedSlot.person} dayName={selectedSlot.day} mealName={selectedSlot.meal} onSelect={handleSelectRecipe} onClose={() => setSelectedSlot(null)} />}
    </main>
  );
}

export default Planner;
