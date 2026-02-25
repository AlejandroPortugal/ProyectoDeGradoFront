import { api } from "../../service/api";



export const getEstudiantes = () => {
    return api.get(`/obtener/estudiantes`);
};

export const getEstudianteById = (idestudiante) => {
    return api.get(`/obtener/estudiantes/${idestudiante}`); // El ID debe estar presente en la URL
};

export const postEstudiante = (formData) => {
    return api.post(`/crear/estudiante`, formData);
};

export const putEstudiante = (idEstudiante, formData) => {
    return api.put(`/actualizar/estudiante/${idEstudiante}`, formData); // Se pasa el ID del estudiante en la URL
};

export const deleteEstudiante = (idestudiante) => {
    return api.delete(`/eliminar/estudiante/${idestudiante}`); // Se pasa el ID del estudiante en la URL
};

