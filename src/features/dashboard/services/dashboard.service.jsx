import { api } from "../../service/api"; 
// Ajusta la ruta si tu archivo está más/menos profundo

export const getActiveUsersCount = async () => {
  const { data } = await api.get("/cantidad/usuarios");
  return data.total;
};

export const getActiveProfessorsCount = async () => {
  const { data } = await api.get("/cantidad/profesores");
  return data.total;
};

// Entrevistas semanales
export const getWeeklyInterviews = async () => {
  try {
    const { data } = await api.get("/entrevistas/semanales");
    return data;
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return [];
  }
};

export const getInterviewStatusCounts = async () => {
  const { data } = await api.get("/entrevistas/estado");
  return data;
};

export const getMostRequestedSubject = async () => {
  try {
    const { data } = await api.get("/materia/masDemandada");

    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        id: index,
        value: parseInt(item.cantidad, 10),
        label: item.nombre,
      }));
    }
    return [];
  } catch (error) {
    console.error("Error al obtener la materia más demandada:", error);
    return [];
  }
};

export const getMostRequestedProfessor = async () => {
  const { data } = await api.get("/profesor/mas-demandado");
  return data.profesor;
};
