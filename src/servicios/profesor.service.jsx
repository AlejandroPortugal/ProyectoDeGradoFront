import axios from 'axios';

const base_URL = 'http://localhost:4000/';

export const getProfesor = () => {
    return axios.get(`${base_URL}obtener/profesores`);
};

export const obtenerPanelDocente = (idProfesor) => {
    return axios.get(`${base_URL}profesores/inicio/${idProfesor}`);
};

export const getProfesorById = (idprofesor) => {
    return axios.get(`${base_URL}profesor/${idprofesor}`); // Asegúrate de pasar el id
};

export const getProfesoresConHorarios = () => {
    return axios.get(`${base_URL}obtener/profesoresHorarios`);
  };
  

export const postProfesor = async (formData) => {
    try {
        // Mapear los nombres de los campos para que coincidan con lo que espera el backend
        const profesorData = {
            idDireccion: formData.idDireccion || null,
            nombres: formData.nombres,
            apellidoPaterno: formData.apellidoPaterno,
            apellidoMaterno: formData.apellidoMaterno,
            email: formData.email,
            numCelular: formData.numCelular,
            fechaDeNacimiento: formData.fechaNacimiento, // Ajustar el nombre del campo
            contrasenia: formData.contrasenia,
            rol: 'Profesor', // Forzar el rol como Profesor
            idhorario: formData.idhorario || null,
            idmateria: formData.idmateria || null
        };
        
        console.log('Enviando datos al servidor:', JSON.stringify(profesorData, null, 2));
        const response = await axios.post(`${base_URL}crear/profesor`, profesorData);
        return response;
    } catch (error) {
        console.error('Error en postProfesor:', error);
        if (error.response) {
            // El servidor respondió con un código de estado fuera del rango 2xx
            throw new Error(error.response.data.error || 'Error al crear el profesor');
        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            throw new Error('No se pudo conectar con el servidor');
        } else {
            // Algo pasó en la configuración de la solicitud
            throw new Error('Error al configurar la solicitud');
        }
    }
};

export const putProfesor = (idprofesor, formData) => {
    return axios.put(`${base_URL}actualizar/profesor/${idprofesor}`, formData); // Asegúrate de pasar el id
};

export const deleteProfesor = (idprofesor) => {
    return axios.delete(`${base_URL}eliminar/profesor/${idprofesor}`); // Asegúrate de pasar el id
};

export const getCountTeachers = async () => {
    try {
        const response = await fetch(`${base_URL}obtener/cantidad/profesores`); // Cambia a tu URL
        const dataTeacher = await response.json();
        return parseInt(dataTeacher.total, 10); // Convierte el total a número
    } catch (error) {
        console.error('Error fetching user count:', error);
        throw error; // Lanza el error para manejarlo en el componente
    }
};
