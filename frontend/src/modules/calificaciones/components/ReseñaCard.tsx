import { Star } from 'lucide-react';
import type { Calificacion } from '../types/Calificacion';

interface Props {
    calificacion: Calificacion;
}

export default function ReseñaCard({ calificacion }: Props) {
    const inicial =
        calificacion.usuario.nombre.charAt(0).toUpperCase() +
        calificacion.usuario.apellido_p.charAt(0).toUpperCase();

    return (
        <div className="flex flex-col gap-2 py-4 border-b border-border last:border-none">
            <div className="flex items-center gap-3">
                {calificacion.usuario.foto_perfil ? (
                    <img
                        src={calificacion.usuario.foto_perfil}
                        alt={calificacion.usuario.nombre}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary-600">{inicial}</span>
                    </div>
                )}
                <div>
                    <p className="font-semibold text-sm">
                        {calificacion.usuario.nombre} {calificacion.usuario.apellido_p}
                    </p>
                    <p className="text-xs text-text-secondary">
                        {new Date(calificacion.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                        })}
                    </p>
                </div>
            </div>
            <Estrellas puntuacion={calificacion.puntuacion} />
            <p className="text-sm text-text-primary leading-relaxed">{calificacion.comentario}</p>
        </div>
    );
}

export function Estrellas({
    puntuacion,
    size = 16,
}: {
    puntuacion: number;
    size?: number;
}) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={size}
                    className={i <= puntuacion ? 'text-yellow-400' : 'text-gray-200'}
                    fill={i <= puntuacion ? 'currentColor' : 'currentColor'}
                />
            ))}
        </div>
    );
}
