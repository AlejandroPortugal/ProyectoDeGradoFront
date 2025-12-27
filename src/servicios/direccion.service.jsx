import axios from 'axios';

const base_URL = 'http://localhost:4000/';

// Servicio para obtener todas las direcciones activas
export const getDirecciones = () => {
  return axios.get(`${base_URL}obtener/direcciones`);
};

// Servicio para obtener una dirección por ID
export const getDireccionById = (iddireccion) => {
  return axios.get(`${base_URL}obtener/direccion/${iddireccion}`);
};

// Servicio para crear una nueva dirección
export const createDireccion = (direccionData) => {
  return axios.post(`${base_URL}crear/direccion`, direccionData);
};

// Servicio para actualizar una dirección
export const updateDireccion = (iddireccion, direccionData) => {
  return axios.put(`${base_URL}actualizar/direccion/${iddireccion}`, direccionData);
};

// Servicio para desactivar (eliminar lógicamente) una dirección
export const deleteDireccion = (iddireccion) => {
  return axios.delete(`${base_URL}eliminar/direccion/${iddireccion}`);
};
