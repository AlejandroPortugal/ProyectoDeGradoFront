import axios from 'axios';

const base_URL = 'http://localhost:4000/';

export const getActiveUsersCount = async () => {
    const response = await axios.get(`${base_URL}cantidad/usuarios`);
    return response.data.total;
};

export const getActiveProfessorsCount = async () => {
    const response = await axios.get(`${base_URL}cantidad/profesores`);
    return response.data.total;
};

//Entrevistas semanales
export const getWeeklyInterviews = async () => {
    try {
      const response = await axios.get(`${base_URL}entrevistas/semanales`);

      return response.data;
    } catch (error) {
      console.error("Error en la solicitud Axios:", error);
      return [];
    }
  };

export const getInterviewStatusCounts = async () => {
    const response = await axios.get(`${base_URL}entrevistas/estado`);
    return response.data;
};

export const getMostRequestedSubject = async () => {
    try {
      // Realiza la solicitud al backend para obtener las materias más demandadas
      const response = await axios.get(`${base_URL}materia/masDemandada`);
  
      // Verifica si la respuesta es un array
      if (Array.isArray(response.data)) {
        // Mapea los datos al formato requerido por el gráfico
        return response.data.map((item, index) => ({
          id: index,
          value: parseInt(item.cantidad, 10),
          label: item.nombre
        }));
      }
      return [];
    } catch (error) {
      console.error("Error al obtener la materia más demandada:", error);
      return [];
    }
  };

export const getMostRequestedProfessor = async () => {
    const response = await axios.get(`${base_URL}profesor/mas-demandado`);
    return response.data.profesor;
};
