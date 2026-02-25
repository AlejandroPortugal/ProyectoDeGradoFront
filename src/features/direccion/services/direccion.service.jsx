import { api } from "../../service/api";



// Servicio para obtener todas las direcciones activas
export const getDirecciones = () => {
  return api.get(`/obtener/direcciones`);
};

// Servicio para obtener una dirección por ID
export const getDireccionById = (iddireccion) => {
  return api.get(`/obtener/direccion/${iddireccion}`);
};

// Servicio para crear una nueva dirección
export const createDireccion = (direccionData) => {
  return api.post(`/crear/direccion`, direccionData);
};

// Servicio para actualizar una dirección
export const updateDireccion = (iddireccion, direccionData) => {
  return api.put(`/actualizar/direccion/${iddireccion}`, direccionData);
};

// Servicio para desactivar (eliminar lógicamente) una dirección
export const deleteDireccion = (iddireccion) => {
  return api.delete(`/eliminar/direccion/${iddireccion}`);
};

