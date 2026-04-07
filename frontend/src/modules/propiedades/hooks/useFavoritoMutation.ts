import { useMutation } from "@tanstack/react-query";
import FavoritoRepository from "../repositories/FavoritoRepository";
import { FavoritoRequest } from "../types/Favorito";

export function useFavoritoPost(props = {}) {
  return useMutation({
    mutationFn: (data: FavoritoRequest) =>
      FavoritoRepository.save(data),
    ...props,
  });
}

export function useFavoritoDelete(props = {}) {
  return useMutation({
    mutationFn: (id: number) =>
      FavoritoRepository.delete(id),
    ...props,
  });
}
