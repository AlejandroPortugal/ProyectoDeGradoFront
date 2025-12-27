// src/components/usuarios/FormularioCreacionPs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { postPsicologo } from "../../servicios/psicologo.service.jsx";
import { getDirecciones, createDireccion } from "../../servicios/direccion.service.jsx";
import { getHorarios } from "../../servicios/horario.service.jsx";
import { getMateriaForPsicologo } from "../../servicios/materia.service.jsx"; // endpoint nuevo
import Toast from "../Toast.jsx";
import "./FormularioCreacion.css";

const limits = { max: "2005-12-31" };
const namePattern  = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// >= 6, al menos 1 mayúscula, 1 número y 1 caracter especial
const passPattern  = /^(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{6,}$/;

const normalizeArray = (res) => {
  const d = res?.data ?? res ?? [];
  return Array.isArray(d) ? d : [];
};
const normalizeMateria = (m) => ({
  idmateria: m.idmateria ?? m.idMateria ?? m.id,
  nombre: m.nombre ?? m.nombremateria ?? m.nombreMateria ?? "",
  ocupada: !!m.ocupada,
});
const normalizeHorario = (h) => ({
  idhorario: h.idhorario ?? h.idHorario ?? h.id,
  idmateria: h.idmateria ?? h.idMateria ?? null,
  horainicio: h.horainicio ?? h.horaInicio ?? "",
  horafin: h.horafin ?? h.horaFin ?? "",
  dia: h.dia ?? h.día ?? "",
});

export default function FormularioCreacionPs() {
  const [dirs, setDirs] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState({ dirs: false, horarios: false, materias: false });

  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [errors, setErrors] = useState({});

  // modal dirección
  const [addDirOpen, setAddDirOpen] = useState(false);
  const [newDir, setNewDir] = useState({ zona: "", calle: "", num_puerta: "" });

  // ojo contraseña
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
    idmateria: "",
    idhorario: "",
  });

  // cargar listas
  useEffect(() => {
    (async () => {
      setLoading({ dirs: true, horarios: true, materias: true });
      try {
        const [rDirs, rHor, rMat] = await Promise.all([
          getDirecciones().catch((e) => ({ error: e })),
          getHorarios().catch((e) => ({ error: e })),
          getMateriaForPsicologo().catch((e) => ({ error: e })), // ya viene con "ocupada"
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
    })();
  }, []);

  // materia seleccionada/ocupada
  const materiaSel = useMemo(
    () => materias.find((m) => String(m.idmateria) === String(form.idmateria)),
    [materias, form.idmateria]
  );
  const materiaOcupada = !!materiaSel?.ocupada;

  // horarios por materia
  const horariosFiltrados = useMemo(() => {
    const mid = Number(form.idmateria || 0);
    return horarios.filter((h) => Number(h.idmateria) === mid);
  }, [horarios, form.idmateria]);

  // cerrar modal si se elige dirección
  useEffect(() => { if (form.idDireccion) setAddDirOpen(false); }, [form.idDireccion]);

  // cerrar modal con ESC
  useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") setAddDirOpen(false); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const setField = (name, value) => setForm((s) => ({ ...s, [name]: value }));

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "idDireccion") {
      if (value === "__new__") {
        setAddDirOpen(true);
        setField("idDireccion", "");
        return;
      } else {
        setAddDirOpen(false);
      }
    }

    if (name === "idmateria") {
      // UX: impedir elegir si ya está ocupada
      const m = materias.find((x) => String(x.idmateria) === String(value));
      if (m?.ocupada) {
        setToast({ show: true, message: "La materia ya fue asignada.", type: "error" });
        return;
      }
      setForm((s) => ({ ...s, idmateria: value, idhorario: "" }));
      return;
    }

    if (name === "numCelular") {
      // Sólo dígitos y máximo 8 en el acto
      const digits = value.replace(/\D/g, "").slice(0, 8);
      setField(name, digits);
      return;
    }

    setField(name, value);
  };

  const trimAll = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));

  const validate = () => {
    const v = trimAll(form);
    const errs = {};

    ["idDireccion","nombres","apellidoPaterno","apellidoMaterno","email","numCelular","fechaDeNacimiento","contrasenia","idmateria","idhorario"]
      .forEach(k => { if (!String(v[k] || "").trim()) errs[k] = "Campo obligatorio."; });

    if (v.nombres && !namePattern.test(v.nombres)) errs.nombres = "Solo letras y espacios.";
    if (v.apellidoPaterno && !namePattern.test(v.apellidoPaterno)) errs.apellidoPaterno = "Solo letras y espacios.";
    if (v.apellidoMaterno && !namePattern.test(v.apellidoMaterno)) errs.apellidoMaterno = "Solo letras y espacios.";

    if (v.email && !emailPattern.test(v.email)) errs.email = "Correo no válido.";
    if (v.numCelular && !/^\d{8}$/.test(v.numCelular)) errs.numCelular = "Exactamente 8 dígitos.";

    if (v.contrasenia && !passPattern.test(v.contrasenia))
      errs.contrasenia = "Mín. 6, 1 mayúscula, 1 número y 1 especial.";

    if (v.fechaDeNacimiento) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v.fechaDeNacimiento)) {
        errs.fechaDeNacimiento = "Fecha inválida (YYYY-MM-DD).";
      } else if (new Date(v.fechaDeNacimiento) >= new Date("2006-01-01")) {
        errs.fechaDeNacimiento = "Debe ser anterior a 2006-01-01.";
      }
    }

    // bloquea si ocupada
    if (v.idmateria) {
      const m = materias.find((x) => String(x.idmateria) === String(v.idmateria));
      if (m?.ocupada) errs.idmateria = "Materia ocupada.";
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
      // fuerza YYYY-MM-DD
      const fechaISO = form.fechaDeNacimiento
        ? new Date(form.fechaDeNacimiento).toISOString().slice(0, 10)
        : "";

      const payload = {
        ...trimAll(form),
        estado: true,
        rol: "Psicologo",
        fechaDeNacimiento: fechaISO,
        fechaNacimiento:  fechaISO,
        fechadenacimiento: fechaISO,
      };

      await postPsicologo(payload);
      setToast({ show: true, message: "Psicólogo creado con éxito", type: "success" });
      setForm({
        idDireccion:"", nombres:"", apellidoPaterno:"", apellidoMaterno:"",
        email:"", numCelular:"", fechaDeNacimiento:"", contrasenia:"",
        idmateria:"", idhorario:""
      });
      setErrors({});
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || "Error al crear psicólogo";
      setToast({ show: true, message: msg, type: "error" });
    }
  };

  // Recarga cuando se cierra un toast de éxito
  const handleToastClose = () => {
    const wasSuccess = toast.type === "success";
    setToast({ show:false, message:"", type:"" });
    if (wasSuccess) window.location.reload();
  };

  const createNewDireccion = async (e) => {
    e.preventDefault();
    try {
      const zona = newDir.zona.trim();
      const calle = newDir.calle.trim();
      const num_puerta = newDir.num_puerta.trim();
      if (!zona || !calle || !num_puerta) {
        setToast({ show:true, message:"Todos los campos de dirección son obligatorios.", type:"error" });
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
          setField("idDireccion", id);
          setAddDirOpen(false);
          setToast({ show:true, message:"La dirección ya existe, Dirección seleccionada.", type:"success" });
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
          <Toast message={toast.message} type={toast.type} onClose={handleToastClose} />
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
            {dirs.map(d => (
              <option key={d.iddireccion} value={d.iddireccion}>
                {d.zona} - {d.calle} - {d.num_puerta}
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
        </div>
        {errors.fechaDeNacimiento && <div className="error">{errors.fechaDeNacimiento}</div>}

        {/* Email / Celular / Contraseña */}
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
            title="Correo válido"
            aria-invalid={!!errors.email}
          />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>

        <div className="fg span-3">
          <label>Celular</label>
          <input
            placeholder="8 dígitos"
            name="numCelular"
            value={form.numCelular}
            onChange={onChange}
            onInput={(e)=>{ e.target.value = e.target.value.replace(/\D/g,'').slice(0,8); }}
            required
            inputMode="numeric"
            maxLength={8}
            pattern="\d{8}"
            title="Exactamente 8 dígitos"
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
              title="Mín. 6, 1 mayúscula, 1 número y 1 especial"
              aria-invalid={!!errors.contrasenia}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPass((v) => !v)}
              style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", border:0, background:"transparent", cursor:"pointer", padding:4 }}
            >
              <span className="material-symbols-rounded" style={{ color:"black" }}>
                {showPass ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.contrasenia && <div className="error">{errors.contrasenia}</div>}
        </div>

        {/* Materia (solo 18/24/25) y Horario */}
        <div className="fg span-6">
          <label>Materia</label>
          <select
            name="idmateria"
            value={form.idmateria}
            onChange={onChange}
            required
            aria-invalid={!!errors.idmateria}
          >
            <option value="">{loading.materias ? "Cargando..." : "Selecciona una materia"}</option>
            {!loading.materias && materias.length === 0 && (
              <option value="" disabled>Sin materias disponibles</option>
            )}
            {materias.map((m) => (
              <option key={m.idmateria} value={m.idmateria} disabled={m.ocupada}>
                {m.nombre}{m.ocupada ? " (ocupada)" : ""}
              </option>
            ))}
          </select>
          {errors.idmateria && <div className="error">{errors.idmateria}</div>}
          <div className="helper">Primero selecciona la materia.</div>
        </div>

        <div className="fg span-6">
          <label>Horario</label>
          <select
            name="idhorario"
            value={form.idhorario}
            onChange={onChange}
            required
            disabled={!form.idmateria || materiaOcupada}
            aria-invalid={!!errors.idhorario}
          >
            <option value="">
              {!form.idmateria
                ? "Selecciona una materia primero"
                : materiaOcupada
                ? "Materia ocupada"
                : loading.horarios
                ? "Cargando..."
                : "Selecciona un horario"}
            </option>
            {!materiaOcupada && horariosFiltrados.map((h) => (
              <option key={h.idhorario} value={h.idhorario}>
                {h.dia ? `${h.dia} ` : ""}{h.horainicio} - {h.horafin}
              </option>
            ))}
          </select>
          {errors.idhorario && <div className="error">{errors.idhorario}</div>}
          <div className="helper">
            {materiaOcupada ? "La materia está ocupada." : "Se muestran solo los horarios de la materia elegida."}
          </div>
        </div>

        <div className="actions span-12">
          <button className="btn btn-primary" type="submit">Crear Psicólogo</button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={()=>{
              setForm({
                idDireccion:"", nombres:"", apellidoPaterno:"", apellidoMaterno:"",
                email:"", numCelular:"", fechaDeNacimiento:"", contrasenia:"",
                idmateria:"", idhorario:""
              });
              setErrors({});
            }}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Modal Nueva Dirección */}
      {addDirOpen && (
        <div
          className="dialog-container active"
          onClick={(e)=>{ if (e.target.classList.contains("dialog-container")) setAddDirOpen(false); }}
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

            <h3 style={{ marginTop: 0 }}>Nueva dirección</h3>
            <form onSubmit={createNewDireccion} className="grid">
              <div className="fg span-12"><label>Zona</label>
                <input value={newDir.zona} onChange={(e)=>setNewDir(s=>({...s, zona:e.target.value}))} required maxLength={100} />
              </div>
              <div className="fg span-12"><label>Calle</label>
                <input value={newDir.calle} onChange={(e)=>setNewDir(s=>({...s, calle:e.target.value}))} required maxLength={100} />
              </div>
              <div className="fg span-12"><label>Número de puerta</label>
                <input value={newDir.num_puerta} onChange={(e)=>setNewDir(s=>({...s, num_puerta:e.target.value}))} required maxLength={10} />
              </div>
              <div className="actions span-12">
                <button className="btn btn-primary" type="submit">Guardar</button>
                <button className="btn btn-secondary" type="button" onClick={()=>setAddDirOpen(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

