import { useQuery } from "@tanstack/react-query";
import DivisaRepository from "../repositories/DivisaRepository";

export default function useDivisas() {
  return useQuery({
    queryKey: ["divisas"],
    queryFn: DivisaRepository.findAll,
  });
}
