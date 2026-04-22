// @ts-nocheck
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import CustomLoader from "../../layout/CustomLoader";
import Avatar from "../../components/Avatar";
import apiToken from "../../utils/apiToken";
import Breadcrumb from "../../components/Breadcrumb";
import toast from "react-hot-toast";

type Solicitud = {
  reserva_id: number;
  propiedad_id: number;
  propiedad_titulo: string;
  huesped_nombre: string;
  huesped_apellido: string;
  huesped_foto: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  huespedes: number;
  estado_nombre: string;
  codigo: string;
  precio_total: string;
  created_at: string;
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  confirmada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
  finalizada: "bg-blue-100 text-blue-800",
  completada: "bg-blue-100 text-blue-800",
};

const links = [
  {
    label: "Inicio",
    href: "/",
  },
  {
    label: "Anfitrión",
    href: "/host",
    disabled: true,
  },
];

export default function Solicitudes() {
  const queryClient = useQueryClient();

  const {
    data: solicitudes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["solicitudes"],
    queryFn: () =>
      apiToken
        .get("/reservas/solicitudes/")
        .then((r) => r.data),
  });

  const confirmarMutation = useMutation({
    mutationFn: (reservaId: number) =>
      apiToken.patch(`/reservas/${reservaId}/confirmar/`),
    onSuccess: () => {
      toast.success("Reserva confirmada");
      queryClient.invalidateQueries({
        queryKey: ["solicitudes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["reservas_propiedad"],
      });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.detail ||
          "No se pudo confirmar la reserva.",
      );
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: (reservaId: number) =>
      apiToken.patch(`/reservas/${reservaId}/cancelar/`),
    onSuccess: () => {
      toast.success("Reserva cancelada");
      queryClient.invalidateQueries({
        queryKey: ["solicitudes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["reservas_propiedad"],
      });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.detail ||
          "No se pudo cancelar la reserva.",
      );
    },
  });

  if (isLoading)
    return (
      <main className="w-full h-[60dvh] flex items-center justify-center">
        <CustomLoader />
      </main>
    );

  if (isError)
    return (
      <main className="w-full h-[60dvh] flex items-center justify-center">
        <p className="text-red-500">
          No se pudieron cargar las solicitudes.
        </p>
      </main>
    );

  return (
    <main className="max-w-[900px] mx-auto px-4 py-8 flex flex-col gap-6">
      <Breadcrumb items={links} />
      <h2 className="text-left font-[montserrat]">
        Solicitudes
      </h2>

      {solicitudes.length === 0 ? (
        <p className="text-text-secondary">
          Aún no tienes solicitudes de reserva.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {solicitudes.map((s: Solicitud) => (
            <article
              key={s.reserva_id}
              className="border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-2">
                <span className="font-semibold font-[montserrat] text-lg">
                  {s.propiedad_titulo}
                </span>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={s.huesped_foto}
                    size={32}
                    name={s.huesped_nombre || ""}
                  />
                  <span className="text-text-secondary text-sm">
                    {s.huesped_nombre} {s.huesped_apellido}
                  </span>
                </div>
                <span className="text-text-secondary text-sm">
                  {s.fecha_inicio} → {s.fecha_fin} ·{" "}
                  {s.huespedes}{" "}
                  {s.huespedes === 1
                    ? "huésped"
                    : "huéspedes"}
                </span>
                <span className="text-text-primary font-semibold text-sm">
                  Total: ${s.precio_total} MXN
                </span>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${ESTADO_COLOR[s.estado_nombre] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {s.estado_nombre}
                </span>
                <span className="text-xs text-text-secondary font-mono">
                  #{s.codigo}
                </span>
                {s.estado_nombre === "pendiente" && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() =>
                        confirmarMutation.mutate(
                          s.reserva_id,
                        )
                      }
                      disabled={
                        confirmarMutation.isPending ||
                        cancelarMutation.isPending
                      }
                      className="text-xs font-semibold rounded-lg px-3 py-1 bg-green-600 text-white disabled:opacity-60"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() =>
                        cancelarMutation.mutate(
                          s.reserva_id,
                        )
                      }
                      disabled={
                        confirmarMutation.isPending ||
                        cancelarMutation.isPending
                      }
                      className="text-xs font-semibold rounded-lg px-3 py-1 bg-red-600 text-white disabled:opacity-60"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
