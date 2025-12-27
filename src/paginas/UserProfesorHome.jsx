import React from 'react';
import Menu from '../components/Menu.jsx';

import FormActas from '../components/ComponentsProfesores/ListEstudiantes.jsx';
import Header from '../components/Header.jsx';


const UserProfesorHome = () => {
    return (
        <div>
            <Menu/>
            <Header title={"Gestion de Actas"} subtitle={"Bienvenido al sistema escolar IDEB"}/>
            
            
        </div>
    );
};

export default UserProfesorHome;
