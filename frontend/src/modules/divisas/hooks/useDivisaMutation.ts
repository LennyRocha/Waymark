import { useMutation } from "@tanstack/react-query";
import Divisa from "../types/Divisa";
import DivisaRepository from "../repositories/DivisaRepository";

export default function useDivisaMutation(props = {}) {
  return useMutation({
    mutationFn: ({
      data,
      id,
    }: {
      data: Partial<Divisa>;
      id?: number;
    }) =>
      id
        ? DivisaRepository.update(data, id)
        : DivisaRepository.save(data),
    ...props,
  });
}
