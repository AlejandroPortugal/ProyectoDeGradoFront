import { api } from "../../service/api";

// Establece la URL base de tu backend


// Servicio para obtener todas las actas de reunión
export const getActasReunion = () => {
    return api.get(`/obtener/actareunion`);
};

// Servicio para obtener una acta de reunión por su ID
export const getActaReunionById = (idActa) => {
    return api.get(`/obtener/actareunion/${idActa}`); // Asegúrate de pasar el id
};

// Servicio para crear una nueva acta de reunión
export const createActaReunion = (actaData) => {
    return api.post(`/crear/actareunion`, actaData);
};

    // Servicio para actualizar una acta de reunión por su ID
    export const updateActaReunion = (idActa, actaData) => {
        return api.put(`/actualizar/actareunion/${idActa}`, actaData);
      };
      
      

// Servicio para eliminar una acta de reunión por su ID
export const deleteActaReunion = (idActa) => {
    return api.put(`/eliminar/actareunion/${idActa}`); // Asegúrate de pasar el id
};


export const getActasReunionByEstudiante = (idestudiante) => {
  return api.get(`/actas/estudiante/${idestudiante}`);
};


export const activateActaReunion = (idActa) => {
    return api.put(`/activar/actareunion/${idActa}`);
  };

  
  export const getInactivasActas = async () => {
    try {
      const response = await api.get(`/actas/inactivas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener las actas inactivas:', error);
      throw error;
    }
  };
