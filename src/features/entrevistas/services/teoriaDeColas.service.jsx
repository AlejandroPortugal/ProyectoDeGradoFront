// teoriaDeColas.service.jsx
import { api } from "../../service/api"




export const obtenerColaEsperaPrioridadFIFO = (params = {}) => {
    return api.get(`/colaEspera`, { params });
};

export const obtenerListaEntrevista = () => {
    return api.get(`/listaEntrevistas`);
};


export const agendarEntrevista = (formData) => {
    return api.post(`/agendarEntrevista`, formData);
};

export const crearReservaEntrevista = (data) => {
    return api.post(`/crear/reservarentrevista`, data);
  };

// Servicio para enviar un correo electrónico
export const enviarCorreo = (data) => {
    return api.post(`/enviarCorreo`, data);
};
// Servicio para cambiar el estado de la entrevista
export const eliminarEntrevista = (idReservarEntrevista, nuevoEstado) => {
    return api.put(`/eliminarEntrevista/${idReservarEntrevista}`, { nuevoEstado });
};


// Nuevo Servicio para obtener entrevistas por rango de fechas
export const obtenerListaEntrevistaPorRango = (fechas) => {
    return api.post(`/obtener/entrevistas/rango`, fechas);
};

export const obtenerEntrevistasPorPadre = (idPadre) => {
    return api.get(`/verEntrevistasPadres/${idPadre}`);
  };
  

// teoriaDeColas.service.jsx
export const obtenerListaEntrevistaPorFecha = (fecha, idProfesor, idPsicologo) => {
    // Aquí se ajusta la URL para incluir los parámetros en la URL
    const params = {};
    if (idProfesor !== null && idProfesor !== undefined && idProfesor !== "") {
        params.idProfesor = idProfesor;
    }
    if (idPsicologo !== null && idPsicologo !== undefined && idPsicologo !== "") {
        params.idPsicologo = idPsicologo;
    }
    return api.get(`/listaEntrevistas/${fecha}`, {
        params,
    });
};

export const obtenerFechasHabilitadas = (params = {}) => {
    return api.get(`/entrevistas/fechas-habilitadas`, { params });
};


