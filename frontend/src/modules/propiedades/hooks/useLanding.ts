import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function useLanding() {
  return useQuery({
    queryKey: ["landing"],

    queryFn: () => PropiedadRepository.getLanding(),

    staleTime: 1000 * 60 * 5, // 5 min
  });
}
