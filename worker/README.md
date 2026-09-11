# Cuaderno · Nutrition AI Worker

Backend gratuito para estimar porciones y macronutrientes desde Cuaderno usando Cloudflare Workers AI.

## Desplegar

1. Crea o inicia sesión en una cuenta gratuita de Cloudflare.
2. En una terminal, entra a esta carpeta:
   ```bash
   cd worker
   npm install
   npx wrangler login
   npm run deploy
   ```
3. Wrangler mostrará una URL similar a:
   `https://cuaderno-nutrition-ai.<tu-subdominio>.workers.dev`
4. Abre Cuaderno → Preparaciones → Nueva con IA → Conectar analizador IA y pega esa URL.

La URL queda guardada en `localStorage` de ese dispositivo. No se publica ninguna clave en GitHub Pages.

## Modelo

El Worker usa `@cf/google/gemma-4-26b-a4b-it` mediante el binding `AI` definido en `wrangler.jsonc`.

## Endpoints

- `GET /health` comprueba que el Worker responde.
- `POST /analyze` recibe `name`, `description` y `portionSize` y devuelve una estimación estructurada de porción, calorías y macros.

Los resultados son orientativos y no sustituyen información nutricional medida o clínica.
