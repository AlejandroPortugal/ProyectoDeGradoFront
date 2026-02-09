import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth';  // Proveedor de autenticación
import ProtectedRoute from './protectedRoutes.jsx'; // Ruta protegida
import Menu from './components/Menu';
import UserManagementHome from './features/administracion/pages/UserManagementHome.jsx';
import UserManagementPage from './features/administracion/pages/UserManagementPage.jsx';
import Login from './features/auth/pages/Login.jsx';
import Unauthorized from './components/Unauthorized'; // Asegúrate de crear o importar este componente
import FormActas from './features/actas/pages/FormActas.jsx';
import InicioProfesores from './features/inicioDocente/pages/InicioProfesores.jsx';
import UserListPadres from './features/padres/pages/UserListPadres.jsx';
import CitarPadres from './features/entrevistas/pages/CitarPadres.jsx';
import ListEntrevistas from './features/entrevistas/pages/ListEntrevistas.jsx';
import Informe from './features/administracion/pages/Informe.jsx';
  
import EditarActa from './features/actas/pages/EditarActa.jsx';
import ListEstudiantes from './features/estudiantes/pages/ListEstudiantes.jsx';
import ListaActas from './features/actas/pages/ListaActas.jsx';
import EliminarActas from './features/actas/pages/EliminarActas.jsx';
import ListaProfesoresEntrevista from './features/padres/pages/ListaProfesoresEntrevista.jsx';
import AgendarEntrevista from './features/padres/pages/AgendarEntrevista.jsx';
import InicioPadres from './features/padres/pages/InicioPadres.jsx';
import ListProfesoresInfo from './features/padres/pages/ListProfesoresInfo.jsx';
import HistorialEntrevistas from './features/padres/pages/HistorialEntrevistas.jsx';
import Contacto from './features/padres/pages/Contacto.jsx';
import RegistroPadres from './features/padres/pages/RegistroPadres.jsx';
import RegistroContraseña from './features/padres/pages/RegistroContraseña.jsx';
import RegistroDatos from './features/padres/pages/RegistroDatos.jsx';
import ConfirmacionCorreo from './features/padres/pages/ConfirmacionCorreo.jsx';
import ControlIngresos from './features/administracion/pages/ControlIngresos.jsx';
import Configuraciones from './features/configuracion/pages/Configuraciones.jsx';
import RecuperarUsuarios from './features/administracion/pages/RecuperarUsuarios.jsx';
import FormularioCreacion from './features/administracion/pages/FormularioCreacion.jsx';
import LandingPage from './features/landing/pages/LandingPage.jsx';


const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};
const AppContent = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const hideMenuRoutes = [
    "/",
    "/login",
    "/unauthorized",
    "/padres",
    "/listaprofesoresentrevistas",
    "/agendarentrevistapadre",
    "/padreshome",
    "/listaProfesoresEntrevistasadas",
    "/historialCitas",
    "/contacto",
    "/register",
    "/registrodecontrasenia",
    "/registrodatos",
    "/confirmarcuenta"
  ];
  

  // Determina si el menú debe mostrarse
  const shouldShowMenu = !hideMenuRoutes.some(
    (route) => route.toLowerCase() === location.pathname.toLowerCase()
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const sidebarWidth = 'clamp(240px, 24vw, 280px)';

  const contentStyle = {
    marginLeft: shouldShowMenu && !isMobile ? sidebarWidth : '0',
    padding: '20px',
    transition: 'margin-left 0.28s ease',
  };
  

  return (
    <>
      {/* Renderiza el menú solo si no está en las rutas de ocultar */}
      {shouldShowMenu && <Menu />}
      <div style={contentStyle}>
        <Routes>
          {/* Define tus rutas aquí */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/configs"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo', 'Administrador']}>
                <Configuraciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listaProfesoresEntrevistasadas"
            element={
              <ProtectedRoute role= "Padre de Familia">
                <ListProfesoresInfo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrodecontrasenia"
            element={<RegistroContraseña />}
          />
          <Route
            path="/confirmarcuenta"
            element={<ConfirmacionCorreo />}
          />
          
          <Route
            path="/registrodatos"
            element={<RegistroDatos />}
          />
          
          <Route
            path="/register"
            element={<RegistroPadres />}
          />
          
          <Route
            path="/contacto"
            element={<Contacto />}
          />
          <Route
            path="/listaprofesoresentrevistas"
            element={
              <ProtectedRoute role="Padre de Familia">
                <ListaProfesoresEntrevista />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historialCitas"
            element={
              <ProtectedRoute role="Padre de Familia">
                <HistorialEntrevistas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agendarEntrevistaPadre"
            element={
              <ProtectedRoute role="Padre de Familia">
                <AgendarEntrevista />
              </ProtectedRoute>
            }
          />

          {/* Administrador */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="Administrador">
                <UserManagementHome />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/listar"
            element={
              <ProtectedRoute role="Administrador">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agregar"
            element={
              <ProtectedRoute role="Administrador">
                <FormularioCreacion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editar"
            element={
              <ProtectedRoute role="Administrador">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute role="Administrador">
                <Informe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ingresos"
            element={
              <ProtectedRoute role="Administrador">
                <ControlIngresos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/usuariosRecuperados"
            element={
              <ProtectedRoute role="Administrador">
                <RecuperarUsuarios />
              </ProtectedRoute>
            }
          />

          {/* Profesor */}

          <Route
            path="/profesor"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <InicioProfesores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listaEntrevistas"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <ListEntrevistas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crearActa"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <ListEstudiantes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/formActa"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <FormActas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/psicologoListPadres"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <UserListPadres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/formCitas"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <CitarPadres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editarActa"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <EditarActa />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verActas"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <ListaActas />
              </ProtectedRoute>
            }
          />


          {/* Psicologo */}

          <Route
            path="/psicologo"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <InicioProfesores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/psicologoHome"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <InicioProfesores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listaEntrevistas"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <ListEntrevistas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/crearActa"
            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <FormActas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/psicologoListPadres"

            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <UserListPadres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/form-actas"

            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <FormActas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/formCitas"

            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <CitarPadres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eliminaracta"

            element={
              <ProtectedRoute role={['Profesor', 'Psicologo']}>
                <EliminarActas />
              </ProtectedRoute>
            }
          />

           {/* Rutas local Padres */}

           <Route
            path="/padresHome"

            element={ 
                <InicioPadres />
            }
          />

<Route
  path="/padres"
  element={
      <InicioPadres />
  }
/>

        </Routes>

        

      </div>
    </>
  );
};

export default App;
