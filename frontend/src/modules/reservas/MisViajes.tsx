// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomLoader from "../../layout/CustomLoader";
import Modal from "../../layout/Modal";
import { Star } from "lucide-react";
import toast from "react-hot-toast";
import apiToken from "../../utils/apiToken";
import Breadcrumb from "../../components/Breadcrumb";

type Reserva = {
  reserva_id: number;
  propiedad_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  huespedes: number;
  estado_nombre: string;
  codigo: string;
  precio_total: string;
  created_at: string;
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente:  "bg-yellow-100 text-yellow-800",
  confirmada: "bg-green-100 text-green-800",
  cancelada:  "bg-red-100 text-red-800",
  completada: "bg-blue-100 text-blue-800",
};

export default function MisViajes() {
  const queryClient = useQueryClient();

  const { data: reservas = [], isLoading, isError } = useQuery({
    queryKey: ["mis-reservas"],
    queryFn: () => apiToken.get("/reservas/mis-reservas/").then((r) => r.data),
  });

  const [selected, setSelected] = useState<Reserva | null>(null);
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [hovered, setHovered] = useState(0);

  const mutation = useMutation({
    mutationFn: (payload: { reserva_id: number; puntuacion: number; comentario: string }) =>
      apiToken.post("/calificaciones/", payload),
    onSuccess: () => {
      toast.success("¡Reseña enviada!");
      queryClient.invalidateQueries({ queryKey: ["mis-reservas"] });
      setSelected(null);
      setPuntuacion(5);
      setComentario("");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "No se pudo enviar la reseña.");
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!comentario.trim()) { toast.error("Escribe un comentario."); return; }
    mutation.mutate({ reserva_id: selected.reserva_id, puntuacion, comentario });
  }

  const links = [
    {
      label: "Inicio",
      href: "/",
    },
    {
      label: "Mis viajes",
      href: "/my-trips",
      disabled: true,
    },
  ];

  if (isLoading) return (
    <main className="w-full h-[60dvh] flex items-center justify-center">
      <CustomLoader />
    </main>
  );

  if (isError) return (
    <main className="w-full h-[60dvh] flex items-center justify-center">
      <p className="text-red-500">No se pudieron cargar las reservas.</p>
    </main>
  );

  return (
    <main className="max-w-[900px] mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={links} />
      <h2 className="text-left font-[montserrat]">Mis viajes</h2>

      {reservas.length === 0 ? (
        <p className="text-text-secondary">Aún no tienes reservas.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reservas.map((r: Reserva) => (
            <article
              key={r.reserva_id}
              className="border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold font-[montserrat] text-lg">
                  Reserva #{r.codigo}
                </span>
                <span className="text-text-secondary text-sm">
                  Propiedad ID: {r.propiedad_id}
                </span>
                <span className="text-text-secondary text-sm">
                  {r.fecha_inicio} → {r.fecha_fin} · {r.huespedes}{" "}
                  {r.huespedes === 1 ? "huésped" : "huéspedes"}
                </span>
                <span className="text-text-primary font-semibold text-sm">
                  Total: ${r.precio_total} MXN
                </span>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${ESTADO_COLOR[r.estado_nombre] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {r.estado_nombre}
                </span>
                <button
                  onClick={() => setSelected(r)}
                  className="text-sm font-semibold text-primary-500 hover:underline"
                >
                  Dejar reseña
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal de reseña */}
      <Modal open={!!selected} close={() => setSelected(null)} width="min(480px, 100%)">
        <Modal.Body>
          <h4 className="mb-1">Reseña para #{selected?.codigo}</h4>
          <p className="text-text-secondary text-sm mb-4">
            Califica tu experiencia en esta propiedad.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Estrellas */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setPuntuacion(n)}
                >
                  <Star
                    size={28}
                    className="transition"
                    fill={(hovered || puntuacion) >= n ? "#bf0603" : "none"}
                    color={(hovered || puntuacion) >= n ? "#bf0603" : "#d1d5db"}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-text-secondary self-center">
                {puntuacion}/5
              </span>
            </div>

            {/* Comentario */}
            <textarea
              className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 resize-none"
              rows={4}
              placeholder="Cuéntanos tu experiencia..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={1000}
              required
            />

            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-[linear-gradient(90deg,#bf0603,#8d0801)] px-4 py-3 font-bold text-white hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Enviando..." : "Enviar reseña"}
            </button>
          </form>
        </Modal.Body>
      </Modal>
    </main>
  );
}
