import axios from 'axios';
const base_URL = 'http://localhost:4000/';

export const getMaterias = () => axios.get(`${base_URL}materias`);

export const getMateria = () => {
    return axios.get(`${base_URL}obtener/materia`);
};

export const getMateriaById = (idMateria) => {
    return axios.get(`${base_URL}obtener/materiaById/${idMateria}`);
};

export const getMateriaForPsicologo = () => {
    return axios.get(`${base_URL}obtener/materiaForPsicologo`);
};
