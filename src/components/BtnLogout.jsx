import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import './BtnLogout.css';
import userLogo from '../recursos/icons/userblack.svg';
import BtnActionsText from './botones/BtnActionsText';
import AuthContext from '../auth'; // Asegúrate de importar el contexto

const BtnLogout = () => {
  const { logout } = useContext(AuthContext); // Utiliza el contexto para el logout
  const navigate = useNavigate(); // Hook para la navegación

  const handleLogout = () => {
    logout(); // Llamar a la función de logout
  };

  const handleUserLogoClick = () => {
    navigate('/configs'); // Redirigir a la ruta /configs
  };

  return (
    <section className="btnLogout-container">
      <img
        src={userLogo}
        alt="user icon"
        height={30}
        width={40}
        onClick={handleUserLogoClick} // Asocia la redirección al clic en el logo
        style={{ cursor: 'pointer' }} // Cambia el cursor a pointer para indicar que es clickeable
      />
      <BtnActionsText color={'green'} text={'Log out'} onClick={handleLogout} />
    </section>
  );
};

export default BtnLogout;

