import { useQuery } from '@tanstack/react-query';
import CalificacionRepository from '../repositories/CalificacionRepository';

export default function useMisCalificaciones() {
    return useQuery({
        queryKey: ['mis_calificaciones'],
        queryFn: CalificacionRepository.findMine,
    });
}
