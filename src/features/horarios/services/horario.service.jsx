import { api } from "../../service/api";




export const getHorarios = () => {
    return api.get(`/obtener/horarios`);
};



export const getHorariosById = (idhorario) => {
    return api.get(`/obtener/horario/${idhorario}`); // El ID debe estar presente en la URL
};

// Horario + materia asignada para un profesor especifico
export const getHorarioByProfesor = (idProfesor) => {
    return api.get(`/obtener/horario/profesor/${idProfesor}`);
};

