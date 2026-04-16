import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function useCards() {
  return useQuery({
    queryKey: ["cards"],
    queryFn: () => PropiedadRepository.getCards(),
    staleTime: 1000 * 60 * 5,
  });
}
