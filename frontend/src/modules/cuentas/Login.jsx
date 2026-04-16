import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

function routeByRole(roleName = "") {
  const role = roleName.trim().toLowerCase();

  if (role.includes("admin")) return "/admin";
  if (role.includes("anfit") || role.includes("ambos")) return "/host";
  return "/";
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    correo: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setAuthToken, setAuthRefreshToken } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/login/", {
        correo: form.correo,
        password: form.password,
      });

      setAuthToken(data.access);
      setAuthRefreshToken(data.refresh);
      localStorage.setItem("user_role", data?.usuario?.rol_nombre || "");

      navigate(routeByRole(data?.usuario?.rol_nombre), { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        "No se pudo iniciar sesion. Verifica correo y contrasena.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-[#fff7f2] via-white to-[#f5f7fb] px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-[460px] rounded-2xl border border-[var(--color-border)] bg-white/90 p-6 md:p-8 shadow-[0_18px_40px_rgba(43,49,69,0.14)]">
        <p className="m-0 uppercase tracking-[0.1em] text-xs font-bold text-[var(--secundario)]">
          Waymark
        </p>
        <h1 className="mt-2 mb-0 text-[clamp(1.8rem,3.6vw,2.4rem)] leading-tight text-[var(--t_primario)]">
          Iniciar sesion
        </h1>
        <p className="mt-2 mb-6 text-[var(--t_secundario)]">
          Accede para gestionar propiedades y reservas.
        </p>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1.5">
            <label className="font-semibold text-[var(--t_primario)]" htmlFor="correo">
              Correo
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="tu-correo@ejemplo.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-semibold text-[var(--t_primario)]" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-[#d8dbe5] px-3.5 py-3 text-[var(--t_primario)] outline-none transition focus:border-[var(--primario)] focus:shadow-[0_0_0_3px_rgba(191,6,3,0.15)]"
            />
          </div>

          {error ? (
            <p className="m-0 rounded-lg bg-[#ffe6e5] px-3 py-2 text-sm text-[#9f0200]">
              {error}
            </p>
          ) : null}

          <button
            className="mt-1 rounded-xl bg-[linear-gradient(90deg,#bf0603,#8d0801)] px-4 py-3 font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-65"
            type="submit"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>

        <p className="mb-0 mt-4 text-[var(--t_secundario)]">
          Aun no tienes cuenta? <Link to="/registro">Registrate</Link>
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