import { api } from "../../service/api"



export const getUsuarios = async () => {
    return api.get(`/obtener/usuarios`);
};

// Servicio para filtrar usuarios
export const filterUsuarios = (searchTerm) => {
    return api.get(`/usuarios/filtrar`, { params: { searchTerm } });
  };

  // Servicio para obtener todos los usuarios del sistema
  export const getAllUserEntries = async (token) => {
    return api.get(`/obtener/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`, // Incluir el token en la cabecera
      },
    });
  };
  
  // Servicio para filtrar usuarios por término de búsqueda
  export const filterUsers = async (searchTerm) => {
    return api.get(`/usuarios/filtrar`, {
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
  
    return api.post(`/ingresoslogin`, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // Enviar el token para autenticación
      },
    });
  };

  // Servicio para obtener todos los ingresos registrados
export const getIngresos = async (token) => {
    return api.get(`/ingresos`, {
      headers: {
        Authorization: `Bearer ${token}`, // Token para autenticación
      },
    });
  };


  export const getUsuariosConIngresos = async (token) => {
    return api.get(`/usuarios-ingresos`, {
      headers: {
        Authorization: `Bearer ${token}`, // Enviar token para autenticación
      },
    });
  };

  // Servicio para obtener ingresos por rango de fechas
export const obtenerIngresosPorRango = async ({ startDate, endDate }) => {
    try {
        const response = await api.post(`/ingresos/rango`, { startDate, endDate });
        return response.data;
    } catch (error) {
        console.error("Error al obtener ingresos por rango:", error);
        throw error.response ? error.response.data : { error: "Error al conectar con el servidor." };
    }
};

// Servicio para obtener la cantidad de usuarios con ingresos
export const getCantidadUsuariosConIngresos = async () => {
    try {
      const response = await api.get(`/cantidad-usuarios-ingresos`);
      return response.data; // Devuelve { cantidad: X }
    } catch (error) {
      console.error('Error al obtener la cantidad de usuarios con ingresos:', error);
      throw error; // Lanza el error para manejarlo en el frontend
    }
  };

  // Servicio para listar usuarios inactivos
export const listarUsuariosInactivos = async () => {
    try {
      const response = await api.get(`/usuarios/inactivos`);
      return response.data;
    } catch (error) {
      console.error('Error al listar usuarios inactivos:', error);
      throw error; // Lanza el error para manejarlo en el frontend
    }
  };
  
  // Servicio para activar un usuario (cambiar estado a true)
  export const activarUsuario = async (id, rol) => {
    try {
      const response = await api.put(`/usuarios/activar`, { id, rol });
      return response.data;
    } catch (error) {
      console.error('Error al activar el usuario:', error);
      throw error; // Lanza el error para manejarlo en el frontend
    }
  };

