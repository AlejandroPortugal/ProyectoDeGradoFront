import React, { useEffect, useMemo, useState } from "react";
import { postEstudiante } from "../../servicios/Estudiante.service.jsx";
import { getDirecciones, createDireccion } from "../../servicios/direccion.service.jsx";
import { getCursos } from "../../servicios/cursos.service.jsx";
import { getDatePadres } from "../../servicios/PadreDeFamilia.jsx";
import Toast from "../Toast.jsx";
import "./FormularioCreacion.css";

const normalizeList = (res) => {
  if (!res) return [];
  const d = res.data ?? res;
  return Array.isArray(d) ? d : (Array.isArray(d?.data) ? d.data : []);
};

const dateLimitsByRol = () => {
  const today = new Date();
  const min = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());
  const max = new Date(today.getFullYear() - 11, today.getMonth(), today.getDate());
  return { min: min.toISOString().split("T")[0], max: max.toISOString().split("T")[0] };
};

const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export default function FormularioCreacionEs() {
  const [dirs, setDirs] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [padres, setPadres] = useState([]);
  const [loading, setLoading] = useState({ dirs: false, cursos: false, padres: false });
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [form, setForm] = useState({
    idDireccion: "",
    idPadre: "",
    idCurso: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    fechaDeNacimiento: "",
  });

  // errores por campo
  const [errors, setErrors] = useState({});

  // Modal "Agregar dirección"
  const [addDirOpen, setAddDirOpen] = useState(false);
  const [newDir, setNewDir] = useState({ zona: "", calle: "", num_puerta: "" });

  const limits = useMemo(() => dateLimitsByRol(), []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading({ dirs: true, cursos: true, padres: true });
      try {
        const [rDirs, rCursos, rPadres] = await Promise.all([
          getDirecciones().catch(e => ({ error: e })),
          getCursos().catch(e => ({ error: e })),
          getDatePadres().catch(e => ({ error: e })),
        ]);

        if (!rDirs?.error) setDirs(normalizeList(rDirs));
        if (!rCursos?.error) setCursos(normalizeList(rCursos));
        if (!rPadres?.error) setPadres(normalizeList(rPadres));
      } catch (e) {
        console.error("Error cargando selects:", e);
        setToast({ show: true, message: "No se pudieron cargar las listas", type: "error" });
      } finally {
        setLoading({ dirs: false, cursos: false, padres: false });
      }
    };
    loadAll();
  }, []);

  // cerrar modal si se selecciona una dirección válida
  useEffect(() => { if (form.idDireccion) setAddDirOpen(false); }, [form.idDireccion]);

  // cerrar modal con tecla ESC
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setAddDirOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const setField = (name, value) => setForm(s => ({ ...s, [name]: value }));

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "idDireccion") {
      if (value === "__new__") {
        setAddDirOpen(true);
        setField("idDireccion", ""); // evita mantener "__new__"
        return;
      } else {
        setAddDirOpen(false);
      }
    }

    setField(name, value);
  };

  const trimAll = (obj) => Object.fromEntries(
    Object.entries(obj).map(([k,v]) => [k, typeof v === "string" ? v.trim() : v])
  );

  const validate = () => {
    const v = trimAll(form);
    const errs = {};

    // requeridos
    if (!v.idDireccion) errs.idDireccion = "Selecciona una dirección.";
    if (!v.idPadre) errs.idPadre = "Selecciona un padre de familia.";
    if (!v.idCurso) errs.idCurso = "Selecciona un curso.";
    if (!v.nombres) errs.nombres = "Nombres es obligatorio.";
    if (!v.apellidoPaterno) errs.apellidoPaterno = "Apellido paterno es obligatorio.";
    if (!v.apellidoMaterno) errs.apellidoMaterno = "Apellido materno es obligatorio.";
    if (!v.fechaDeNacimiento) errs.fechaDeNacimiento = "Fecha de nacimiento es obligatoria.";

    // patrones de texto
    if (v.nombres && !namePattern.test(v.nombres)) errs.nombres = "Solo letras y espacios.";
    if (v.apellidoPaterno && !namePattern.test(v.apellidoPaterno)) errs.apellidoPaterno = "Solo letras y espacios.";
    if (v.apellidoMaterno && !namePattern.test(v.apellidoMaterno)) errs.apellidoMaterno = "Solo letras y espacios.";

    // fecha válida y dentro de rango
    if (v.fechaDeNacimiento) {
      const ymd = v.fechaDeNacimiento;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
        errs.fechaDeNacimiento = "Fecha inválida (YYYY-MM-DD).";
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
        idDireccion: v.idDireccion,
        nombres: v.nombres,
        apellidoPaterno: v.apellidoPaterno,
        apellidoMaterno: v.apellidoMaterno,
        fechaNacimiento: v.fechaDeNacimiento, // input date ya entrega YYYY-MM-DD
        estado: true,
        rol: "Estudiante",
      };
      await postEstudiante(payload);
      setToast({ show: true, message: "Estudiante creado con éxito", type: "success" });
      setForm({
        idDireccion: "", idPadre: "", idCurso: "",
        nombres: "", apellidoPaterno: "", apellidoMaterno: "",
        fechaDeNacimiento: "",
      });
      setErrors({});
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Error al crear estudiante";
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  const createNewDireccion = async (e) => {
    e.preventDefault();
    try {
      const zona = newDir.zona.trim();
      const calle = newDir.calle.trim();
      const num_puerta = newDir.num_puerta.trim();

      if (!zona || !calle || !num_puerta) {
        setToast({ show: true, message: "Todos los campos de dirección son obligatorios.", type: "error" });
        return;
      }

      const res = await createDireccion({ zona, calle, num_puerta });

      const dir = res.data ?? res;
      const id = dir.iddireccion ?? dir?.data?.iddireccion;
      const _zona = dir.zona ?? dir?.data?.zona;
      const _calle = dir.calle ?? dir?.data?.calle;
      const _num = dir.num_puerta ?? dir?.data?.num_puerta;

      setDirs(prev => [{ iddireccion:id, zona:_zona, calle:_calle, num_puerta:_num }, ...prev]);
      setForm(s => ({ ...s, idDireccion: id }));
      setAddDirOpen(false);
      setNewDir({ zona: "", calle: "", num_puerta: "" });
      setToast({ show:true, message:"Dirección agregada", type:"success" });
    } catch (err) {
      if (err?.response?.status === 409) {
        const id = err.response.data?.idDireccion;
        const row = err.response.data?.direccion;
        if (id) {
          setDirs(prev => {
            const exists = prev.some(d => d.iddireccion === id);
            return exists ? prev : [{ iddireccion:id, zona:row?.zona, calle:row?.calle, num_puerta:row?.num_puerta }, ...prev];
          });
          setForm(s => ({ ...s, idDireccion: id }));
          setAddDirOpen(false);
          setToast({ show:true, message:"La dirección ya existía; la seleccioné.", type:"success" });
          return;
        }
      }
      const msg = err?.response?.data?.error || err.message || "Error al crear dirección";
      setToast({ show:true, message: msg, type:"error" });
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

        {/* Dirección */}
        <div className="fg span-6">
          <label>Dirección</label>
          <select
            name="idDireccion"
            value={form.idDireccion}
            onChange={onChange}
            required
            aria-invalid={!!errors.idDireccion}
          >
            <option value="">{loading.dirs ? "Cargando..." : "Selecciona una dirección"}</option>
            <option value="__new__">➕ Agregar nueva dirección…</option>
            {dirs.length === 0 && !loading.dirs ? (
              <option value="" disabled>Sin direcciones</option>
            ) : (
              dirs.map(d => (
                <option key={d.iddireccion} value={d.iddireccion}>
                  {d.zona} - {d.calle} - {d.num_puerta}
                </option>
              ))
            )}
          </select>
          {errors.idDireccion && <div className="error">{errors.idDireccion}</div>}
        </div>

        {/* Padre */}
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
              <option value="" disabled>Sin padres</option>
            ) : (
              padres.map(p => (
                <option key={p.idpadre} value={p.idpadre}>
                  {p.nombres} {p.apellidopaterno} {p.apellidomaterno}
                </option>
              ))
            )}
          </select>
          {errors.idPadre && <div className="error">{errors.idPadre}</div>}
        </div>

        {/* Curso */}
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
              <option value="" disabled>Sin cursos</option>
            ) : (
              cursos.map(c => (
                <option key={c.idcurso} value={c.idcurso}>
                  {c.nombrecurso} {c.paralelo} de {c.nivel}
                </option>
              ))
            )}
          </select>
          {errors.idCurso && <div className="error">{errors.idCurso}</div>}
        </div>

        {/* Nombres y apellidos */}
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
            placeholder="Ejemplo: Pérez"
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
            placeholder="Ejemplo: García"
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

        {/* Fecha */}
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
          <button className="btn btn-primary" type="submit">Crear Estudiante</button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setForm({
                idDireccion: "", idPadre: "", idCurso: "",
                nombres: "", apellidoPaterno: "", apellidoMaterno: "",
                fechaDeNacimiento: ""
              });
              setErrors({});
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Modal agregar dirección */}
      {addDirOpen && (
        <div
          className="dialog-container active"
          onClick={(e) => {
            if (e.target.classList.contains("dialog-container")) setAddDirOpen(false);
          }}
        >
          <div className="dialog-box" style={{ maxWidth: 520, position: "relative" }}>
            {/* X cerrar (Material Symbols) */}
            <button
              type="button"
              className="icon-btn"
              onClick={() => setAddDirOpen(false)}
              aria-label="Cerrar"
              style={{ position:"absolute", right:8, top:8, border:0, background:"transparent", cursor:"pointer", padding:4, lineHeight:0, borderRadius:8 }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>

            <h3 style={{ marginTop: 0 }}>Nueva dirección</h3>
            <form onSubmit={createNewDireccion} className="grid">
              <div className="fg span-12">
                <label>Zona</label>
                <input
                  value={newDir.zona}
                  onChange={e => setNewDir(s => ({ ...s, zona: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>
              <div className="fg span-12">
                <label>Calle</label>
                <input
                  value={newDir.calle}
                  onChange={e => setNewDir(s => ({ ...s, calle: e.target.value }))}
                  required
                  maxLength={100}
                />
              </div>
              <div className="fg span-12">
                <label>Número de puerta</label>
                <input
                  value={newDir.num_puerta}
                  onChange={e => setNewDir(s => ({ ...s, num_puerta: e.target.value }))}
                  required
                  maxLength={10}
                />
              </div>
              <div className="actions span-12">
                <button className="btn btn-primary" type="submit">Guardar</button>
                <button className="btn btn-secondary" type="button" onClick={() => setAddDirOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

