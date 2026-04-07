import {
  useQuery,
} from "@tanstack/react-query";
import TipoPropiedadRepository from "../repositories/TipoPropiedadRepository";

export default function useTipos() {
  return useQuery({
    queryKey: ["tipos_propiedad"],
    queryFn: TipoPropiedadRepository.findAll,
  });
}
