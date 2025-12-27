import axios from 'axios';

const base_URL = 'http://localhost:4000/';


export const getHorarios = () => {
    return axios.get(`${base_URL}obtener/horarios`);
};



export const getHorariosById = (idhorario) => {
    return axios.get(`${base_URL}obtener/horario/${idhorario}`); // El ID debe estar presente en la URL
};
