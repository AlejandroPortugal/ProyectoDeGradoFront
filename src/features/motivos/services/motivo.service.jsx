import axios from 'axios';

// Establece la URL base de tu backend
const base_URL = 'http://localhost:4000/';


export const getMotivos = () => {
    return axios.get(`${base_URL}obtener/motivo`);
};

export const getMotivosById = (idMotivo) => {
    return axios.get(`${base_URL}obtener/motivoById/${idMotivo}`); // Asegúrate de pasar el id
};

