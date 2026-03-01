const safeBase64UrlDecode = (value) => {
  if (!value) return null;

  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    return atob(normalized + padding);
  } catch (error) {
    console.error('No se pudo decodificar el token:', error);
    return null;
  }
};

const parseJwtPayload = (token) => {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 2) return null;

  const decoded = safeBase64UrlDecode(parts[1]);
  if (!decoded) return null;

  try {
    return JSON.parse(decoded);
  } catch (error) {
    console.error('No se pudo leer el payload del token:', error);
    return null;
  }
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getSessionUser = (token = getStoredToken()) => {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  const role = payload.role || '';
  const user = {
    id: payload.id ?? null,
    role,
    rol: role,
    email: payload.email ?? '',
    exp: payload.exp ?? null,
  };

  if (role === 'Administrador') {
    user.idAdministrador = user.id;
    user.idadministrador = user.id;
  }

  if (role === 'Profesor') {
    user.idProfesor = user.id;
    user.idprofesor = user.id;
  }

  if (role === 'Psicologo') {
    user.idPsicologo = user.id;
    user.idpsicologo = user.id;
  }

  if (role === 'Padre de Familia') {
    user.idPadre = user.id;
    user.idpadre = user.id;
  }

  return user;
};

