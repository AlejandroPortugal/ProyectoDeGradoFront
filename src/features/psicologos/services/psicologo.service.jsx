import axios from 'axios';

const base_URL = 'http://localhost:4000/';

export const getPsicologo = () => {
    return axios.get(`${base_URL}obtener/psicologos`);
};

export const getPsicologoById = (idpsicologo) => {
    return axios.get(`${base_URL}obtener/psicologosById/${idpsicologo}`);  // Se asegura de recibir el ID del psicólogo
};

export const postPsicologo = (formData) => {
    return axios.post(`${base_URL}crear/psicologo`, formData);
};

export const putPsicologo = (idpsicologo, formData) => {
    return axios.put(`${base_URL}actualizar/psicologo/${idpsicologo}`, formData);  // Se pasa el ID del psicólogo en la URL
};

export const deletePsicologo = (idpsicologo) => {
    return axios.delete(`${base_URL}eliminar/psicologo/${idpsicologo}`);  // Se pasa el ID del psicólogo en la URL
};
