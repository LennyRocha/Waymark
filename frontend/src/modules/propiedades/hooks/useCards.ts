import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function useCards(w_city?: boolean) {
  const withCity = !!w_city;
  return useQuery({
    queryKey: ["cards", withCity],
    queryFn: () => PropiedadRepository.getCards(w_city),
    staleTime: 1000 * 60 * 5,
  });
}
