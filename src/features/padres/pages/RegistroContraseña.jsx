import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./RegistroContraseña.css";
import eyeIcon from "../../../recursos/icons/Eye.svg";

const RegistroContraseña = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state;

  // Validación de contraseña
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = () => {
    if (!formData) {
      setError("Ocurrió un error. Por favor, vuelve a iniciar el proceso.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!validatePassword(password)) {
      setError("La contraseña debe incluir al menos una letra mayúscula, un número y un símbolo especial.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Limpiar error y navegar a la siguiente ruta
    setError("");
    navigate("/registrodatos", {
      state: {
        ...formData, // Mantener los datos previos
        contrasenia: password, // Añadir la contraseña al siguiente paso
      },
    });
  };

  return (
    <div className="registro-container">
      <div className="registro-card">
        <div className="registro-header">
          <h2>Crea tu contraseña</h2>
          {formData && (
            <p>
              Hola {formData.nombres} {formData.apellidoPaterno}, casi terminamos tu registro.
            </p>
          )}
        </div>
        <div className="registro-form">
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu contraseña"
              className="registro-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <img
              src={eyeIcon}
              alt="Mostrar contraseña"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <div className="password-field">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirma tu contraseña"
              className="registro-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <img
              src={eyeIcon}
              alt="Mostrar contraseña"
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
          <p className="registro-hint">
            La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un símbolo especial.
          </p>
          {error && <p className="registro-error">{error}</p>}
        </div>
        <button className="registro-button" onClick={handleSubmit}>
          Siguiente
        </button>
      </div>
      <div className="registro-footer">
        <ul className="registro-progress">
          <li className="active">Tus datos</li>
          <li className="active">Elige una contraseña</li>
          <li>Contacto</li>
          <li>Confirma tu cuenta</li>
        </ul>
      </div>
    </div>
  );
};

export default RegistroContraseña;


