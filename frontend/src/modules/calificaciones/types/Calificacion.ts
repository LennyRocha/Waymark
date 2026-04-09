export interface UsuarioSimple {
    usuario_id: number;
    nombre: string;
    apellido_p: string;
    foto_perfil: string | null;
}

export interface Calificacion {
    calificacion_id: number;
    usuario: UsuarioSimple;
    reserva_id: number;
    puntuacion: number;
    comentario: string;
    created_at: string;
}

export interface CalificacionForm {
    reserva_id: number;
    puntuacion: number;
    comentario: string;
}

export interface PromedioCalificacion {
    promedio: number | null;
    total: number;
}
