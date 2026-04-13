import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";

export default function useGetHost(id: number) {
  return useQuery({
    queryKey: ["fetch_host", id],
    queryFn: () => PropiedadRepository.findDueno(id),
    enabled: !!id,
  });
}