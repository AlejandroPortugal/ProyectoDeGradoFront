import React from "react";
import "./UserForm.css";
import Toast from './Toast.jsx';
import { useState } from 'react';

const UserForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleReset,
  direcciones,
  showCurso,
  cursos,
  padres,
  showPadre,
  showEmail,
  showNumCelular,
  showContrasenia,
  showHorario,
  horarios,
}) => {

  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Calcular límites dinámicos según el rol
  const calculateDateLimits = (rol) => {
    const today = new Date();

    if (rol === "Administrador" || rol === "Profesor" || rol === "Psicologo") {
      return { max: "2005-12-31" }; // Solo fechas anteriores al 1 de enero de 2006
    } else if (rol === "Padre de Familia") {
      const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      return { max: maxDate.toISOString().split("T")[0] }; // Mayores de 18 años
    } else if (rol === "Estudiante") {
      const minDate = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - 11, today.getMonth(), today.getDate());
      return {
        min: minDate.toISOString().split("T")[0], // No menor de 11 años
        max: maxDate.toISOString().split("T")[0], // No mayor de 19 años
      };
    }
    return {}; // Sin restricciones para otros roles
  };

  // Función para validar número de celular
  const handleCellNumberChange = (e) => {
    const { value } = e.target;

    // Permitir solo números y máximo 8 dígitos
    const regex = /^[0-9]{0,8}$/;

    if (regex.test(value)) {
      handleChange(e); // Llama a la función handleChange original si es válido
    }
  };

  const dateLimits = calculateDateLimits(formData.rol);
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojito de contraseña


  // Validación de contraseña
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    return regex.test(password);
  };

  // Manejar cambios en el campo de contraseña
  const handlePasswordChange = (e) => {
    const { value } = e.target;

    if (value.length > 20) {
      showToast("La contraseña no puede exceder los 20 caracteres", "error");
    } else if (!validatePassword(value) && value.length > 0) {
      showToast(
        "La contraseña debe tener entre 8 y 20 caracteres, incluir al menos una mayúscula, un número y un carácter especial",
        "error"
      );
    }
    handleChange(e);
  };

  // Validación de correo electrónico
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return regex.test(email);
  };

  // Manejar cambios en el campo de correo electrónico
  const handleEmailChange = (e) => {
    const { value } = e.target;

    if (!validateEmail(value) && value.length > 0) {
      showToast("El correo debe ser válido y terminar con @gmail.com", "error");
    }
    handleChange(e);
  };

  return (
    <div className="user-form-container">
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ show: false })} />
      )}

      <h2>Formulario de Registro</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Nombre */}
          <div className="form-group">
            <label>Nombres:</label>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              required
              placeholder="Ingrese sus nombres"
            />
          </div>

          {/* Apellido Paterno */}
          <div className="form-group">
            <label>Apellido Paterno:</label>
            <input
              type="text"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              required
              placeholder="Ingrese su apellido paterno"
            />
          </div>

          {/* Apellido Materno */}
          <div className="form-group">
            <label>Apellido Materno:</label>
            <input
              type="text"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              required
              placeholder="Ingrese su apellido materno"
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div className="form-group">
            <label>Fecha de Nacimiento:</label>
            <input
              type="date"
              name="fechaDeNacimiento"
              value={formData.fechaDeNacimiento}
              onChange={handleChange}
              required
              min={dateLimits.min} // Límite inferior dinámico
              max={dateLimits.max} // Límite superior dinámico
            />
          </div>

          {/* Dirección */}
          {direcciones && (
            <div className="form-group">
              <label>Dirección:</label>
              <select
                name="idDireccion"
                value={formData.idDireccion}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una dirección</option>
                {direcciones.map((direccion) => (
                  <option key={direccion.iddireccion} value={direccion.iddireccion}>
                    {direccion.zona} - {direccion.calle} - {direccion.num_puerta}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Padre */}
          {showPadre && (
            <div className="form-group">
              <label>Padre de Familia:</label>
              <select
                name="idPadre"
                value={formData.idPadre}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un padre</option>
                {padres.map((padre) => (
                  <option key={padre.idpadre} value={padre.idpadre}>
                    {padre.nombres} {padre.apellidopaterno} {padre.apellidomaterno}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Curso */}
          {showCurso && (
            <div className="form-group">
              <label>Curso:</label>
              <select
                name="idCurso"
                value={formData.idCurso}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un curso</option>
                {cursos.map((curso) => (
                  <option key={curso.idcurso} value={curso.idcurso}>
                    {curso.nombrecurso} {curso.paralelo} de {curso.nivel}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Correo Electrónico */}
          {showEmail && (
            <div className="form-group">
              <label>Correo Electrónico:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleEmailChange}
                required
                placeholder="Ingrese un correo @gmail.com"
              />
            </div>
          )}

          {/* Número de Celular */}
          {showNumCelular && (
            <div className="form-group">
              <label>Número de Celular:</label>
              <input
                type="text"
                name="numCelular"
                value={formData.numCelular}
                onChange={handleCellNumberChange}
                required
                placeholder="Ingrese su número de celular (8 dígitos)"
              />
            </div>
          )}

         
         
         {/* Contraseña */}
         {showContrasenia && (
            <div className="form-group">
              <label>Contraseña:</label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"} // Alternar entre texto y contraseña
                  name="contrasenia"
                  value={formData.contrasenia}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Ingrese su contraseña"
                  maxLength={20}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ cursor: "pointer", marginLeft: "10px" }}
                >
                  {showPassword ? "🙈" : "👁️"} {/* Icono de ojo */}
                </span>
              </div>
            </div>
          )}


          {/* Horario */}
          {showHorario && (
            <div className="form-group">
              <label>Horario:</label>
              <select
                name="idhorario"
                value={formData.idhorario}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un horario</option>
                {horarios.map((horario) => (
                  <option key={horario.idhorario} value={horario.idhorario}>
                    {horario.horainicio} - {horario.horafin}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="form-buttons">
          <button
            type="submit"
            className="submit-button"
            disabled={
              showContrasenia &&
              (!formData.contrasenia || !validatePassword(formData.contrasenia))
            }
          >
            Crear Usuario
          </button>
          <button type="button" onClick={handleReset} className="reset-button">
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;