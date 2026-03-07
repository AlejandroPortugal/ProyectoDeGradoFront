import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./InicioProfesores.css";
import { obtenerPanelDocente } from "../../profesores/services/profesor.service.jsx";
import { getSessionUser } from "../../../utils/session.js";

const InicioProfesores = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [docente, setDocente] = useState(null);
  const [stats, setStats] = useState([]);
  const [todayPanels, setTodayPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const locationIdDocente =
    location.state?.idProfesor ?? location.state?.idPsicologo ?? null;

  useEffect(() => {
    const fetchPanelDocente = async () => {
      setLoading(true);
      setError(null);

      const parsedUser = getSessionUser();

      const resolvedIdDocente =
        locationIdDocente ??
        parsedUser?.idProfesor ??
        parsedUser?.idprofesor ??
        parsedUser?.idPsicologo ??
        parsedUser?.idpsicologo ??
        parsedUser?.id ??
        null;

      if (!resolvedIdDocente) {
        setError("No se pudo identificar al profesor.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await obtenerPanelDocente(resolvedIdDocente);
        setDocente(data.docente ?? null);
        setStats(Array.isArray(data.stats) ? data.stats : []);
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
  }, [locationIdDocente]);

  const goTo = (route) => {
    if (!route) return;
    navigate(route);
  };

  const sessionUser = useMemo(() => getSessionUser(), []);

  const statsView = useMemo(
    () =>
      stats.map((item) => {
        const normalizedLabel = (item?.label || "").toString().trim().toLowerCase();
        if (normalizedLabel === "avisos") {
          return { ...item, label: "Entrevistas" };
        }
        return item;
      }),
    [stats]
  );

  const todayView = useMemo(
    () =>
      todayPanels.map((panel) => {
        const title = (panel?.title || "").toString().trim().toLowerCase();
        if (title === "actas de hoy") {
          return {
            ...panel,
            title: "Actas creadas hoy",
            detail: "Registros generados durante la jornada actual.",
          };
        }
        if (title === "entrevistas programadas") {
          return {
            ...panel,
            title: "Entrevistas de hoy",
            detail: "Citas programadas para la fecha seleccionada.",
          };
        }
        if (title === "citas enviadas") {
          return {
            ...panel,
            title: "Entrevistas completadas",
            detail: "Entrevistas que ya cambiaron de estado hoy.",
          };
        }
        return panel;
      }),
    [todayPanels]
  );

  const primaryActions = useMemo(
    () => [
      {
        title: "Ver entrevistas",
        detail: "Revisa, confirma o actualiza las entrevistas del dia.",
        route: "/listaEntrevistas",
      },
      {
        title: "Citar a padres",
        detail: "Agenda nuevas entrevistas con padres de familia.",
        route: "/psicologoListPadres",
      },
      {
        title: "Configuracion",
        detail: "Actualiza tus datos y preferencias del perfil.",
        route: "/configs",
      },
    ],
    []
  );

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
  const docenteRol =
    sessionUser?.role || sessionUser?.rol || location.state?.role || location.state?.rol || "Docente";
  const docenteDetalle =
    docenteRol === "Psicologo" ? "Seguimiento y orientacion escolar" : "Panel de gestion academica";
  const heroCopy = docente?.nombre
    ? "Consulta tu carga real del dia y accede solo a acciones que si forman parte de tu trabajo."
    : "Accede rapidamente a tus tareas prioritarias.";

  return (
    <main className="inicio-docente">
      <section className="inicio-docente__hero">
        <div className="inicio-docente__hero-copy">
          <span className="inicio-docente__eyebrow">Panel Administrativo</span>
          <h1>Bienvenid@ {docenteNombre}</h1>
          <p>{heroCopy}</p>
          <div className="inicio-docente__chips">
            {statsView.map(({ label, value }) => (
              <span key={label} className="inicio-docente__chip">
                <strong>{value}</strong>
                <span>{label}</span>
              </span>
            ))}
          </div>
          <div className="inicio-docente__hero-actions">
          
          </div>
        </div>

        <div className="inicio-docente__hero-card">
          <div className="inicio-docente__profile-shell">
            <span className="inicio-docente__profile-badge">{docenteRol}</span>
            <h2>{docenteNombre}</h2>
            <p>{docenteDetalle}</p>
            <div className="inicio-docente__profile-meta">
              <div>
                <span>Estado</span>
                <strong>Activo</strong>
              </div>
              <div>
                <span>Entrevistas</span>
                <strong>
                  {statsView.find((item) => item.label === "Entrevistas")?.value || "0"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="inicio-docente__section">
        <header>
          <h2>Hoy</h2>
        </header>
        <div className="inicio-docente__grid inicio-docente__grid--metrics">
          {todayView.map(({ title, value, detail }) => (
            <article key={title} className="inicio-docente__card inicio-docente__card--metric">
              <div>
                <span className="inicio-docente__metric-value">{value}</span>
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="inicio-docente__section">
        <header>
          <h2>Acciones utiles</h2>
        </header>
        <div className="inicio-docente__grid">
          {primaryActions.map(({ title, detail, route }) => (
            <article key={title} className="inicio-docente__card inicio-docente__card--action">
              <div className="inicio-docente__card-copy">
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
              <button type="button" onClick={() => goTo(route)}>
                Abrir
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default InicioProfesores;
