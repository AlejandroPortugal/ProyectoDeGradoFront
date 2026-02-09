import React, { useEffect, useMemo, useState } from "react";
import { postEstudiante } from "../../../estudiantes/services/Estudiante.service.jsx";
import { getCursos } from "../../../cursos/services/cursos.service.jsx";
import { getDatePadres } from "../../../padres/services/PadreDeFamilia.jsx";
import Toast from "../../../../components/Toast.jsx";
import "./FormularioCreacion.css";

const normalizeList = (res) => {
  if (!res) return [];
  const data = res.data ?? res;
  return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
};

const dateLimitsByRol = () => {
  const today = new Date();
  const min = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());
  const max = new Date(today.getFullYear() - 11, today.getMonth(), today.getDate());
  return { min: min.toISOString().split("T")[0], max: max.toISOString().split("T")[0] };
};

const namePattern = /^[\p{L}\s']+$/u;

export default function FormularioCreacionEs() {
  const [cursos, setCursos] = useState([]);
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState({ cursos: false, padres: false });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [form, setForm] = useState({
    idPadre: "",
    idCurso: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaDeNacimiento: "",
  });

  const [errors, setErrors] = useState({});
  const limits = useMemo(() => dateLimitsByRol(), []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading({ cursos: true, padres: true });
      try {
        const [rCursos, rPadres] = await Promise.all([
          getCursos().catch((e) => ({ error: e })),
          getDatePadres().catch((e) => ({ error: e })),
        ]);

        if (!rCursos?.error) setCursos(normalizeList(rCursos));
        if (!rPadres?.error) setPadres(normalizeList(rPadres));
      } catch (e) {
        console.error("Error cargando selects:", e);
        setToast({ show: true, message: "No se pudieron cargar las listas", type: "error" });
      } finally {
        setLoading({ cursos: false, padres: false });
      }
    };

    loadAll();
  }, []);

  const setField = (name, value) => setForm((s) => ({ ...s, [name]: value }));

  const onChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const trimAll = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

  const validate = () => {
    const v = trimAll(form);
    const errs = {};

    if (!v.idPadre) errs.idPadre = "Selecciona un padre de familia.";
    if (!v.idCurso) errs.idCurso = "Selecciona un curso.";
    if (!v.nombres) errs.nombres = "Nombres es obligatorio.";
    if (!v.apellidoPaterno) errs.apellidoPaterno = "Apellido paterno es obligatorio.";
    if (!v.apellidoMaterno) errs.apellidoMaterno = "Apellido materno es obligatorio.";
    if (!v.fechaDeNacimiento) errs.fechaDeNacimiento = "Fecha de nacimiento es obligatoria.";

    if (v.nombres && !namePattern.test(v.nombres)) errs.nombres = "Solo letras y espacios.";
    if (v.apellidoPaterno && !namePattern.test(v.apellidoPaterno)) errs.apellidoPaterno = "Solo letras y espacios.";
    if (v.apellidoMaterno && !namePattern.test(v.apellidoMaterno))
      errs.apellidoMaterno = "Solo letras y espacios.";

    if (v.fechaDeNacimiento) {
      const ymd = v.fechaDeNacimiento;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        errs.fechaDeNacimiento = "Fecha invalida (YYYY-MM-DD).";
      } else {
        if (limits.min && new Date(ymd) < new Date(limits.min)) {
          errs.fechaDeNacimiento = `Debe ser posterior a ${limits.min}.`;
        }
        if (limits.max && new Date(ymd) > new Date(limits.max)) {
          errs.fechaDeNacimiento = `Debe ser anterior a ${limits.max}.`;
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setToast({ show: true, message: "Revisa los campos marcados.", type: "error" });
      return;
    }

    try {
      const v = trimAll(form);
      const payload = {
        idPadre: v.idPadre,
        idCurso: v.idCurso,
        nombres: v.nombres,
        apellidoPaterno: v.apellidoPaterno,
        apellidoMaterno: v.apellidoMaterno,
        fechaNacimiento: v.fechaDeNacimiento,
        rol: "Estudiante",
      };

      await postEstudiante(payload);
      setToast({ show: true, message: "Estudiante creado con exito", type: "success" });
      setForm({
        idPadre: "",
        idCurso: "",
        nombres: "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaDeNacimiento: "",
      });
      setErrors({});
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Error al crear estudiante";
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  return (
    <>
      <form onSubmit={submit} className="grid">
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ show: false, message: "", type: "" })}
          />
        )}

        <div className="fg span-6">
          <label>Padre de Familia</label>
          <select
            name="idPadre"
            value={form.idPadre}
            onChange={onChange}
            required
            aria-invalid={!!errors.idPadre}
          >
            <option value="">{loading.padres ? "Cargando..." : "Selecciona un padre"}</option>
            {padres.length === 0 && !loading.padres ? (
              <option value="" disabled>
                Sin padres
              </option>
            ) : (
              padres.map((p) => (
                <option key={p.idpadre} value={p.idpadre}>
                  {p.nombres} {p.apellidopaterno} {p.apellidomaterno}
                </option>
              ))
            )}
          </select>
          {errors.idPadre && <div className="error">{errors.idPadre}</div>}
        </div>

        <div className="fg span-6">
          <label>Curso</label>
          <select
            name="idCurso"
            value={form.idCurso}
            onChange={onChange}
            required
            aria-invalid={!!errors.idCurso}
          >
            <option value="">{loading.cursos ? "Cargando..." : "Selecciona un curso"}</option>
            {cursos.length === 0 && !loading.cursos ? (
              <option value="" disabled>
                Sin cursos
              </option>
            ) : (
              cursos.map((c) => (
                <option key={c.idcurso} value={c.idcurso}>
                  {c.nombrecurso} {c.paralelo} de {c.nivel}
                </option>
              ))
            )}
          </select>
          {errors.idCurso && <div className="error">{errors.idCurso}</div>}
        </div>

        <div className="fg span-6">
          <label>Nombres</label>
          <input
            name="nombres"
            placeholder="Ejemplo: Juan Carlos"
            value={form.nombres}
            onChange={onChange}
            required
            maxLength={100}
            pattern={namePattern.source}
            title="Solo letras y espacios"
            aria-invalid={!!errors.nombres}
          />
          {errors.nombres && <div className="error">{errors.nombres}</div>}
        </div>

        <div className="fg span-6">
          <label>Apellido Paterno</label>
          <input
            name="apellidoPaterno"
            placeholder="Ejemplo: Perez"
            value={form.apellidoPaterno}
            onChange={onChange}
            required
            maxLength={100}
            pattern={namePattern.source}
            title="Solo letras y espacios"
            aria-invalid={!!errors.apellidoPaterno}
          />
          {errors.apellidoPaterno && <div className="error">{errors.apellidoPaterno}</div>}
        </div>

        <div className="fg span-6">
          <label>Apellido Materno</label>
          <input
            name="apellidoMaterno"
            placeholder="Ejemplo: Garcia"
            value={form.apellidoMaterno}
            onChange={onChange}
            required
            maxLength={100}
            pattern={namePattern.source}
            title="Solo letras y espacios"
            aria-invalid={!!errors.apellidoMaterno}
          />
          {errors.apellidoMaterno && <div className="error">{errors.apellidoMaterno}</div>}
        </div>

        <div className="fg span-6">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fechaDeNacimiento"
            value={form.fechaDeNacimiento}
            onChange={onChange}
            required
            min={limits.min}
            max={limits.max}
            aria-invalid={!!errors.fechaDeNacimiento}
          />
          {errors.fechaDeNacimiento && <div className="error">{errors.fechaDeNacimiento}</div>}
        </div>

        <div className="actions span-12">
          <button className="btn btn-primary" type="submit">
            Crear Estudiante
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setForm({
                idPadre: "",
                idCurso: "",
                nombres: "",
                apellidoPaterno: "",
                apellidoMaterno: "",
                fechaDeNacimiento: "",
              });
              setErrors({});
            }}
          >
            Limpiar
          </button>
        </div>
      </form>
    </>
  );
}
