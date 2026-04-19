import {
  useQuery,
} from "@tanstack/react-query";
import FavoritoRepository from "../repositories/FavoritoRepository";
import { useAuth } from "../../../context/AuthContext";

export default function useFavoritos() {
  const auth = useAuth();
  return useQuery({
    queryKey: ["favoritos"],
    queryFn: FavoritoRepository.findAll,
    enabled: !!auth?.isAuthenticated,
  });
}
