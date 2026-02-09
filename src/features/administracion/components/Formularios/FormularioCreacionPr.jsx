import React, { useEffect, useMemo, useState } from "react";
import { postProfesor } from "../../../profesores/services/profesor.service.jsx";
import { getDirecciones, createDireccion } from "../../../direccion/services/direccion.service.jsx";
import { getHorarios } from "../../../horarios/services/horario.service.jsx";
import { getMateria, getMateriaForProfesor } from "../../../materias/services/materia.service.jsx";
import Toast from "../../../../components/Toast.jsx";
import "./FormularioCreacion.css";

const dateLimitsByRol = () => ({ max: "2005-12-31" });
const namePattern  = /^[A-Za-z????????????\s]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passPattern  = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

const normalizeArray = (res) => {
  const d = res?.data ?? res ?? [];
  return Array.isArray(d) ? d : [];
};

const normalizeMateria = (m) => ({
  idmateria: m.idmateria ?? m.idMateria ?? m.id,
  nombre: m.nombre ?? m.nombremateria ?? m.nombreMateria ?? "",
  ocupada: !!m.ocupada,  // <- del backend
});

const normalizeHorario = (h) => ({
  idhorario: h.idhorario ?? h.idHorario ?? h.id,
  idmateria: h.idmateria ?? h.idMateria ?? null,
  horainicio: h.horainicio ?? h.horaInicio ?? "",
  horafin: h.horafin ?? h.horaFin ?? "",
  dia: h.dia ?? "",
});

export default function FormularioCreacionPr() {
  const [dirs, setDirs] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [direccionQuery, setDireccionQuery] = useState("");
  const [loading, setLoading] = useState({ dirs: false, horarios: false, materias: false });

  // Modal direcci?n
  const [addDirOpen, setAddDirOpen] = useState(false);
  const [newDir, setNewDir] = useState({ zona: "", calle: "", num_puerta: "" });

  // Mostrar/ocultar contrase?a
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    idDireccion: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    email: "",
    numCelular: "",
    fechaDeNacimiento: "",
    contrasenia: "",
    materias: [
      { idmateria: "", idhorario: "" },
    ],
  });

  const [errors, setErrors] = useState({});
  const limits = dateLimitsByRol();
  const ADD_DIR_LABEL = "+ Agregar nueva direccion...";

  const buildDirLabel = (d) =>
    `${d?.zona ?? ""} - ${d?.calle ?? ""} - ${d?.num_puerta ?? ""}`.trim();

  // Cargar listas
  useEffect(() => {
    const load = async () => {
      setLoading({ dirs: true, horarios: true, materias: true });
      try {
        const [rDirs, rHor, rMat] = await Promise.all([
          getDirecciones().catch(e => ({ error: e })),
          getHorarios().catch(e => ({ error: e })),
          getMateriaForProfesor().catch(async () => getMateria().catch(e => ({ error: e }))),
        ]);

        if (!rDirs?.error) setDirs(normalizeArray(rDirs));
        if (!rHor?.error) setHorarios(normalizeArray(rHor).map(normalizeHorario));
        if (!rMat?.error) setMaterias(normalizeArray(rMat).map(normalizeMateria));
      } catch (e) {
        console.error(e);
        setToast({ show: true, message: "No se pudieron cargar las listas", type: "error" });
      } finally {
        setLoading({ dirs: false, horarios: false, materias: false });
      }
    };
    load();
  }, []);

  const horariosByMateria = useMemo(() => {
    const map = new Map();
    for (const h of horarios) {
      const key = String(h.idmateria ?? "");
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(h);
    }
    return map;
  }, [horarios]);

  const getHorariosForMateria = (materiaId) =>
    horariosByMateria.get(String(materiaId || "")) || [];

  const isMateriaSelectedElsewhere = (materiaId, idx) =>
    form.materias.some((m, i) => i !== idx && String(m.idmateria || "") === String(materiaId || ""));

  // Cerrar modal si se elige una direcci?n v?lida
  useEffect(() => { if (form.idDireccion) setAddDirOpen(false); }, [form.idDireccion]);

  // Cerrar modal con ESC
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setAddDirOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const setField = (name, value) => setForm(s => ({ ...s, [name]: value }));

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "numCelular") {
      const digits = value.replace(/\D/g, "").slice(0, 8);
      setField(name, digits);
      return;
    }

    setField(name, value);
  };

  const onDireccionChange = (e) => {
    const value = e.target.value;
    if (value === "__new__") {
      setAddDirOpen(true);
      setField("idDireccion", "");
      return;
    }
    setField("idDireccion", value);
  };

  const dirQuery = direccionQuery.trim().toLowerCase();
  const filteredDirs = dirQuery
    ? dirs.filter((d) => buildDirLabel(d).toLowerCase().includes(dirQuery))
    : dirs;
  const selectedDir = dirs.find((d) => String(d.iddireccion) === String(form.idDireccion));
  const visibleDirs =
    selectedDir && !filteredDirs.some((d) => String(d.iddireccion) === String(selectedDir.iddireccion))
      ? [selectedDir, ...filteredDirs]
      : filteredDirs;

  const trimAll = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

  const setMateriaField = (idx, field, value) => {
    setForm(s => {
      const materias = s.materias.map((m, i) =>
        i === idx ? { ...m, [field]: value } : m
      );
      return { ...s, materias };
    });
  };

  const onMateriaChange = (idx, value) => {
    if (!value) {
      setMateriaField(idx, "idmateria", "");
      setMateriaField(idx, "idhorario", "");
      return;
    }

    if (isMateriaSelectedElsewhere(value, idx)) {
      setToast({ show: true, message: "La materia ya fue seleccionada.", type: "error" });
      return;
    }

    const meta = materias.find(m => String(m.idmateria) === String(value));
    if (meta?.ocupada) {
      setToast({ show: true, message: "La materia ya esta ocupada.", type: "error" });
      return;
    }

    setMateriaField(idx, "idmateria", value);
    setMateriaField(idx, "idhorario", "");
  };

  const validate = () => {
    const v = trimAll(form);
    const errs = {};

    ["idDireccion","nombres","apellidoPaterno","apellidoMaterno","email","numCelular","fechaDeNacimiento","contrasenia"]
      .forEach(k => { if (!String(v[k] || "").trim()) errs[k] = "Campo obligatorio."; });

    const materiasSel = (v.materias || []).map((m) => ({
      idmateria: String(m?.idmateria || "").trim(),
      idhorario: String(m?.idhorario || "").trim(),
    }));
    const [m1] = materiasSel;

    if (!m1?.idmateria) errs.idmateria1 = "Campo obligatorio.";
    if (!m1?.idhorario) errs.idhorario1 = "Campo obligatorio.";

    const m1Meta = materias.find((m) => String(m.idmateria) === String(m1?.idmateria));
    if (m1Meta?.ocupada) errs.idmateria1 = "Materia ocupada.";

    if (v.nombres && !namePattern.test(v.nombres)) errs.nombres = "Solo letras y espacios.";
    if (v.apellidoPaterno && !namePattern.test(v.apellidoPaterno)) errs.apellidoPaterno = "Solo letras y espacios.";
    if (v.apellidoMaterno && !namePattern.test(v.apellidoMaterno)) errs.apellidoMaterno = "Solo letras y espacios.";
    if (v.email && !emailPattern.test(v.email)) errs.email = "Correo no v?lido.";
    if (v.numCelular && !/^\d{8}$/.test(v.numCelular)) errs.numCelular = "Exactamente 8 d?gitos.";
    if (v.contrasenia && !passPattern.test(v.contrasenia)) errs.contrasenia = "M?n. 6, 1 may?scula, 1 n?mero y 1 especial.";

    if (v.fechaDeNacimiento) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.fechaDeNacimiento)) {
        errs.fechaDeNacimiento = "Fecha inv?lida (YYYY-MM-DD).";
      } else if (new Date(v.fechaDeNacimiento) >= new Date("2006-01-01")) {
        errs.fechaDeNacimiento = "Debe ser anterior a 2006-01-01.";
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
      const fechaISO = form.fechaDeNacimiento
        ? new Date(form.fechaDeNacimiento).toISOString().slice(0, 10)
        : "";

      const materiasPayload = (form.materias || [])
        .map((m) => ({
          idmateria: String(m?.idmateria || "").trim(),
          idhorario: String(m?.idhorario || "").trim(),
        }))
        .filter((m) => m.idmateria && m.idhorario);

      const payload = {
        ...trimAll(form),
        rol: "Profesor",
        fechaDeNacimiento: fechaISO,
        materias: materiasPayload,
      };

      await postProfesor(payload);
      setToast({ show: true, message: "Profesor creado con exito", type: "success" });
      setForm({
        idDireccion:"", nombres:"", apellidoPaterno:"", apellidoMaterno:"",
        email:"", numCelular:"", fechaDeNacimiento:"", contrasenia:"",
        materias: [
          { idmateria: "", idhorario: "" },
        ]
      });
      setDireccionQuery("");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Error al crear profesor";
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  // Refrescar cuando se cierre el toast de ?xito
  const handleToastClose = () => {
    const wasSuccess = toast.type === "success";
    setToast({ show:false, message:"", type:"" });
    if (wasSuccess) window.location.reload();
  };

  // Crear nueva direcci?n
  const createNewDireccion = async (e) => {
    e.preventDefault();
    try {
      const zona = newDir.zona.trim(), calle = newDir.calle.trim(), num_puerta = newDir.num_puerta.trim();
      if (!zona || !calle || !num_puerta) {
        setToast({ show:true, message:"Todos los campos de direcci?n son obligatorios.", type:"error" });
        return;
      }

      const res = await createDireccion({ zona, calle, num_puerta });
      const dir = res.data ?? res;
      const id = dir.iddireccion ?? dir?.data?.iddireccion;
      const zonaR = dir.zona ?? dir?.data?.zona;
      const calleR = dir.calle ?? dir?.data?.calle;
      const numR = dir.num_puerta ?? dir?.data?.num_puerta;

      setDirs(prev => [{ iddireccion:id, zona:zonaR, calle:calleR, num_puerta:numR }, ...prev]);
      setField("idDireccion", id);
      setAddDirOpen(false);
      setNewDir({ zona:"", calle:"", num_puerta:"" });
      setToast({ show:true, message:"Direccion agregada", type:"success" });
    } catch (err) {
      if (err?.response?.status === 409) {
        const id = err.response.data?.idDireccion;
        const row = err.response.data?.direccion;
        if (id) {
          setDirs(prev => {
            const exists = prev.some(d => d.iddireccion === id);
            return exists ? prev : [{ iddireccion:id, zona:row?.zona, calle:row?.calle, num_puerta:row?.num_puerta }, ...prev];
          });
          setField("idDireccion", id);
          setAddDirOpen(false);
          setToast({ show:true, message:"La direccin ya existe, Direccion seleccionada.", type:"success" });
          return;
        }
      }
      const msg = err?.response?.data?.error || err.message || "Error al crear direcci?n";
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
            onClose={handleToastClose}
          />
        )}

        {/* Dirección */}
        <div className="fg span-6">
          <label>Dirección</label>
          <input
            type="text"
            placeholder="Buscar dirección..."
            value={direccionQuery}
            onChange={(e) => setDireccionQuery(e.target.value)}
            autoComplete="off"
          />
          <select
            name="idDireccion"
            value={form.idDireccion}
            onChange={onDireccionChange}
            required
            aria-invalid={!!errors.idDireccion}
          >
            <option value="">{loading.dirs ? "Cargando..." : "Selecciona una direccion"}</option>
            <option value="__new__">{ADD_DIR_LABEL}</option>
            {visibleDirs.map((d) => (
              <option key={d.iddireccion} value={d.iddireccion}>
                {buildDirLabel(d)}
              </option>
            ))}
          </select>
          {errors.idDireccion && <div className="error">{errors.idDireccion}</div>}
        </div>

        {/* Nombres / Apellidos / Fecha */}
        <div className="fg span-6">
          <label>Nombres</label>
          <input
            name="nombres"
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

        <div className="fg span-4">
          <label>Apellido Paterno</label>
          <input
            name="apellidoPaterno"
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

        <div className="fg span-4">
          <label>Apellido Materno</label>
          <input
            name="apellidoMaterno"
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

        <div className="fg span-4">
          <label>Fecha de Nacimiento</label>
          <input
            type="date"
            name="fechaDeNacimiento"
            value={form.fechaDeNacimiento}
            onChange={onChange}
            required
            max={limits.max}
            aria-invalid={!!errors.fechaDeNacimiento}
          />
          {errors.fechaDeNacimiento && <div className="error">{errors.fechaDeNacimiento}</div>}
        </div>

        {/* Email / Celular / Contrase?a */}
        <div className="fg span-6">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            maxLength={100}
            pattern={emailPattern.source}
            title="Correo v?lido"
            aria-invalid={!!errors.email}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className="fg span-3">
          <label>Celular</label>
          <input
            placeholder="8 digitos"
            name="numCelular"
            value={form.numCelular}
            onChange={onChange}
            onInput={(e)=>{ e.target.value = e.target.value.replace(/\D/g,'').slice(0,8); }}
            required
            inputMode="numeric"
            maxLength={8}
            pattern="\d{8}"
            title="Exactamente 8 d?gitos"
            aria-invalid={!!errors.numCelular}
          />
          {errors.numCelular && <div className="error">{errors.numCelular}</div>}
        </div>

        <div className="fg span-3">
          <label>Contraseña</label>
          <div style={{ position:"relative" }}>
            <input
              type={showPass ? "text" : "password"}
              name="contrasenia"
              value={form.contrasenia}
              onChange={onChange}
              required
              minLength={6}
              maxLength={255}
              pattern={passPattern.source}
              title="M?n. 6, 1 may?scula, 1 n?mero y 1 especial"
              aria-invalid={!!errors.contrasenia}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={showPass ? "Ocultar contrase?a" : "Mostrar contrase?a"}
              onClick={() => setShowPass(v => !v)}
              style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", border:0, background:"transparent", cursor:"pointer", padding:4 }}
            >
              <span className="material-symbols-rounded" style={{ color:"black" }}>
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.contrasenia && <div className="error">{errors.contrasenia}</div>}
        </div>

        {/* Materia 1 */}
        <div className="fg span-6">
          <label>Materia 1</label>
          <select
            name="idmateria1"
            value={form.materias[0].idmateria}
            onChange={(e) => onMateriaChange(0, e.target.value)}
            required
            aria-invalid={!!errors.idmateria1}
          >
            <option value="">{loading.materias ? "Cargando..." : "Selecciona una materia"}</option>
            {!loading.materias && materias.length === 0 && (
              <option value="" disabled>Sin materias activas</option>
            )}
            {materias.map(m => (
              <option
                key={m.idmateria}
                value={m.idmateria}
                disabled={m.ocupada || isMateriaSelectedElsewhere(m.idmateria, 0)}
              >
                {m.nombre}{m.ocupada ? " (ocupada)" : ""}
              </option>
            ))}
          </select>
          {errors.idmateria1 && <div className="error">{errors.idmateria1}</div>}
          <div className="helper">Puedes asignar 1 materia.</div>
        </div>

        {/* Horario 1 */}
        <div className="fg span-6">
          <label>Horario 1</label>
          <select
            name="idhorario1"
            value={form.materias[0].idhorario}
            onChange={(e) => setMateriaField(0, "idhorario", e.target.value)}
            required
            disabled={!form.materias[0].idmateria}
            aria-invalid={!!errors.idhorario1}
          >
            <option value="">
              {!form.materias[0].idmateria
                ? "Selecciona una materia primero"
                : loading.horarios
                ? "Cargando..."
                : "Selecciona un horario"}
            </option>
            {getHorariosForMateria(form.materias[0].idmateria).map(h => (
              <option key={h.idhorario} value={h.idhorario}>
                {h.dia ? `${h.dia} ` : ""}{h.horainicio} - {h.horafin}
              </option>
            ))}
          </select>
          {errors.idhorario1 && <div className="error">{errors.idhorario1}</div>}
          <div className="helper">Se muestran solo los horarios de la materia elegida.</div>
        </div>

        <div className="actions span-12">
          <button className="btn btn-primary" type="submit">Crear Profesor</button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              setForm({
                idDireccion:"", nombres:"", apellidoPaterno:"", apellidoMaterno:"",
                email:"", numCelular:"", fechaDeNacimiento:"", contrasenia:"",
                materias: [
                  { idmateria: "", idhorario: "" },
                ]
              });
              setDireccionQuery("");
              setErrors({});
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Modal Nueva direcci?n */}
      {addDirOpen && (
        <div
          className="dialog-container active"
          onClick={(e) => { if (e.target.classList.contains("dialog-container")) setAddDirOpen(false); }}
        >
          <div className="dialog-box" style={{ maxWidth: 520, position:"relative" }}>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setAddDirOpen(false)}
              aria-label="Cerrar"
              style={{ position:"absolute", right:8, top:8, border:0, background:"transparent", cursor:"pointer", padding:4, lineHeight:0, borderRadius:8 }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>

            <h3 style={{ marginTop: 0 }}>Nueva direcci?n</h3>
            <form onSubmit={createNewDireccion} className="grid">
              <div className="fg span-12">
                <label>Zona</label>
                <input value={newDir.zona} onChange={e => setNewDir(s => ({ ...s, zona: e.target.value }))} required maxLength={100}/>
              </div>
              <div className="fg span-12">
                <label>Calle</label>
                <input value={newDir.calle} onChange={e => setNewDir(s => ({ ...s, calle: e.target.value }))} required maxLength={100}/>
              </div>
              <div className="fg span-12">
                <label>N?mero de puerta</label>
                <input value={newDir.num_puerta} onChange={e => setNewDir(s => ({ ...s, num_puerta: e.target.value }))} required maxLength={10}/>
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





