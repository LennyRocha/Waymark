import {
  useQuery,
} from "@tanstack/react-query";
import AmenidadRepository from "../repositories/AmenidadRepository";

export default function useAmenidades() {
  return useQuery({
    queryKey: ["amenidades"],
    queryFn: AmenidadRepository.findAll,
  });
}