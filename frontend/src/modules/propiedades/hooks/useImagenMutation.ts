import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import Imagen from "../types/Imagen";
import ImagenRepository from "../repositories/ImagenRepository";

type accion = "post_all" | "post" | "put";
type MutationProps = UseMutationOptions<any, any, any, any>;

export default function useImagenMutation(
  props: MutationProps = {},
  accion: accion = "post_all",
) {
  let mutationFn:
    | ((data: FormData) => Promise<Imagen[]>)
    | ((data: Imagen) => Promise<Imagen>)
    | (({
        id,
        data,
      }: {
        id: number;
        data: Imagen;
      }) => Promise<Imagen>);

  if (accion === "post") {
    mutationFn = (data: Imagen) => ImagenRepository.save(data);
  } else if (accion === "put") {
    mutationFn = ({ id, data }: { id: number; data: Imagen }) =>
      ImagenRepository.update(data, id);
  } else {
    mutationFn = (data: FormData) => ImagenRepository.saveAll(data as any);
  }

  return useMutation({
    mutationFn: mutationFn as any,
    ...props,
  } as any);
}
