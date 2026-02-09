import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPadre } from "../services/PadreDeFamilia.jsx";
import TablaPaginada from "../../../components/TablaPaginada.jsx";
import "./UserListPadres.css";

const UserListPadres = () => {
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPadres = async () => {
      try {
        const response = await getPadre();
        setPadres(response.data);
      } catch (error) {
        console.error("Error al obtener la lista de padres de familia:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPadres();
  }, []);

  const handleCite = (padre) => {
    navigate("/formCitas", {
      state: {
        idPadre: padre.idpadre || padre.id,
        padreData: padre,
      },
    });
  };

  const totalPadres = padres.length;
  const padresConCorreo = padres.filter((padre) => Boolean(padre.email)).length;
  const padresConTelefono = padres.filter((padre) => Boolean(padre.numcelular || padre.telefono)).length;

  const tablaColumns = useMemo(
    () => [
      { key: "nombres", label: "Nombre completo" },
      { key: "email", label: "Correo" },
      { key: "numcelular", label: "Telefono" },
      {
        key: "acciones",
        label: "Acciones",
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
        nombres: `${padre.nombres || ""} ${padre.apellidopaterno || ""} ${padre.apellidomaterno || ""}`
          .replace(/\s+/g, " ")
          .trim(),
        email: padre.email || "Sin correo",
        numcelular: padre.numcelular || padre.telefono || "Sin contacto",
      })),
    [padres]
  );

  return (
    <main className="padres-layout padres-layout--compact">
      <section className="padres-hero padres-hero--compact">
        <div className="padres-hero__content padres-hero__content--compact">
          <span className="padres-hero__eyebrow">Coordinacion con familias</span>
          <h1>Padres de familia disponibles</h1>
          <p>
            En este modulo podras agendar citas con los padres registrados; se recomienda notificar via WhatsApp para asegurar su asistencia.
          </p>

          <div className="padres-hero__stats padres-hero__stats--compact">
            <article>
              <strong>{totalPadres}</strong>
              <span>Registros totales</span>
            </article>
            <article>
              <strong>{padresConCorreo}</strong>
              <span>Con correo electronico</span>
            </article>
            <article>
              <strong>{padresConTelefono}</strong>
              <span>Con numero de contacto</span>
            </article>
          </div>

          <div className="padres-hero__actions padres-hero__actions--compact">
            <button type="button" onClick={() => navigate("/formCitas")}>Crear cita</button>
            <button type="button" className="padres-hero__actions--ghost" onClick={() => navigate("/listaEntrevistas")}>
              Ver entrevistas
            </button>
          </div>
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
  );
};

export default UserListPadres;
