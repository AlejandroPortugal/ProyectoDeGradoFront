import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './auth';  // Proveedor de autenticación
import ProtectedRoute from './protectedRoutes.jsx'; // Ruta protegida
import Menu from './components/Menu';
import UserManagementHome from './pages/UserManagementHome.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import Login from './components/Login.jsx';
import UserManagementForm from './pages/UserManagementForm.jsx';
import UserProfesorHome from './pages/UserProfesorHome.jsx';
import Unauthorized from './components/Unauthorized'; // Asegúrate de crear o importar este componente
import FormActas from './components/ComponentsProfesores/FormActas.jsx';
import InicioProfesores from './components/ComponentsProfesores/InicioProfesores.jsx';
import UserListPadres from './pages/UserListPadres.jsx';
import CitarPadres from './components/ComponentsProfesores/CitarPadres.jsx';
import ListEntrevistas from './components/ComponentsProfesores/ListEntrevistas.jsx';
import Informe from './components/Informe.jsx';
import ListActas from './components/ComponentsProfesores/ListEstudiantes.jsx'

import EditarActa from './components/ComponentsProfesores/EditarActa.jsx';
import ListEstudiantes from './components/ComponentsProfesores/ListEstudiantes.jsx';
import ListaActas from './components/ComponentsProfesores/ListaActas.jsx';
import EliminarActas from './components/ComponentsProfesores/EliminarActas.jsx';
import MenuPadres from '../src/components/ComponentesPadresdeFamilia/MenuPadres.jsx';
import ListaProfesoresEntrevista from './components/ComponentesPadresdeFamilia/ListaProfesoresEntrevista.jsx';
import AgendarEntrevista from './components/ComponentesPadresdeFamilia/AgendarEntrevista.jsx';
import InicioPadres from './components/ComponentesPadresdeFamilia/InicioPadres.jsx';
import ListProfesoresInfo from './components/ComponentesPadresdeFamilia/ListProfesoresInfo.jsx';
import HistorialEntrevistas from './components/ComponentesPadresdeFamilia/HistorialEntrevistas.jsx';
import Contacto from './components/ComponentesPadresdeFamilia/Contacto.jsx';
import RegistroPadres from './components/ComponentesPadresdeFamilia/RegistroPadres.jsx';
import RegistroContraseña from './components/ComponentesPadresdeFamilia/RegistroContraseña.jsx';
import RegistroDatos from './components/ComponentesPadresdeFamilia/RegistroDatos.jsx';
import ConfirmacionCorreo from './components/ComponentesPadresdeFamilia/ConfirmacionCorreo.jsx';
import ControlIngresos from './components/ControlIngresos.jsx';
import Configuraciones from './components/Configuraciones.jsx';
import RecuperarUsuarios from './components/RecuperarUsuarios.jsx';


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

  const hideMenuRoutes = [
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
  

  return (
    <>
      {/* Renderiza el menú solo si no está en las rutas de ocultar */}
      {shouldShowMenu && <Menu />}
      <div style={{ marginLeft: shouldShowMenu ? "250px" : "0", padding: "20px" }}>
        <Routes>
          {/* Define tus rutas aquí */}
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
            path="/"
            element={
              <ProtectedRoute role="Administrador">
                <UserManagementHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="Administrador">
                <UserManagementHome />
              </ProtectedRoute>
            }
          />
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
                <UserManagementForm />
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
