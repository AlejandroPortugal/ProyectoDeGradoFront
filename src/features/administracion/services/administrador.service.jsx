import { api } from "../../service/api"



export const getAdministrador = () => {
    return api.get(`/obtener/administradores`);
};

export const getAdministradorById = (id) => {
    if (!id) {
        console.error("El ID del administrador es indefinido.");
        return;
    }
    return api.get(`/obtener/administrador/${id}`);
};

export const postAdministrador = (formData) => {
    return api.post(`/crear/administrador`, formData);
};

export const putAdministrador = (id, formData) => {
    if (!id) {
        console.error("El ID del administrador es indefinido para actualizar.");
        return;
    }
    return api.put(`/actualizar/administrador/${id}`, formData);
};

export const deleteAdministrador = (id) => {
    if (!id) {
        console.error("El ID del administrador es indefinido para eliminar.");
        return;
    }
    return api.delete(`/eliminar/administrador/${id}`);
};
