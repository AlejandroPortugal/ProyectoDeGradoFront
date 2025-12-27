import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createDireccion } from "../../servicios/direccion.service.jsx";
import { postPadre } from "../../servicios/PadreDeFamilia.jsx";
import Toast from "../Toast";
import "./ConfirmacionCorreo.css";

const ConfirmacionCorreo = () => {
  const [codigo, setCodigo] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // Tipo del Toast: 'success' o 'error'
  const navigate = useNavigate();
  const location = useLocation();
  const datos = location.state || {};
  const { codigoEnviado, ...restoDatos } = datos;

  if (!codigoEnviado || !restoDatos.direccion) {
    console.warn("Datos faltantes en ConfirmacionCorreo:", datos);
    setToastMessage("No se encontraron los datos necesarios. Reinicia el proceso.");
    setToastType("error");
    setShowToast(true);
    return (
      <div className="confirmacion-container">
        <div className="confirmacion-card">
          <div className="confirmacion-header">
            <h2>Error</h2>
            <p>No se encontraron los datos necesarios para continuar.</p>
          </div>
          <button
            className="confirmacion-button"
            onClick={() => navigate("/register")}
          >
            Volver al Registro
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!codigo || codigo.length !== 6) {
      setToastMessage("Por favor, ingresa un código válido de 6 dígitos.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    if (codigo !== codigoEnviado.toString()) {
      setToastMessage("El código ingresado es incorrecto.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    try {
      // Ajustar los datos de la dirección para que coincidan con lo esperado por el backend
      const direccionPayload = {
        zona: restoDatos.direccion.zona,
        calle: restoDatos.direccion.calle,
        num_puerta: restoDatos.direccion.numPuerta, // Transformar clave
      };



      const direccionResponse = await createDireccion(direccionPayload);
      const idDireccion = direccionResponse.data.idDireccion || direccionResponse.data.iddireccion;

      if (!idDireccion) {
        throw new Error("No se pudo obtener el ID de la dirección creada.");
      }

      // Crear el payload completo para crear el padre de familia
      const payload = {
        nombres: restoDatos.nombres,
        apellidoPaterno: restoDatos.apellidoPaterno,
        apellidoMaterno: restoDatos.apellidoMaterno,
        email: restoDatos.email,
        numCelular: restoDatos.celular,
        fechaDeNacimiento: restoDatos.fechaNacimiento,
        contrasenia: restoDatos.contrasenia,
        rol: "Padre de Familia", // Valor fijo
        idDireccion, // ID de la dirección creada
      };



      await postPadre(payload);

      setToastMessage("Cuenta creada exitosamente. Redirigiendo al login...");
      setToastType("success");
      setShowToast(true);

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Ocurrió un error al procesar el registro.";
      console.error("Error al crear los datos:", errorMessage);
      setToastMessage(errorMessage);
      setToastType("error");
      setShowToast(true);
    }
  };

  return (
    <div className="confirmacion-container">
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType} // 'success' o 'error'
          onClose={() => setShowToast(false)}
        />
      )}
      <div className="confirmacion-card">
        <div className="confirmacion-header">
          <h2>Confirmación</h2>
          <p>Enviamos un código a tu correo electrónico</p>
        </div>
        <div className="confirmacion-form">
          <input
            type="text"
            placeholder="Ejem. 808020"
            className="confirmacion-input"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
        </div>
        <button className="confirmacion-button" onClick={handleSubmit}>
          Finalizar
        </button>
      </div>
    </div>
  );
};

export default ConfirmacionCorreo;

