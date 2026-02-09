import axios from 'axios'

const base_URL = 'http://localhost:4000/'

export const getCursos = () => {
    return axios.get(`${base_URL}obtener/cursos`);
};
export const getCursosById = (idCurso) => {
    return axios.get(`${base_URL}obtener/cursosById/${idCurso}`);
};
