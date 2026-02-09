import axios from 'axios';

const base_URL = 'http://localhost:4000/';

export const getEstudiantes = () => {
    return axios.get(`${base_URL}obtener/estudiantes`);
};

export const getEstudianteById = (idestudiante) => {
    return axios.get(`${base_URL}obtener/estudiantes/${idestudiante}`); // El ID debe estar presente en la URL
};

export const postEstudiante = (formData) => {
    return axios.post(`${base_URL}crear/estudiante`, formData);
};

export const putEstudiante = (idEstudiante, formData) => {
    return axios.put(`${base_URL}actualizar/estudiante/${idEstudiante}`, formData); // Se pasa el ID del estudiante en la URL
};

export const deleteEstudiante = (idestudiante) => {
    return axios.delete(`${base_URL}eliminar/estudiante/${idestudiante}`); // Se pasa el ID del estudiante en la URL
};
