import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "../config/supabase";

const SESSION_KEY = "cuaderno-supabase-session";

function authHeaders(accessToken) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function parseResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || "Error de Supabase";
    throw new Error(message);
  }

  return data;
}

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function signUp(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseResponse(response);
}

export async function signIn(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const session = await parseResponse(response);
  storeSession(session);
  return session;
}

export async function refreshSession(refreshToken) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const session = await parseResponse(response);
  storeSession(session);
  return session;
}

export function signOut() {
  storeSession(null);
}

export async function ensureFreshSession(session) {
  if (!session?.access_token) return null;

  const expiresAt = Number(session.expires_at || 0) * 1000;
  if (expiresAt && Date.now() < expiresAt - 60_000) return session;

  if (!session.refresh_token) return session;
  return refreshSession(session.refresh_token);
}

export async function getHouseholdMembership(accessToken) {
  const select = encodeURIComponent("household_id,display_name,households(id,name,invite_code)");
  const response = await fetch(`${SUPABASE_URL}/rest/v1/household_members?select=${select}&limit=1`, {
    headers: authHeaders(accessToken),
  });

  const rows = await parseResponse(response);
  return rows?.[0] || null;
}

export async function createHousehold(accessToken, name, displayName) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_household`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ household_name: name, member_name: displayName }),
  });

  const rows = await parseResponse(response);
  return rows?.[0] || null;
}

export async function joinHousehold(accessToken, code, displayName) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/join_household`, {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ code, member_name: displayName }),
  });

  return parseResponse(response);
}

export async function fetchRecipes(accessToken, householdId) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/recipes?household_id=eq.${householdId}&select=*&order=created_at.asc`,
    { headers: authHeaders(accessToken) },
  );

  return parseResponse(response);
}

export async function createRecipe(accessToken, householdId, userId, recipe) {
  const payload = {
    id: recipe.id || crypto.randomUUID(),
    household_id: householdId,
    name: recipe.name,
    portion: recipe.portion ?? null,
    calories: Number(recipe.calories ?? 0),
    protein: Number(recipe.protein ?? 0),
    carbs: Number(recipe.carbs ?? 0),
    fat: Number(recipe.fat ?? 0),
    description: recipe.description ?? null,
    source: recipe.source ?? (recipe.estimated ? "ai" : "manual"),
    ingredients: recipe.ingredients ?? [],
    created_by: userId,
  };

  const response = await fetch(`${SUPABASE_URL}/rest/v1/recipes`, {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });

  const rows = await parseResponse(response);
  return rows?.[0] || payload;
}

export async function deleteRecipeRemote(accessToken, householdId, recipeId) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/recipes?id=eq.${recipeId}&household_id=eq.${householdId}`,
    { method: "DELETE", headers: authHeaders(accessToken) },
  );

  return parseResponse(response);
}

export async function fetchPlanner(accessToken, householdId) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/planner_entries?household_id=eq.${householdId}&select=*`,
    { headers: authHeaders(accessToken) },
  );

  return parseResponse(response);
}

export async function upsertPlannerEntry(accessToken, householdId, userId, entry) {
  const payload = {
    household_id: householdId,
    person: entry.person,
    day: entry.day,
    meal: entry.meal,
    recipe_id: entry.recipeId ?? null,
    recipe_name: entry.recipeName,
    portion: entry.portion ?? null,
    base_calories: Number(entry.baseCalories ?? 0),
    base_protein: Number(entry.baseProtein ?? 0),
    base_carbs: Number(entry.baseCarbs ?? 0),
    base_fat: Number(entry.baseFat ?? 0),
    servings: Number(entry.servings ?? 1),
    updated_by: userId,
    updated_at: new Date().toISOString(),
  };

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/planner_entries?on_conflict=household_id,person,day,meal`,
    {
      method: "POST",
      headers: {
        ...authHeaders(accessToken),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(payload),
    },
  );

  return parseResponse(response);
}

export async function deletePlannerEntry(accessToken, householdId, person, day, meal) {
  const query = new URLSearchParams({
    household_id: `eq.${householdId}`,
    person: `eq.${person}`,
    day: `eq.${day}`,
    meal: `eq.${meal}`,
  });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/planner_entries?${query.toString()}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });

  return parseResponse(response);
}
