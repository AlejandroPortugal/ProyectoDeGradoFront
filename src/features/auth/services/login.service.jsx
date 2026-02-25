import { api } from "../../service/api";

const getLoginErrorMessage = (error) => {
  const backendData = error?.response?.data;

  if (typeof backendData === "string" && backendData.trim()) {
    return backendData;
  }

  if (backendData?.error) {
    return backendData.error;
  }

  if (backendData?.message) {
    return backendData.message;
  }

  if (error?.message === "Network Error") {
    return "No se pudo conectar con el servidor.";
  }

  return "Error al iniciar sesion";
};

const login = async (email, contrasenia) => {
  try {
    const response = await api.post(`/login`, {
      email,
      contrasenia,
    });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    throw new Error(getLoginErrorMessage(error));
  }
};

export default {
  login,
};
