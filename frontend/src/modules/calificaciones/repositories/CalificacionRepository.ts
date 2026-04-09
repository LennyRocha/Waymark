import api from '../../../utils/api';
import { Calificacion, CalificacionForm, PromedioCalificacion } from '../types/Calificacion';

const prefix = 'calificaciones/';

const CalificacionRepository = {
    findAll: async () => {
        const res = await api.get<Calificacion[]>(prefix);
        return res.data;
    },
    findByPropiedad: async (propiedadId: number) => {
        const res = await api.get<Calificacion[]>(prefix, {
            params: { propiedad: propiedadId },
        });
        return res.data;
    },
    findMine: async () => {
        const res = await api.get<Calificacion[]>(`${prefix}mis_calificaciones/`);
        return res.data;
    },
    getPromedio: async (propiedadId: number) => {
        const res = await api.get<PromedioCalificacion>(`${prefix}promedio/`, {
            params: { propiedad: propiedadId },
        });
        return res.data;
    },
    save: async (data: CalificacionForm) => {
        const res = await api.post<Calificacion>(prefix, data);
        return res.data;
    },
    delete: async (id: number) => {
        const res = await api.delete<void>(`${prefix}${id}/`);
        return res.data;
    },
};

export default CalificacionRepository;
