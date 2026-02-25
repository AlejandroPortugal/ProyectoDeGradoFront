import { api } from "../../service/api";

// Establece la URL base de tu backend



export const getMotivos = () => {
    return api.get(`/obtener/motivo`);
};

export const getMotivosById = (idMotivo) => {
    return api.get(`/obtener/motivoById/${idMotivo}`); // Asegúrate de pasar el id
};


