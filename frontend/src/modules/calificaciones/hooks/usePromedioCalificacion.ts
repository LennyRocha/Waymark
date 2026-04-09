import { useQuery } from '@tanstack/react-query';
import CalificacionRepository from '../repositories/CalificacionRepository';

export default function usePromedioCalificacion(propiedadId: number) {
    return useQuery({
        queryKey: ['promedio_calificacion', propiedadId],
        queryFn: () => CalificacionRepository.getPromedio(propiedadId),
        enabled: !!propiedadId,
    });
}
