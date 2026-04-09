// @ts-nocheck
import { useState } from 'react';
import { Star, PenLine } from 'lucide-react';
import useCalificaciones from '../hooks/useCalificaciones';
import usePromedioCalificacion from '../hooks/usePromedioCalificacion';
import useCalificacionMutation from '../hooks/useCalificacionMutation';
import ReseñaCard, { Estrellas } from './ReseñaCard';
import Modal from '../../../layout/Modal';
import CustomButton from '../../../components/CustomButton';
import { CustomTextArea } from '../../../components/CustomInputs';
import CustomLoader from '../../../layout/CustomLoader';
import toast from 'react-hot-toast';
import { getAxiosErrorMessage } from '../../../utils/getAxiosErrorMessage';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
    propiedadId: number;   // para cargar la lista y el promedio
    reservaId?: number;    // para poder crear una reseña — se tendrá cuando reservas esté listo
}

export default function SeccionReseñas({ propiedadId, reservaId }: Props) {
    const calificaciones = useCalificaciones(propiedadId);
    const promedio = usePromedioCalificacion(propiedadId);
    const queryClient = useQueryClient();

    const [showModal, setShowModal] = useState(false);
    const [puntuacion, setPuntuacion] = useState(0);
    const [hover, setHover] = useState(0);
    const [comentario, setComentario] = useState('');
    const [errores, setErrores] = useState({ puntuacion: '', comentario: '' });

    const mutation = useCalificacionMutation(
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['calificaciones', propiedadId] });
                queryClient.invalidateQueries({ queryKey: ['promedio_calificacion', propiedadId] });
                setShowModal(false);
                setPuntuacion(0);
                setComentario('');
                toast.success('¡Reseña publicada!');
            },
            onError: (error) => {
                const message = getAxiosErrorMessage(error);
                toast.error(message || 'Error al publicar la reseña');
            },
        },
        'post',
    );

    function handleSubmit() {
        const nuevosErrores = { puntuacion: '', comentario: '' };
        let valid = true;
        if (puntuacion === 0) {
            nuevosErrores.puntuacion = 'Selecciona una puntuación';
            valid = false;
        }
        if (!comentario.trim()) {
            nuevosErrores.comentario = 'El comentario no puede estar vacío';
            valid = false;
        }
        setErrores(nuevosErrores);
        if (!valid) return;

        // TODO: reservaId vendrá del módulo de reservas (Pedro) cuando esté listo
        mutation.mutate({ reserva_id: reservaId ?? 0, puntuacion, comentario: comentario.trim() });
    }

    const promedioVal = promedio.data?.promedio;
    const totalVal = promedio.data?.total ?? 0;

    return (
        <section className="w-full flex flex-col gap-4">
            {/* Encabezado con promedio */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Star size={24} fill="currentColor" className="text-yellow-400" />
                    <h4 className="font-semibold">
                        {promedioVal ? promedioVal.toFixed(1) : '—'}
                        <span className="text-text-secondary font-normal text-base ml-2">
                            ({totalVal} {totalVal === 1 ? 'reseña' : 'reseñas'})
                        </span>
                    </h4>
                </div>
                {/* TODO: habilitar cuando reservaId esté disponible (módulo reservas - Pedro) */}
                <CustomButton
                    variant="secondary"
                    size="small"
                    onClick={() => setShowModal(true)}
                    disabled={!reservaId}
                    title={!reservaId ? 'Solo puedes reseñar propiedades donde te has hospedado' : undefined}
                >
                    <PenLine size={16} />
                    Escribir reseña
                </CustomButton>
            </div>

            {/* Lista de reseñas */}
            {calificaciones.isLoading ? (
                <CustomLoader />
            ) : calificaciones.data?.length === 0 ? (
                <p className="text-text-secondary text-sm">
                    Aún no hay reseñas para este lugar.
                </p>
            ) : (
                <div className="flex flex-col">
                    {calificaciones.data?.map((c) => (
                        <ReseñaCard key={c.calificacion_id} calificacion={c} />
                    ))}
                </div>
            )}

            {/* Modal para crear reseña */}
            <Modal open={showModal} close={() => setShowModal(false)} width="min(520px, 100%)">
                <Modal.Header>
                    <div className="flex items-center gap-2">
                        <PenLine size={20} />
                        <h2>Escribir reseña</h2>
                    </div>
                </Modal.Header>

                <Modal.Body>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold">Puntuación</p>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onMouseEnter={() => setHover(i)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setPuntuacion(i)}
                                        className="cursor-pointer"
                                        title={`${i} estrella${i > 1 ? 's' : ''}`}
                                    >
                                        <Star
                                            size={32}
                                            className={
                                                i <= (hover || puntuacion)
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-200'
                                            }
                                            fill="currentColor"
                                        />
                                    </button>
                                ))}
                            </div>
                            {errores.puntuacion && (
                                <p className="text-sm text-orange-500">{errores.puntuacion}</p>
                            )}
                        </div>

                        <CustomTextArea
                            label="Comentario"
                            placeholder="Comparte tu experiencia en este lugar..."
                            value={comentario}
                            onChange={(e) => {
                                setComentario(e.target.value);
                                if (errores.comentario)
                                    setErrores((prev) => ({ ...prev, comentario: '' }));
                            }}
                            maxLength={1000}
                            resize="vertical"
                            inpSize="medium"
                            fullWidth
                            isError={!!errores.comentario}
                            errorMessage={errores.comentario}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <CustomButton
                        variant="primary"
                        onClick={handleSubmit}
                        isWaiting={mutation.isPending}
                    >
                        Publicar
                    </CustomButton>
                    <CustomButton
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        disabled={mutation.isPending}
                    >
                        Cancelar
                    </CustomButton>
                </Modal.Footer>
            </Modal>
        </section>
    );
}
