import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../auth.jsx';
import loginService from '../service/login.service.jsx';
import Toast from '../components/Toast';
import logo from '../assets/icons/logo.svg';
import { registerUserLogin } from '../service/users.service.jsx';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginService.login(email, password);
      login(data.token, data.user);

      try {
        await registerUserLogin(
          data.user.id,
          `${data.user.nombres} ${data.user.apellidopaterno} ${data.user.apellidomaterno}`,
          data.user.role,
          data.token
        );
      } catch (err) {
        console.error('Error al registrar el ingreso:', err);
      }

      switch (data.user.role) {
        case 'Administrador':
          navigate('/admin');
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
