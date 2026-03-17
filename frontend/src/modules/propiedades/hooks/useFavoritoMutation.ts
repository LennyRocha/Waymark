import { useMutation } from "@tanstack/react-query";
import FavoritoRepository from "../repositories/FavoritoRepository";
import Favorito from "../types/Favorito";

type accion = "post" | "delete";
export default function useCreatePropiedad(
  props = {},
  accion: accion = "post",
) {
  if (accion === "post") {
    return useMutation({
      mutationFn: (data: Favorito) =>
        FavoritoRepository.save(data),
      ...props,
    });
  }

  return useMutation({
    mutationFn: (id: number) =>
      FavoritoRepository.delete(id),
    ...props,
  });
}
