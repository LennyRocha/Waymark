import { useMutation } from "@tanstack/react-query";
import Imagen, { Payload } from "../types/Imagen";
import ImagenRepository from "../repositories/ImagenRepository";

type accion = "post" | "put";
export default function useImagenMutation(
  props = {},
  accion: accion = "post",
) {
  if (accion === "post") {
    return useMutation({
      mutationFn: (data: Payload) =>
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
