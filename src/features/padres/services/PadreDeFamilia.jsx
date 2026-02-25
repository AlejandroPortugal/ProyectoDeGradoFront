import { api } from "../../service/api";

export const getPadre = () => {
  return api.get(`/obtener/padresdefamilia`);
};

export const getPadreById = (idPadre) => {
  return api.get(`/obtener/padredefamilia/${idPadre}`);
};

export const getPadreConEstudiantes = (idPadre) => {
  return api.get(`/padre/${idPadre}/estudiantes`);
};

export const postPadre = (formData) => {
  return api.post(`/crear/padredefamilia`, formData);
};

export const putPadre = (idpadre, formData) => {
  return api.put(`/actualizar/padredefamilia/${idpadre}`, formData);
};

export const deletePadre = (idpadre) => {
  return api.delete(`/eliminar/padredefamilia/${idpadre}`);
};

// Obtener todos los padres de familia
export const getDatePadres = async () => {
  return api.get(`/obtener/datos/padres`);
};
