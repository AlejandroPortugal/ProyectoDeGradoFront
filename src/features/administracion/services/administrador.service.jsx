import axios from 'axios'

const base_URL = 'http://localhost:4000/'

export const getAdministrador = () => {
    return axios.get(`${base_URL}obtener/administradores`);
};

export const getAdministradorById = (id) => {
    if (!id) {
        console.error("El ID del administrador es indefinido.");
        return;
    }
    return axios.get(`${base_URL}obtener/administrador/${id}`);
};

export const postAdministrador = (formData) => {
    return axios.post(`${base_URL}crear/administrador`, formData);
};

export const putAdministrador = (id, formData) => {
    if (!id) {
        console.error("El ID del administrador es indefinido para actualizar.");
        return;
    }
    return axios.put(`${base_URL}actualizar/administrador/${id}`, formData);
};

export const deleteAdministrador = (id) => {
    if (!id) {
        console.error("El ID del administrador es indefinido para eliminar.");
        return;
    }
    return axios.delete(`${base_URL}eliminar/administrador/${id}`);
};