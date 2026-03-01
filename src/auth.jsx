import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionUser } from './utils/session.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true); // Agrega un estado de carga
    const navigate = useNavigate();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
            const sessionUser = getSessionUser(storedToken);
            const tokenExpiry = (sessionUser?.exp || 0) * 1000;
            const now = new Date().getTime();

            if (sessionUser && tokenExpiry > now) {
                setToken(storedToken);
                setUser(sessionUser);
            } else {
                logout();
            }
        }

        setLoading(false);
    }, []);

    const login = (token, userData) => {
        setToken(token);
        setUser({ ...getSessionUser(token), ...userData });
        localStorage.setItem('token', token);
        localStorage.removeItem('user');
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) {
        return <div>Cargando...</div>; // Puedes cambiar esto a un spinner o mensaje de carga
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
