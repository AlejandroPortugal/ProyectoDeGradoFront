import axios from 'axios'

const base_URL = 'http://localhost:4000/'

export const getUsuarios = async () => {
    return axios.get(`${base_URL}obtener/usuarios`);
};

// Servicio para filtrar usuarios
export const filterUsuarios = (searchTerm) => {
    return axios.get(`${baseURL}usuarios/filtrar`, { params: { searchTerm } });
  };

  // Servicio para obtener todos los usuarios del sistema
  export const getAllUserEntries = async (token) => {
    return axios.get(`${baseURL}/obtener/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`, // Incluir el token en la cabecera
      },
    });
  };
  
  // Servicio para filtrar usuarios por término de búsqueda
  export const filterUsers = async (searchTerm) => {
    return axios.get(`${baseURL}usuarios/filtrar`, {
      params: { searchTerm },
    });
  };


  // Servicio para registrar el ingreso del usuario logueado
export const registerUserLogin = async (idUsuario, nombreCompleto, rol, token) => {
    const currentDateTime = new Date();
    const fechaIngreso = currentDateTime.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const horaIngreso = currentDateTime.toTimeString().split(' ')[0]; // Formato HH:MM:SS
  
    const payload = {
      idUsuario,
      nombreCompleto,
      rol,
      fechaIngreso,
      horaIngreso,
    };
  
    return axios.post(`${base_URL}ingresoslogin`, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // Enviar el token para autenticación
      },
    });
  };

  // Servicio para obtener todos los ingresos registrados
export const getIngresos = async (token) => {
    return axios.get(`${base_URL}ingresos`, {
      headers: {
        Authorization: `Bearer ${token}`, // Token para autenticación
      },
    });
  };


  export const getUsuariosConIngresos = async (token) => {
    return axios.get(`${base_URL}usuarios-ingresos`, {
      headers: {
        Authorization: `Bearer ${token}`, // Enviar token para autenticación
      },
    });
  };

  // Servicio para obtener ingresos por rango de fechas
export const obtenerIngresosPorRango = async ({ startDate, endDate }) => {
    try {
        const response = await axios.post(`${base_URL}ingresos/rango`, { startDate, endDate });
        return response.data;
    } catch (error) {
        console.error("Error al obtener ingresos por rango:", error);
        throw error.response ? error.response.data : { error: "Error al conectar con el servidor." };
    }
};

// Servicio para obtener la cantidad de usuarios con ingresos
export const getCantidadUsuariosConIngresos = async () => {
    try {
      const response = await axios.get(`${base_URL}cantidad-usuarios-ingresos`);
      return response.data; // Devuelve { cantidad: X }
    } catch (error) {
      console.error('Error al obtener la cantidad de usuarios con ingresos:', error);
      throw error; // Lanza el error para manejarlo en el frontend
    }
  };

  // Servicio para listar usuarios inactivos
export const listarUsuariosInactivos = async () => {
    try {
      const response = await axios.get(`${base_URL}usuarios/inactivos`);
      return response.data;
    } catch (error) {
      console.error('Error al listar usuarios inactivos:', error);
      throw error; // Lanza el error para manejarlo en el frontend
    }
  };
  
  // Servicio para activar un usuario (cambiar estado a true)
  export const activarUsuario = async (id, rol) => {
    try {
      const response = await axios.put(`${base_URL}usuarios/activar`, { id, rol });
      return response.data;
    } catch (error) {
      console.error('Error al activar el usuario:', error);
      throw error; // Lanza el error para manejarlo en el frontend
    }
  };
