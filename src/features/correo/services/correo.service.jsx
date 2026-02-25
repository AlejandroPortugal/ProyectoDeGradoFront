import { api } from "../../service/api";



// Servicio para enviar un correo electrónico
export const enviarCorreo = (data) => {
    return api.post(`/enviarCorreo`, data);
};

export const enviarCorreoDeConfirmacion = (data) => {
    return api.post(`/enviarCorreoConfirmacion`, data);
};
