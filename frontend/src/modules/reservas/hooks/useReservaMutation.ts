import { useMutation } from "@tanstack/react-query";
import apiToken from "../../../utils/apiToken";
export default function useReservaMutation(props = {}) {
  interface Props {
    id: string;
    range: Date[];
    huespedes: number;
  }
  return useMutation({
    mutationFn: (data: Props) =>
      apiToken.post("/reservas/", {
        propiedad_id: data.id,
        fecha_inicio: toISO(data.range[0]),
        fecha_fin: toISO(data.range[1]),
        huespedes: data.huespedes,
      }),
    ...props,
  });
}

const toISO = (d: Date | undefined) =>
  d?.toISOString().split("T")[0];
