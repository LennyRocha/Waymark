// @ts-nocheck
import { Star } from 'lucide-react';
import useMisCalificaciones from './hooks/useMisCalificaciones';
import useCalificacionMutation from './hooks/useCalificacionMutation';
import { Estrellas } from './components/ReseñaCard';
import CustomLoader from '../../layout/CustomLoader';
import ErrorViewComponent from '../../layout/ErrorViewComponent';
import EmptyListComponent from '../../layout/EmptyListComponent';
import Breadcrumb from '../../components/Breadcrumb';
import CustomButton from '../../components/CustomButton';
import Modal from '../../layout/Modal';
import toast from 'react-hot-toast';
import { getAxiosErrorMessage } from '../../utils/getAxiosErrorMessage';
import useSetPageTitle from '../../utils/setPageTitle';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const links = [
    { label: 'Inicio', href: '/guest' },
    { label: 'Mis reseñas', href: '/guest/reviews', disabled: true },
];

export default function MisReseñas() {
    useSetPageTitle('Mis reseñas - Waymark');

    const calificaciones = useMisCalificaciones();
    const queryClient = useQueryClient();

    const [idEliminar, setIdEliminar] = useState(null);

    const mutation = useCalificacionMutation(
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['mis_calificaciones'] });
                setIdEliminar(null);
                toast.success('Reseña eliminada');
            },
            onError: (error) => {
                const message = getAxiosErrorMessage(error);
                toast.error(message || 'Error al eliminar la reseña');
            },
        },
        'delete',
    );

    return (
        <div className="content">
            <Breadcrumb items={links} />

            <h5 className="mt-4">
                {calificaciones.data
                    ? `${calificaciones.data.length} reseña${calificaciones.data.length !== 1 ? 's' : ''}`
                    : 'Mis reseñas'}
            </h5>

            {calificaciones.isError ? (
                <ErrorViewComponent
                    error={calificaciones.error}
                    retryFunction={() => calificaciones.refetch()}
                />
            ) : calificaciones.isLoading ? (
                <CustomLoader />
            ) : calificaciones.data?.length === 0 ? (
                <EmptyListComponent
                    titulo="Sin reseñas"
                    mensaje="Aún no has escrito ninguna reseña"
                />
            ) : (
                <div className="mt-4 flex flex-col gap-3">
                    {calificaciones.data?.map((cal) => (
                        <div
                            key={cal.calificacion_id}
                            className="bg-white border border-border rounded-xl p-4 flex flex-col gap-2"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col gap-1">
                                    <p className="font-semibold text-sm">
                                        Reserva #{cal.reserva_id}
                                    </p>
                                    <Estrellas puntuacion={cal.puntuacion} />
                                    <p className="text-xs text-text-secondary">
                                        {new Date(cal.created_at).toLocaleDateString('es-MX', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <CustomButton
                                    variant="tertiary"
                                    size="small"
                                    onClick={() => setIdEliminar(cal.calificacion_id)}
                                >
                                    Eliminar
                                </CustomButton>
                            </div>
                            <p className="text-sm text-text-primary leading-relaxed">
                                {cal.comentario}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={!!idEliminar}
                close={() => setIdEliminar(null)}
                width="min(480px, 100%)"
            >
                <Modal.Header>
                    <h2>¿Eliminar reseña?</h2>
                </Modal.Header>
                <Modal.Body>
                    <p>Esta acción no se puede deshacer.</p>
                </Modal.Body>
                <Modal.Footer>
                    <CustomButton
                        variant="primary"
                        onClick={() => mutation.mutate(idEliminar)}
                        isWaiting={mutation.isPending}
                    >
                        Eliminar
                    </CustomButton>
                    <CustomButton
                        variant="secondary"
                        onClick={() => setIdEliminar(null)}
                        disabled={mutation.isPending}
                    >
                        Cancelar
                    </CustomButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
