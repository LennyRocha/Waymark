import { useQuery } from '@tanstack/react-query';
import CalificacionRepository from '../repositories/CalificacionRepository';

export default function useCalificaciones(propiedadId: number) {
    return useQuery({
        queryKey: ['calificaciones', propiedadId],
        queryFn: () => CalificacionRepository.findByPropiedad(propiedadId),
        enabled: !!propiedadId,
    });
}
