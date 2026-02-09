import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuPadres.css';
import AuthContext from '../../../auth.jsx'; // Importar contexto de autenticación
import listIcon from '../../../recursos/icons/list.svg'; // Icono de hamburguesa

const MenuPadres = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext); // Obtener la función logout desde el contexto
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para abrir/cerrar el menú

  const handleNavigation = (route) => {
    setIsMenuOpen(false); // Cerrar el menú al navegar
    navigate(route);
  };

  const handleLogout = () => {
    logout(); // Llamar al método de logout para limpiar la sesión
    navigate('/login'); // Redirigir al login
  };

  return (
    <div>
      <nav className="user-menu">
        {/* Botón de menú de hamburguesa */}
        <button
          className="hamburger-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <img src={listIcon} alt="Menu" className="hamburger-icon" />
        </button>

        {/* Lista de opciones del menú */}
        <ul className={`menu-list ${isMenuOpen ? 'open' : ''}`}>
          <li className="menu-item" onClick={() => handleNavigation('/padresHome')}>
            Inicio
          </li>
          <li
            className="menu-item"
            onClick={() => handleNavigation('/listaProfesoresEntrevistas')}
          >
            Agendar Entrevista
          </li>
          <li
            className="menu-item"
            onClick={() => handleNavigation('/listaProfesoresEntrevistasadas')}
          >
            Lista de Profesores
          </li>
          <li className="menu-item" onClick={() => handleNavigation('/contacto')}>
            Contactanos
          </li>
          <li className="menu-item" onClick={() => handleNavigation('/historialCitas')}>
            Historial de Citas
          </li>
          <li className="menu-item" onClick={() => handleNavigation('/horarioEntrevistas')}>
            Horario de entrevistas
          </li>
          <li className="menu-item logout-item" onClick={handleLogout}>
            <span className="user-icon">&#128100;</span> Cerrar Sesión
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default MenuPadres;

