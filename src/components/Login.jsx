import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../auth.jsx';
import loginService from '../servicios/login.service.jsx';
import Toast from '../components/Toast';
import logo from '../recursos/icons/logo.svg';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const registerIngreso = async (user, token) => {
    const roleKeyMap = {
      Administrador: 'idadministrador',
      Profesor: 'idprofesor',
      Psicologo: 'idpsicologo',
    };

    const rawRole = (user.role || user.rol || '').trim();
    const normalizedRole =
      rawRole === rawRole.toLowerCase()
        ? rawRole.charAt(0).toUpperCase() + rawRole.slice(1)
        : rawRole;
    const roleKey = roleKeyMap[normalizedRole];

    if (!roleKey) {
      // Backend solo exige registro para Administrador, Profesor o Psicologo
      return;
    }

    // Elegir el id correcto segun el rol que exige la base de datos
    const actorIdByRole = {
      Administrador:
        user.idadministrador ||
        user.idAdministrador ||
        user.idusuario ||
        user.idUsuario ||
        user.id,
      Profesor:
        user.idprofesor ||
        user.idProfesor ||
        user.idusuario ||
        user.idUsuario ||
        user.id,
      Psicologo:
        user.idpsicologo ||
        user.idPsicologo ||
        user.idusuario ||
        user.idUsuario ||
        user.id,
    };

    const actorId = actorIdByRole[normalizedRole];
    if (!actorId) {
      console.warn('No se encontró un ID válido para registrar el ingreso.');
      return;
    }

    const currentDateTime = new Date();
    const fechaIngreso = currentDateTime.toISOString().split('T')[0];
    const horaIngreso = currentDateTime.toTimeString().split(' ')[0];

    const payload = {
      idUsuario:
        user.idUsuario ||
        user.idusuario ||
        user.id ||
        actorId, // Alinear con el controlador compartido
      nombreCompleto: `${user.nombres || user.Nombres || ''} ${user.apellidopaterno || user.ApellidoPaterno || ''} ${user.apellidomaterno || user.ApellidoMaterno || ''}`
        .replace(/\s+/g, ' ')
        .trim(),
      rol: normalizedRole,
      fechaIngreso,
      horaIngreso,
      // Backends posibles: snake_case / camelCase
      [roleKey]: actorId,
    };

    // Enviar alias para cubrir controladores que usen capitalizaci��n diferente
    if (normalizedRole === 'Profesor') {
      payload.idprofesor = actorId;
      payload.idProfesor = actorId;
    } else if (normalizedRole === 'Administrador') {
      payload.idadministrador = actorId;
      payload.idAdministrador = actorId;
    } else if (normalizedRole === 'Psicologo') {
      payload.idpsicologo = actorId;
      payload.idPsicologo = actorId;
    }

    await axios.post('http://localhost:4000/ingresoslogin', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginService.login(email, password);
      login(data.token, data.user);

      try {
        await registerIngreso(data.user, data.token);
      } catch (err) {
        console.error('Error al registrar el ingreso:', err);
      }

      switch (data.user.role) {
        case 'Administrador':
          navigate('/dashboard');
          break;
        case 'Profesor':
          navigate('/profesor');
          break;
        case 'Padre de Familia':
          navigate('/padres');
          break;
        case 'Psicologo':
          navigate('/psicologo');
          break;
        default:
          navigate('/unauthorized');
      }
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
      setShowToast(true);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="IDEB Logo" className="login-logo" />
        <h2>BIENVENIDO</h2>
        <p>INICIA SESIÓN PARA INGRESAR</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Ingresa tu correo electrónico"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="material-icons-outlined eye-icon"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </div>

          <button type="submit" className="login-button">
            Siguiente
          </button>
        </form>

        <div className="register-link">
          <p>
            ¿No tienes una cuenta? <a href="/register">Regístrate</a>
          </p>
        </div>
      </div>

      {showToast && (
        <Toast
          message={error}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default Login;


