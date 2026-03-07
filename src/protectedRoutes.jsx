import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './auth';
import Toast from './components/Toast';

const ProtectedRoute = ({ children, role }) => {
    const { user } = React.useContext(AuthContext);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const navigate = useNavigate();
    const allowedRoles = useMemo(
        () => (Array.isArray(role) ? role : [role]),
        [role]
    );

    const handleCloseToast = () => {
        setShowToast(false);
    };

    useEffect(() => {
        if (user === null) {
            setToastMessage('Usuario no autenticado. Por favor, inicia sesion.');
            setShowToast(true);
            navigate('/login');
            return;
        }

        if (user && !allowedRoles.includes(user.role)) {
            setToastMessage('No tienes permiso para acceder a esta pagina.');
            setShowToast(true);
            navigate('/unauthorized');
        }
    }, [user, allowedRoles, navigate]);

    if (user === null) {
        return <div>Verificando autenticacion...</div>;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return (
        <>
            {showToast && (
                <Toast
                    message={toastMessage}
                    type="error"
                    onClose={handleCloseToast}
                />
            )}
            {children}
        </>
    );
};

export default ProtectedRoute;
