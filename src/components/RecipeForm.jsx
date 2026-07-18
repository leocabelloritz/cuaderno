import { useState } from "react";

const INITIAL_FORM = {
  name: "",
  portion: "",
  calories: "",
  description: "",
};

function RecipeForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState(INITIAL_FORM);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cleanName = formData.name.trim();
    const cleanPortion = formData.portion.trim();
    const calories = Number(formData.calories);

    if (!cleanName || !cleanPortion || calories <= 0) {
      return;
    }

    onSubmit({
      name: cleanName,
      portion: cleanPortion,
      calories,
      description: formData.description.trim(),
    });

    setFormData(INITIAL_FORM);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onCancel}>
      <section
        className="recipe-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="section-label">Base de datos</p>
            <h2 id="recipe-form-title">Nueva preparación</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onCancel}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form className="recipe-form" onSubmit={handleSubmit}>
          <label>
            Nombre
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ejemplo: Lasaña vegetariana"
              autoFocus
              required
            />
          </label>

          <div className="form-row">
            <label>
              Porción base
              <input
                type="text"
                name="portion"
                value={formData.portion}
                onChange={handleChange}
                placeholder="Ejemplo: 1 plato"
                required
              />
            </label>

            <label>
              Calorías
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                min="1"
                step="1"
                placeholder="420"
                required
              />
            </label>
          </div>

          <label>
            Descripción
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Breve descripción de la preparación"
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onCancel}
            >
              Cancelar
            </button>

            <button type="submit" className="primary-button">
              Guardar preparación
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default RecipeForm;
