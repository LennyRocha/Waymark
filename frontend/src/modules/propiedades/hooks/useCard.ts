import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function useCard(id: number) {
  return useQuery({
    queryKey: ["cards", id],
    queryFn: () => PropiedadRepository.getCard(id),
    staleTime: 1000 * 60 * 5,
  });
}
