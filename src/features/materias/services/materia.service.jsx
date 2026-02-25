import { api } from "../../service/api";


export const getMaterias = () => api.get(`/materias`);

export const getMateria = () => {
    return api.get(`/obtener/materia`);
};

export const getMateriaById = (idMateria) => {
    return api.get(`/obtener/materiaById/${idMateria}`);
};

export const getMateriaForPsicologo = () => {
    return api.get(`/obtener/materiaForPsicologo`);
};

export const getMateriaForProfesor = () => {
    return api.get(`/obtener/materiaForProfesor`);
};

