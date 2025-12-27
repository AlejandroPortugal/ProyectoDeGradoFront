import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { enviarCorreoDeConfirmacion } from "../../servicios/correo.service.jsx";
import FullScreenLoader from "../ComponentsProfesores/ProgresoCircular.jsx"; // Importar el loader
import "./RegistroDatos.css";

const RegistroDatos = () => {
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [zona, setZona] = useState("");
  const [calle, setCalle] = useState("");
  const [numPuerta, setNumPuerta] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Estado para manejar el loader
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state || {}; // Datos previos

  const handleSubmit = async () => {
    // Validaciones de los campos
    if (!celular || !/^\d{8}$/.test(celular)) {
      setError("Por favor, ingresa un número de celular válido (8 dígitos).");
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    if (!zona.trim() || !calle.trim() || !numPuerta.trim()) {
      setError("Por favor, completa todos los campos de la dirección.");
      return;
    }
    setError("");
    setLoading(true); // Mostrar el loader mientras se procesa

    try {
      // Enviar correo de confirmación
      const response = await enviarCorreoDeConfirmacion({ email });
      const codigoGenerado = response.data.codigoConfirmacion;

      if (!codigoGenerado) {
        setError("No se pudo generar el código de confirmación. Inténtalo de nuevo.");
        setLoading(false); // Ocultar el loader en caso de error
        return;
      }

      // Navegar a la pantalla de confirmación con los datos
      navigate("/confirmarcuenta", {
        state: {
          ...formData, // Datos acumulados
          celular,
          email,
          direccion: { zona, calle, numPuerta },
          codigoEnviado: codigoGenerado, // Código de confirmación
        },
      });
    } catch (err) {
      console.error("Error al enviar el correo de confirmación:", err);
      setError("No se pudo enviar el correo de confirmación. Inténtalo de nuevo.");
    } finally {
      setLoading(false); // Ocultar el loader después de finalizar
    }
  };

  return (
    <>
      {loading && <FullScreenLoader />} {/* Mostrar el loader si está en proceso */}
      <div className="registro-container">
        <div className="registro-card">
          <div className="registro-header">
            <h2>Contacto</h2>
            <p>Ingresa tus datos para contactarte</p>
          </div>
          <div className="registro-form">
            <input
              type="text"
              placeholder="Celular: Ejem. 71545389"
              className="registro-input"
              value={celular}
              onChange={(e) => /^\d*$/.test(e.target.value) && setCelular(e.target.value)}
            />
            <input
              type="email"
              placeholder="Correo: Ejem. pedro@gmail.com"
              className="registro-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Zona: Ejem. Zona Norte"
              className="registro-input"
              value={zona}
              onChange={(e) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value) && setZona(e.target.value)}
            />
            <input
              type="text"
              placeholder="Calle: Ejemp. Victor Eduardo"
              className="registro-input"
              value={calle}
              onChange={(e) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(e.target.value) && setCalle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Número de puerta: Ejem. 102"
              className="registro-input"
              value={numPuerta}
              onChange={(e) => /^\d*$/.test(e.target.value) && setNumPuerta(e.target.value)}
            />
            {error && <p className="registro-error">{error}</p>}
          </div>
          <button className="registro-button" onClick={handleSubmit}>
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
};

export default RegistroDatos;

