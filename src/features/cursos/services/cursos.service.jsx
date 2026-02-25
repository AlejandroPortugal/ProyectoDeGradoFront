import { api } from "../../service/api";

export const getCursos = () => api.get("/obtener/cursos");

export const getCursosById = (idCurso) =>
  api.get(`/obtener/cursosById/${idCurso}`);
