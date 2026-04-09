import { useMutation } from '@tanstack/react-query';
import CalificacionRepository from '../repositories/CalificacionRepository';
import { CalificacionForm } from '../types/Calificacion';

type Accion = 'post' | 'delete';

export default function useCalificacionMutation(props = {}, accion: Accion = 'post') {
    if (accion === 'delete') {
        return useMutation({
            mutationFn: (id: number) => CalificacionRepository.delete(id),
            ...props,
        });
    }

    return useMutation({
        mutationFn: (data: CalificacionForm) => CalificacionRepository.save(data),
        ...props,
    });
}
