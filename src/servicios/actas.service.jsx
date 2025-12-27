import axios from 'axios';

// Establece la URL base de tu backend
const base_URL = 'http://localhost:4000/';

// Servicio para obtener todas las actas de reunión
export const getActasReunion = () => {
    return axios.get(`${base_URL}obtener/actareunion`);
};

// Servicio para obtener una acta de reunión por su ID
export const getActaReunionById = (idActa) => {
    return axios.get(`${base_URL}obtener/actareunion/${idActa}`); // Asegúrate de pasar el id
};

// Servicio para crear una nueva acta de reunión
export const createActaReunion = (actaData) => {
    return axios.post(`${base_URL}crear/actareunion`, actaData);
};

    // Servicio para actualizar una acta de reunión por su ID
    export const updateActaReunion = (idActa, actaData) => {
        return axios.put(`${base_URL}actualizar/actareunion/${idActa}`, actaData);
      };
      
      

// Servicio para eliminar una acta de reunión por su ID
export const deleteActaReunion = (idActa) => {
    return axios.put(`${base_URL}eliminar/actareunion/${idActa}`); // Asegúrate de pasar el id
};


export const getActasReunionByEstudiante = (idestudiante) => {
  return axios.get(`${base_URL}actas/estudiante/${idestudiante}`);
};


export const activateActaReunion = (idActa) => {
    return axios.put(`${base_URL}activar/actareunion/${idActa}`);
  };

  
  export const getInactivasActas = async () => {
    try {
      const response = await axios.get(`${base_URL}actas/inactivas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener las actas inactivas:', error);
      throw error;
    }
  };