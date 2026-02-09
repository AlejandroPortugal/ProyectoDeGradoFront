import axios from 'axios';

const base_URL = 'http://localhost:4000/';

export const getPadre = () => {
  return axios.get(`${base_URL}obtener/padresdefamilia`);
};

export const getPadreById = (idPadre) => {
  return axios.get(`${base_URL}obtener/padredefamilia/${idPadre}`);
};

export const getPadreConEstudiantes = (idPadre) => {
  return axios.get(`${base_URL}padre/${idPadre}/estudiantes`);
};

export const postPadre = (formData) => {
  return axios.post(`${base_URL}crear/padredefamilia`, formData);
};

export const putPadre = (idpadre, formData) => {
  return axios.put(`${base_URL}actualizar/padredefamilia/${idpadre}`, formData);
};

export const deletePadre = (idpadre) => {
  return axios.delete(`${base_URL}eliminar/padredefamilia/${idpadre}`);
};

// Obtener todos los padres de familia
export const getDatePadres = async () => {
  return axios.get(`${base_URL}obtener/datos/padres`);
};
