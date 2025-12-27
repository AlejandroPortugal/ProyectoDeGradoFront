import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./InicioProfesores.css";
import directorImage from "../../recursos/image/Directora.jpg";
import { obtenerPanelDocente } from "../../servicios/profesor.service.jsx";

const InicioProfesores = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [docente, setDocente] = useState(null);
  const [stats, setStats] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [todayPanels, setTodayPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const locationIdProfesor = location.state?.idProfesor ?? null;

  useEffect(() => {
    const fetchPanelDocente = async () => {
      setLoading(true);
      setError(null);

      let storedUser = null;
      try {
        storedUser = localStorage.getItem("user");
      } catch (storageError) {
        console.error("No se pudo acceder al localStorage:", storageError);
      }

      let parsedUser = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser);
        } catch (parseError) {
          console.error("No se pudo parsear el usuario almacenado:", parseError);
        }
      }

      const resolvedIdProfesor =
        locationIdProfesor ??
        (parsedUser?.role === "Profesor" ? parsedUser.id : null) ??
        parsedUser?.idprofesor ??
        null;

      if (!resolvedIdProfesor) {
        setError("No se pudo identificar al profesor.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await obtenerPanelDocente(resolvedIdProfesor);
        setDocente(data.docente ?? null);
        setStats(Array.isArray(data.stats) ? data.stats : []);
        setQuickActions(Array.isArray(data.quickActions) ? data.quickActions : []);
        setTodayPanels(Array.isArray(data.todayPanels) ? data.todayPanels : []);
      } catch (fetchError) {
        console.error("Error al obtener el panel docente:", fetchError);
        const message =
          fetchError?.response?.data?.error ?? "Error al obtener el panel docente.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPanelDocente();
  }, [locationIdProfesor]);

  const goTo = (route) => {
    if (!route) return;
    navigate(route);
  };

  if (loading) {
    return (
      <main className="inicio-docente">
        <p>Cargando panel...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="inicio-docente">
        <p>{error}</p>
      </main>
    );
  }

  const docenteNombre = docente?.nombre || "Docente";
  const docenteDetalle = docente?.idMateria
    ? `Materia asignada: ${docente.idMateria}`
    : "Docente IDEB";
  const heroCopy = docente?.nombre
    ? `Hola ${docente.nombre}, disfruta de sistema de control IDEB.`
    : "Accede rapido a tus tareas.";

  return (
    <main className="inicio-docente">
      <section className="inicio-docente__hero">
        <div className="inicio-docente__hero-copy">
          <span className="inicio-docente__eyebrow">Panel Administrativo</span>
          <h1>Bienvenido</h1>
          <p>{heroCopy}</p>
          <div className="inicio-docente__chips">
            {stats.map(({ label, value }) => (
              <span key={label} className="inicio-docente__chip">
                <strong>{value}</strong>
                <span>{label}</span>
              </span>
            ))}
          </div>
          <div className="inicio-docente__hero-actions">
            <button type="button" onClick={() => goTo("/profesores/actas")}>
              Registrar acta
            </button>
            <button
              type="button"
              className="inicio-docente__hero-actions--outline"
              onClick={() => goTo("/profesores/noticias")}
            >
              Ver avisos
            </button>
          </div>
        </div>

        <div className="inicio-docente__hero-card">
          <img src={directorImage} alt={`Perfil de ${docenteNombre}`} />
          <div className="inicio-docente__hero-card-info">
            <span>{docenteNombre}</span>
            <small>{docenteDetalle}</small>
          </div>
        </div>


      </section>

      <section className="inicio-docente__section">
        <header>
          <h2>Acciones rapidas</h2>
        </header>
        <div className="inicio-docente__grid">
          {quickActions.map(({ title, subtitle, badge, route }) => (
            <article key={title} className="inicio-docente__card inicio-docente__card--action">
              <span className="inicio-docente__badge" aria-hidden="true">
                {badge}
              </span>
              <div>
                <h3>{title}</h3>
                <p>{subtitle}</p>
              </div>
              <button type="button" onClick={() => goTo(route)}>
                Abrir
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="inicio-docente__section">
        <header>
          <h2>Hoy</h2>
        </header>
        <div className="inicio-docente__grid inicio-docente__grid--metrics">
          {todayPanels.map(({ title, value, detail, actionLabel, route }) => (
            <article key={title} className="inicio-docente__card inicio-docente__card--metric">
              <div>
                <span className="inicio-docente__metric-value">{value}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
              <button type="button" onClick={() => goTo(route)}>
                {actionLabel}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default InicioProfesores;


