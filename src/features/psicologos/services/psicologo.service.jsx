import { api } from "../../service/api";



export const getPsicologo = () => {
    return api.get(`/obtener/psicologos`);
};

export const getPsicologoById = (idpsicologo) => {
    return api.get(`/obtener/psicologosById/${idpsicologo}`);  // Se asegura de recibir el ID del psicólogo
};

export const postPsicologo = (formData) => {
    return api.post(`/crear/psicologo`, formData);
};

export const putPsicologo = (idpsicologo, formData) => {
    return api.put(`/actualizar/psicologo/${idpsicologo}`, formData);  // Se pasa el ID del psicólogo en la URL
};

export const deletePsicologo = (idpsicologo) => {
    return api.delete(`/eliminar/psicologo/${idpsicologo}`);  // Se pasa el ID del psicólogo en la URL
};

