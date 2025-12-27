import React, { useState } from 'react';
import iconHome from '../recursos/icons/home-2.svg';
import iconUser from '../recursos/icons/user.svg';
import BtnIcon from './botones/BtnIcon';

const btnsIcons = [
  {
    icon: iconHome,
    text: 'Inicio',
    link: '',  // Ruta a UserManagementHome
  },
  {
    icon: iconUser,
    text: 'Gestión de Usuarios',
    dropdown: [
      { text: 'Listar Usuarios', link: '../paginas/UserManagementPage.jsx' },  // Ruta a UserManagementPage
    ]
  }
];

const ListBtnIcons = () => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);

  const handleDropdownToggle = (index) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  return (
    <>
      {btnsIcons.map((btns, index) => (
        <div key={index}>
          <BtnIcon
            icon={btns.icon}
            text={btns.text}
            link={btns.link}  // Pasamos la ruta al botón principal
            active={openDropdownIndex === index}
            onClick={() => handleDropdownToggle(index)}
            dropdown={btns.dropdown}  // Pasamos las opciones del dropdown
          />
        </div>
      ))}
    </>
  );
};

export default ListBtnIcons;

