import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function Registro() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    apellido_p: "",
    apellido_m: "",
    telefono: "",
    correo: "",
    password: "",
    rol: "1",
    ciudad: "",
    pais: "",
  });

  const [foto, setFoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0] || null;
    setFoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOk("");

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (foto) data.append("foto_perfil", foto);

      await api.post("/registro/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOk("Registro exitoso. Ahora inicia sesion.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const payload = err?.response?.data;
      if (payload && typeof payload === "object") {
        const firstKey = Object.keys(payload)[0];
        const firstVal = Array.isArray(payload[firstKey]) ? payload[firstKey][0] : payload[firstKey];
        setError(String(firstVal || "Error al registrar"));
      } else {
        setError("Error al registrar");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-[#fff7f2] via-white to-[#f5f7fb] px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-[560px] rounded-2xl border border-[var(--color-border)] bg-white/90 p-6 md:p-8 shadow-[0_18px_40px_rgba(43,49,69,0.14)]">
        <p className="m-0 uppercase tracking-[0.1em] text-xs font-bold text-[var(--secundario)]">
          Waymark
        </p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,3.6vw,2.4rem)] leading-tight text-[var(--t_primario)]">
          Crear cuenta
        </h1>
        <p className="mt-2 mb-6 text-[var(--t_secundario)]">
          Completa tus datos para registrarte y empezar a usar la plataforma.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="apellido_p">Apellido paterno</label>
              <input
                id="apellido_p"
                name="apellido_p"
                placeholder="Apellido paterno"
                value={form.apellido_p}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="apellido_m">Apellido materno</label>
              <input
                id="apellido_m"
                name="apellido_m"
                placeholder="Apellido materno"
                value={form.apellido_m}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="telefono">Telefono</label>
              <input
                id="telefono"
                name="telefono"
                placeholder="Tu telefono"
                value={form.telefono}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="correo">Correo</label>
              <input
                id="correo"
                name="correo"
                type="email"
                placeholder="tu-correo@ejemplo.com"
                value={form.correo}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="password">Contrasena</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Tu contrasena"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="rol">Rol</label>
              <select
                id="rol"
                name="rol"
                value={form.rol}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              >
                <option value="1">Cliente</option>
                <option value="2">Anfitrion</option>
                <option value="3">Admin</option>
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="foto_perfil">Foto de perfil</label>
              <input
                id="foto_perfil"
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="w-full rounded-xl border border-dashed border-[#d8dbe5] bg-white px-3.5 py-2.5 text-[var(--t_secundario)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--secundario)] file:px-3 file:py-2 file:text-white file:font-semibold hover:border-[var(--primario)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="ciudad">Ciudad</label>
              <input
                id="ciudad"
                name="ciudad"
                placeholder="Tu ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-semibold text-[var(--t_primario)]" htmlFor="pais">Pais</label>
              <input
                id="pais"
                name="pais"
                placeholder="Tu pais"
                value={form.pais}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
              />
            </div>
          </div>

          {error ? (
            <p className="m-0 rounded-lg bg-[#ffe6e5] px-3 py-2 text-sm text-[#9f0200]">
              {error}
            </p>
          ) : null}

          {ok ? (
            <p className="m-0 rounded-lg bg-[#e7f8ea] px-3 py-2 text-sm text-[#166534]">
              {ok}
            </p>
          ) : null}

          <button
            className="mt-1 rounded-xl bg-[linear-gradient(90deg,#bf0603,#8d0801)] px-4 py-3 font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-65"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>
        </form>

        <p className="mb-0 mt-4 text-[var(--t_secundario)]">
          Ya tienes cuenta? <Link to="/login">Inicia sesion</Link>
        </p>

        <Link
          to="/"
          className="mt-3 inline-flex items-center justify-center rounded-xl border border-[#8d0801] bg-white px-4 py-2.5 font-semibold text-[#8d0801] transition hover:bg-[#fff1f1]"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}