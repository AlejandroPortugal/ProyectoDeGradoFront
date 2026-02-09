import React, { useState } from "react";
import "./FormularioCreacion.css";
import FormularioCreacionAd from "./FormularioCreacionAd.jsx";
import FormularioCreacionPr from "./FormularioCreacionPr.jsx";
import FormularioCreacionPs from "./FormularioCreacionPs.jsx";
import FormularioCreacionEs from "./FormularioCreacionEs.jsx";
import FormularioCreacionPd from "./FormularioCreacionPd.jsx";

const FormularioCreacion = () => {
  const [rol, setRol] = useState("");

  const renderForm = () => {
    switch (rol) {
      case "Administrador":
        return <FormularioCreacionAd />;
      case "Profesor":
        return <FormularioCreacionPr />;
      case "Psicologo":
        return <FormularioCreacionPs />;
      case "Estudiante":
        return <FormularioCreacionEs />;
      case "Padre de Familia":
        return <FormularioCreacionPd />;
      default:
        return null;
    }
  };

  return (
    <section className="formulario-creacion">
      {/* HERO */}
      <header className="hero">
        <div className="hero-inner">
          <span className="hero-kicker">Panel de administración</span>
          <h1 className="hero-title">Alta de usuarios</h1>
          <p className="hero-subtitle">
            Crea nuevos usuarios de forma rápida. Selecciona el rol y completa los
            datos. Todo es 100% responsive para cualquier dispositivo.
          </p>
          <a href="#crear-form" className="hero-cta">Comenzar</a>
        </div>
      </header>

      {/* FORMULARIO (debajo del hero) */}
      <div id="crear-form" className="form-wrap">
        <div className="form-title">
          <h2>Crear nuevo usuario</h2>
        </div>

        <div className="role-selector">
          <label htmlFor="rol">Rol:</label>
          <select id="rol" value={rol} onChange={(e) => setRol(e.target.value)}>
            <option value="">Selecciona un rol</option>
            <option value="Administrador">Administrador</option>
            <option value="Profesor">Profesor</option>
            <option value="Psicologo">Psicologo</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Padre de Familia">Padre de Familia</option>
          </select>
        </div>

        {renderForm()}
      </div>
    </section>
  );
};

// Fechas límite por rol
export const dateLimitsByRol = (rol) => {
  const today = new Date();
  if (["Administrador", "Profesor", "Psicologo"].includes(rol)) {
    return { max: "2005-12-31" };
  }
  if (rol === "Padre de Familia") {
    const max = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    return { max: max.toISOString().split("T")[0] };
  }
  if (rol === "Estudiante") {
    const min = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate()
    );
    const max = new Date(
      today.getFullYear() - 11,
      today.getMonth(),
      today.getDate()
    );
    return {
      min: min.toISOString().split("T")[0],
      max: max.toISOString().split("T")[0],
    };
  }
  return {};
};

export const onlyDigits8 = (v) => /^[0-9]{0,8}$/.test(v);
export const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export default FormularioCreacion;
