import React, { useState, useContext, useEffect } from 'react';
import './Menu.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../recursos/icons/logo.svg';
import iconHome from '../recursos/icons/home-2.svg';
import iconEntrevista from '../recursos/icons/UserCheck.svg'
import userIcon from '../recursos/icons/user.svg';
import rowIcon from '../recursos/icons/Vector.svg';
import iconInfo from '../recursos/icons/File.svg';
import AuthContext from '../auth.jsx';
import iconAdd from '../recursos/icons/add.svg'
import iconEdit from '../recursos/icons/Edit.svg'
import iconDelete from '../recursos/icons/delete.svg'
import notificationIcon from '../recursos/icons/notifications.svg';
import iconFile from '../recursos/icons/File.svg'
import iconCheck from '../recursos/icons/UserCheck.svg'
import userLogo from '../recursos/icons/userblack.svg';

const Menu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [DropdownInfo, setDropdownInfo] = useState(false);
  const [DropdownActas, setDropdownActas] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  

  useEffect(() => {
    if (user && !['Administrador', 'Profesor', 'Psicologo', 'Padre de Familia'].includes(user.role)) {
      navigate('/unauthorized');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/configs');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDropdownInfo = () => {
    setDropdownInfo(!DropdownInfo);
  };

  const toggleDropdownActas = () => {
    setDropdownActas(!DropdownActas);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const sidebarClassName = `sidebar${isMobile && isMobileMenuOpen ? ' open' : ''}`;

  const isProfesorOrPsicologo = user?.role === 'Profesor' || user?.role === 'Psicologo';
  const isAdministrador = user?.role === 'Administrador';

  return (
    <>
      {isMobile && (
        <header className="mobile-navbar">
          <button
            type="button"
            className={`mobile-navbar__toggle${isMobileMenuOpen ? ' is-active' : ''}`}
            aria-label={isMobileMenuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={toggleMobileMenu}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="mobile-navbar__brand">
            <img src={logo} alt="Loguito" />
            <span>IDEB SISTEMA ESCOLAR</span>
          </div>
        </header>
      )}

      {isMobile && (
        <div
          className={`sidebar-backdrop${isMobileMenuOpen ? ' show' : ''}`}
          onClick={closeMobileMenu}
        />
      )}
    
      <div className={sidebarClassName}>
        <div className='Img-container'>
          <img src={logo} alt='Loguito' />
        </div>
        <h2 className="sidebar-title">IDEB SISTEMA ESCOLAR</h2>
        <ul className="sidebar-menu">
          <div className='hr-barra'>
            <hr />
          </div>

          {isAdministrador && (
            <li>
              <div className='sidebar-container'>
                <Link to="/dashboard" className="sidebar-link">
                  Inicio
                  <i className='Icon-container-menu'>
                    <img src={iconHome} alt='Home' />
                  </i>
                </Link>
              </div>
            </li>
          )}

          {isAdministrador && (
            <li>
              <div className='sidebar-container'>
                <div className="sidebar-link" onClick={toggleDropdown}>
                  Gestion de Usuarios
                  <i className={`Icon-container-menu ${isDropdownOpen ? 'rotate' : ''}`}>
                    <img src={rowIcon} alt='Dropdown' />
                  </i>
                </div>
              </div>
            </li>
          )}

          {isDropdownOpen && isAdministrador && (
            <ul className="dropdown">
              <li className='sidebar-container'>
                <Link to="/listar" className="sidebar-link">
                  Listar Usuarios
                  <i className="Icon-container-menu">
                    <img src={userIcon} alt='Listar Usuarios' />
                  </i>
                </Link>
              </li>

              <li className='sidebar-container'>
                <Link to="/agregar" className="sidebar-link">
                  Agregar nuevo Usuario
                  <i className="Icon-container-menu">
                    <img src={iconAdd} alt='Agregar Usuario' />
                  </i>
                </Link>
              </li>

              <li className='sidebar-container'>
                <Link to="/editar" className="sidebar-link">
                  Editar un Usuario
                  <i className="Icon-container-menu">
                    <img src={iconEdit} alt='Editar Usuario' />
                  </i>
                </Link>
              </li>

              <li className='sidebar-container'>
                <Link to="/ingresos" className="sidebar-link">
                  Control de ingresos
                  <i className="Icon-container-menu">
                    <img src={iconFile} alt='Control de Ingresos' />
                  </i>
                </Link>
              </li>
              <li className='sidebar-container'>
                <Link to="/usuariosRecuperados" className="sidebar-link">
                  Recuperacion de Usuarios
                  <i className="Icon-container-menu">
                    <img src={iconCheck} alt='Control de Ingresos' />
                  </i>
                </Link>
              </li> 
            </ul>
          )}

          {isAdministrador && (
            <li>
              <div className='sidebar-container'>
                <div className="sidebar-link" onClick={toggleDropdownInfo}>
                  Gestion de Informes
                  <i className={`Icon-container-menu ${DropdownInfo ? 'rotate' : ''}`}>
                    <img src={rowIcon} alt='Dropdown' />
                  </i>
                </div>
              </div>
            </li>
          )}

          {DropdownInfo && isAdministrador && (
            <ul className="dropdown">
              <li className='sidebar-container'>
                <Link to="/categorias" className="sidebar-link">
                  Listar Informes
                  <i className="Icon-container-menu">
                    <img src={iconInfo} alt='Listar Informes' />
                  </i>
                </Link>
              </li>
            </ul>
          )}

          {isProfesorOrPsicologo && (
            <li>
              <div className='sidebar-container'>
                <Link to="/psicologoHome" className="sidebar-link">
                  Inicio
                  <i className='Icon-container-menu'>
                    <img src={iconHome} alt='Home' />
                  </i>
                </Link>
              </div>
            </li>
          )}
          {isProfesorOrPsicologo && (
            <li>
              <div className='sidebar-container'>
                <Link to="/listaEntrevistas" className="sidebar-link">
                  Entrevistas
                  <i className='Icon-container-menu'>
                    <img src={iconEntrevista} alt='Home' />
                  </i>
                </Link>
              </div>
            </li>
          )}

          {isProfesorOrPsicologo && (
            <li>
              <div className='sidebar-container'>
                <div className="sidebar-link" onClick={toggleDropdownActas}>
                  Gestion de Actas
                  <i className={`Icon-container-menu ${DropdownActas ? 'rotate' : ''}`}>
                    <img src={rowIcon} alt='Dropdown' />
                  </i>
                </div>
              </div>
            </li>
          )}

          {DropdownActas && isProfesorOrPsicologo && (
            <ul className="dropdown">
              {/*<li className='sidebar-container'>
                <Link to="/crearActa" className="sidebar-link">
                  Crear Acta
                  <i className='Icon-container-menu'>
                    <img src={iconAdd} alt='Home' />
                  </i>
                </Link>
              </li>*/}
              
             
              <li className='sidebar-container'>
                <Link to="/editarActa" className="sidebar-link">
                  Editar una acta
                  <i className='Icon-container-menu'>
                    <img src={iconEdit} alt='Home' />
                  </i>
                </Link>
              </li>
              <li className='sidebar-container'>
                <Link to="/eliminaracta" className="sidebar-link">
                  Eliminar acta
                  <i className='Icon-container-menu'>
                    <img src={iconDelete} alt='Home' />
                  </i>
                </Link>
              </li>
              <li className='sidebar-container'>
                <Link to="/psicologoListPadres" className="sidebar-link">
                  Citar a Padres
                  <i className='Icon-container-menu'>
                    <img src={notificationIcon} alt='Home' />
                  </i>
                </Link>
              </li>
            </ul>
          )}
        </ul>

        {/* Secciï¿½n de usuario en la parte inferior */}
        <div className="sidebar-footer">
          <div className='hr-barra'>
            <hr />
          </div>
          <ul className="sidebar-menu">
            <li>
              <div className='sidebar-container'>
                <div className="sidebar-link" onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                  Perfil
                  <i className='Icon-container-menu'>
                    <img src={userLogo} alt='Perfil' />
                  </i>
                </div>
              </div>
            </li>
            <li>
              <div className='sidebar-container'>
                <div className="sidebar-link" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                  Cerrar Sesión
                  <i className='Icon-container-menu'>
                    <img src={userIcon} alt='Cerrar Sesión' />
                  </i>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Menu;


