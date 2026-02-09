// teoriaDeColas.service.jsx
import axios from 'axios'

const base_URL = 'http://localhost:4000/'


export const obtenerColaEsperaPrioridadFIFO = (params = {}) => {
    return axios.get(`${base_URL}colaEspera`, { params });
};

export const obtenerListaEntrevista = () => {
    return axios.get(`${base_URL}listaEntrevistas`);
};


export const agendarEntrevista = (formData) => {
    return axios.post(`${base_URL}agendarEntrevista`, formData);
};

export const crearReservaEntrevista = (data) => {
    return axios.post(`${base_URL}crear/reservarentrevista`, data);
  };

// Servicio para enviar un correo electrónico
export const enviarCorreo = (data) => {
    return axios.post(`${base_URL}enviarCorreo`, data);
};
// Servicio para cambiar el estado de la entrevista
export const eliminarEntrevista = (idReservarEntrevista, nuevoEstado) => {
    return axios.put(`${base_URL}eliminarEntrevista/${idReservarEntrevista}`, { nuevoEstado });
};


// Nuevo Servicio para obtener entrevistas por rango de fechas
export const obtenerListaEntrevistaPorRango = (fechas) => {
    return axios.post(`${base_URL}obtener/entrevistas/rango`, fechas);
};

export const obtenerEntrevistasPorPadre = (idPadre) => {
    return axios.get(`${base_URL}verEntrevistasPadres/${idPadre}`);
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
    return axios.get(`${base_URL}listaEntrevistas/${fecha}`, {
        params,
    });
};

export const obtenerFechasHabilitadas = (params = {}) => {
    return axios.get(`${base_URL}entrevistas/fechas-habilitadas`, { params });
};

