import { useQuery } from "@tanstack/react-query";
import PropiedadRepository from "../repositories/PropiedadRepository";
import { useAuth } from "../../../context/AuthContext";

export default function useLanding() {
  const auth = useAuth();
  const token = auth?.token || null;
  return useQuery({
    queryKey: ["landing", token],

    queryFn: () => PropiedadRepository.getLanding(),

    staleTime: 1000 * 60 * 5, // 5 min
  });
}
