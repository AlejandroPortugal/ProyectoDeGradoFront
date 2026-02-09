import axios from 'axios';

// Establece la URL base de tu backend
const base_URL = 'http://localhost:4000/';

// Servicio de login
const login = async (email, contrasenia) => {
  try {
    const response = await axios.post(`${base_URL}login`, {
      email,
      contrasenia,
    });

    // Si el login es exitoso, guardar el token en el localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data;
  } catch (error) {
    throw error.response.data || 'Error al iniciar sesión';
  }
};

export default {
  login,
  
};


