import { api } from "../../service/api";



export const getProfesor = () => {
    return api.get(`/obtener/profesores`);
};

export const obtenerPanelDocente = (idProfesor) => {
    return api.get(`/profesores/inicio/${idProfesor}`);
};

export const getProfesorById = (idprofesor) => {
    return api.get(`/profesor/${idprofesor}`); // Asegúrate de pasar el id
};

export const getProfesoresConHorarios = () => {
    return api.get(`/obtener/profesoresHorarios`);
  };

// Actualiza el estado de la entrevista (completada / no realizada) validando profesor
export const actualizarEstadoEntrevistaProfesor = (payload) => {
    return api.put(`/profesor/entrevista/estado`, payload);
};
  

export const postProfesor = async (formData) => {
    try {
        const fechaDeNacimiento =
            formData.fechaDeNacimiento ??
            formData.fechaNacimiento ??
            formData.fechadenacimiento ??
            null;

        const materias = Array.isArray(formData.materias)
            ? formData.materias
                .map((m) => ({
                    idmateria: m?.idmateria ?? m?.idMateria ?? m?.id,
                    idhorario: m?.idhorario ?? m?.idHorario ?? m?.id,
                }))
                .filter((m) => m.idmateria && m.idhorario)
            : [];
        const materiaSeleccionada = materias[0] || null;
        const idmateria = materiaSeleccionada?.idmateria ?? formData.idmateria ?? null;
        const idhorario = materiaSeleccionada?.idhorario ?? formData.idhorario ?? null;

        // Mapear los nombres de los campos para que coincidan con lo que espera el backend
        const profesorData = {
            idDireccion: formData.idDireccion || null,
            nombres: formData.nombres,
            apellidoPaterno: formData.apellidoPaterno,
            apellidoMaterno: formData.apellidoMaterno,
            email: formData.email,
            numCelular: formData.numCelular,
            fechaDeNacimiento,
            contrasenia: formData.contrasenia,
            rol: 'Profesor', // Forzar el rol como Profesor
            idhorario: idhorario || null,
            idmateria: idmateria || null,
        };
        
        console.log('Enviando datos al servidor:', JSON.stringify(profesorData, null, 2));
        const response = await api.post(`/crear/profesor`, profesorData);
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
    return api.put(`/actualizar/profesor/${idprofesor}`, formData); // Asegúrate de pasar el id
};

export const deleteProfesor = (idprofesor) => {
    return api.delete(`/eliminar/profesor/${idprofesor}`); // Asegúrate de pasar el id
};

export const getCountTeachers = async () => {
    try {
        const response = await api.get(`/obtener/cantidad/profesores`);
        return parseInt(response.data.total, 10); // Convierte el total a número
    } catch (error) {
        console.error('Error fetching user count:', error);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

