import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroPadres.css";
import logo from "../../recursos/icons/logo.svg";

const RegistroPadres = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaNacimiento: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Limpiar error al cambiar los campos
  };

  const handleSubmit = () => {
    const { nombres, apellidoPaterno, apellidoMaterno, fechaNacimiento } = formData;

    // Validación local
    if (!nombres.trim() || !apellidoPaterno.trim() || !apellidoMaterno.trim() || !fechaNacimiento) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const hoy = new Date();
    const fechaIngresada = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - fechaIngresada.getFullYear();
    const mes = hoy.getMonth() - fechaIngresada.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaIngresada.getDate())) {
      if (edad - 1 < 18) {
        setError("Debes ser mayor de 18 años para registrarte.");
        return;
      }
    } else if (edad < 18) {
      setError("Debes ser mayor de 18 años para registrarte.");
      return;
    }

    // Si pasa las validaciones, enviar datos a la siguiente ruta
    navigate("/registrodecontrasenia", { state: formData });
  };

  // Calcular la fecha máxima permitida (hoy - 18 años)
  const calcularFechaMaxima = () => {
    const hoy = new Date();
    hoy.setFullYear(hoy.getFullYear() - 18); // Restar 18 años a la fecha actual
    return hoy.toISOString().split("T")[0]; // Convertir a formato 'YYYY-MM-DD'
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <div className="registro-header">
          <img src={logo} alt="Logo IDEB" className="registro-logo" />
          <h2>Crea tu cuenta para ingresar</h2>
        </div>
        <div className="registro-form">
          <input
            type="text"
            name="nombres"
            placeholder="Nombres"
            className="registro-input"
            value={formData.nombres}
            onChange={handleChange}
          />
          <input
            type="text"
            name="apellidoPaterno"
            placeholder="Primer Apellido"
            className="registro-input"
            value={formData.apellidoPaterno}
            onChange={handleChange}
          />
          <input
            type="text"
            name="apellidoMaterno"
            placeholder="Segundo Apellido"
            className="registro-input"
            value={formData.apellidoMaterno}
            onChange={handleChange}
          />
          <input
            type="date"
            name="fechaNacimiento"
            className="registro-input"
            placeholder="Fecha de Nacimiento"
            max={calcularFechaMaxima()} // Limitar al máximo permitido
            value={formData.fechaNacimiento}
            onChange={handleChange}
          />
          {error && <p className="registro-error">{error}</p>}
        </div>
        <button className="registro-button" onClick={handleSubmit}>
          Siguiente
        </button>
        <p className="registro-login-link">
          ¿Ya tienes una cuenta? <a href="/login">Iniciar Sesión</a>
        </p>
      </div>
    </div>
  );
};

export default RegistroPadres;

