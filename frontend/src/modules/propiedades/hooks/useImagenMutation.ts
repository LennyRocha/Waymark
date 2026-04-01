import { useMutation } from "@tanstack/react-query";
import Imagen, { Payload } from "../types/Imagen";
import ImagenRepository from "../repositories/ImagenRepository";

type accion = "post_all" | "post" | "put";
export default function useImagenMutation(
  props = {},
  accion: accion = "post_all",
) {
  if (accion === "post_all") {
    return useMutation({
      mutationFn: (data: Payload) =>
        ImagenRepository.saveAll(data),
      ...props,
    });
  }

  if (accion === "post") {
    return useMutation({
      mutationFn: (data: Imagen) =>
        ImagenRepository.save(data),
      ...props,
    });
  }

  if (accion === "put") {
    return useMutation({
      mutationFn: ({
        id,
        data,
      }: {
        id: number;
        data: Imagen;
      }) => ImagenRepository.update(data, id),
      ...props,
    });
  }
}
