import {
  useQuery,
} from "@tanstack/react-query";
import FavoritoRepository from "../repositories/FavoritoRepository";

export default function useFavoritos() {
  return useQuery({
    queryKey: ["favoritos"],
    queryFn: FavoritoRepository.findAll,
  });
}
