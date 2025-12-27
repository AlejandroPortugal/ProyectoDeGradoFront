import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPadre } from '../servicios/PadreDeFamilia.jsx';
import Header from '../components/Header.jsx';
import TablaPaginada from '../components/TablaPaginada.jsx';
import './UserListPadres.css';

const UserListPadres = () => {
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPadres = async () => {
      try {
        const response = await getPadre();
        setPadres(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener la lista de padres de familia:', error);
        setLoading(false);
      }
    };

    fetchPadres();
  }, []); 

  const handleCite = (padre) => {
    navigate('/formCitas', {
      state: {
        idPadre: padre.idpadre || padre.id,
        padreData: padre,
      },
    });
  };

  const totalPadres = padres.length;
  const padresConCorreo = padres.filter((padre) => Boolean(padre.email)).length;
  const padresConTelefono = padres.filter((padre) => Boolean(padre.numcelular || padre.telefono)).length;
  const ultimaActualizacion = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const tablaColumns = useMemo(
    () => [
      { key: 'nombres', label: 'Nombre completo' },
      { key: 'email', label: 'Correo' },
      { key: 'numcelular', label: 'TelÃ©fono' },
      {
        key: 'acciones',
        label: 'Acciones',
        render: (row) => (
          <div className="padres-actions">
            <button type="button" className="padres-actions__btn" onClick={() => handleCite(row)}>
              Citar
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const tablaData = useMemo(
    () =>
      padres.map((padre) => ({
        id: padre.idpadre || padre.id,
        nombres: `${padre.nombres || ''} ${padre.apellidopaterno || ''} ${padre.apellidomaterno || ''}`
          .replace(/\s+/g, ' ')
          .trim(),
        email: padre.email || 'Sin correo',
        numcelular: padre.numcelular || padre.telefono || 'Sin contacto',
      })),
    [padres]
  );

  return (
    <>
  

      <main className="padres-layout">
        <section className="padres-hero">
          <div className="padres-hero__content">
            <span className="padres-hero__eyebrow">CoordinaciÃ³n con familias</span>
            <h1>Padres de familia disponibles</h1>
            <p>
             En este módulo podrás agendar citas con los padres de familia registrados en el sistema; se recomienda que también notifiques al padre de familia vía WhatsApp para garantizar su asistencia. 
            </p>

            <div className="padres-hero__stats">
              <article>
                <strong>{totalPadres}</strong>
                <span>Registros totales</span>
              </article>
              <article>
                <strong>{padresConCorreo}</strong>
                <span>Con correo electrÃ³nico</span>
              </article>
              <article>
                <strong>{padresConTelefono}</strong>
                <span>Con nÃºmero de contacto</span>
              </article>
            </div>

            <div className="padres-hero__actions">
              <button type="button" onClick={() => navigate('/formCitas')}>
                Crear cita
              </button>
              <button
                type="button"
                className="padres-hero__actions--ghost"
                onClick={() => navigate('/listaEntrevistas')}
              >
                Ver entrevistas
              </button>
            </div>
          </div>

          <div className="padres-hero__card">
            <span className="padres-hero__label">Ãšltima sincronizaciÃ³n</span>
            <strong>{ultimaActualizacion}</strong>
            <p>Los registros se actualizan automÃ¡ticamente al ingresar a esta vista.</p>
          </div>
        </section>

        <section className="padres-table-card">
          {loading ? (
            <p className="padres-table-card__loading">Cargando padres de familia...</p>
          ) : (
            <TablaPaginada
              data={tablaData}
              columns={tablaColumns}
              rowsPerPageOptions={[5, 10, 20, 50]}
              initialRowsPerPage={10}
              title="Padres de familia"
            />
          )}
        </section>
      </main>
    </>
  );
};

export default UserListPadres;


