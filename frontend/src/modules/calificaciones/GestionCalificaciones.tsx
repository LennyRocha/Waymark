// @ts-nocheck
import { useState } from 'react';
import DataTable from 'react-data-table-component';
import { Star } from 'lucide-react';
import useCalificacionMutation from './hooks/useCalificacionMutation';
import useCalificaciones from './hooks/useCalificaciones';
import type { Calificacion } from './types/Calificacion';
import { Estrellas } from './components/ReseñaCard';
import CustomLoader from '../../layout/CustomLoader';
import EmptyListComponent from '../../layout/EmptyListComponent';
import ErrorViewComponent from '../../layout/ErrorViewComponent';
import Breadcrumb from '../../components/Breadcrumb';
import Modal from '../../layout/Modal';
import CustomButton from '../../components/CustomButton';
import { MediumInput } from '../../components/CustomInputs';
import toast from 'react-hot-toast';
import { getAxiosErrorMessage } from '../../utils/getAxiosErrorMessage';
import useSetPageTitle from '../../utils/setPageTitle';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';

const links = [
    { label: 'Admin', href: '/admin' },
    { label: 'Reseñas', href: '/admin/reviews', disabled: true },
];

const tableStyles = {
    rows: {
        style: {
            minWidth: 'fit-content',
            padding: '1rem 0.5rem',
            fontFamily: "'Montserrat', serif",
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
        },
    },
    headCells: {
        style: {
            fontFamily: "'Cabin', serif",
            fontSize: '0.85rem',
            fontWeight: '700',
        },
    },
    pagination: {
        select: {
            style: {
                color: '#000',
                backgroundColor: '#fff',
            },
        },
    },
};

// La vista de admin carga todas las reseñas sin filtro de propiedad (propiedadId=0)
// El backend devuelve todas cuando no se pasa el parámetro
import CalificacionRepository from './repositories/CalificacionRepository';
import { useQuery } from '@tanstack/react-query';

function useTodasCalificaciones() {
    return useQuery({
        queryKey: ['calificaciones_admin'],
        queryFn: CalificacionRepository.findAll,
    });
}

export default function GestionCalificaciones() {
    useSetPageTitle('Gestión de reseñas - Waymark');

    const calificaciones = useTodasCalificaciones();
    const queryClient = useQueryClient();

    const [filtro, setFiltro] = useState('');
    const [idEliminar, setIdEliminar] = useState(null);

    const datos = (calificaciones.data ?? []).filter((c) => {
        const nombre = `${c.usuario.nombre} ${c.usuario.apellido_p}`.toLowerCase();
        return nombre.includes(filtro.toLowerCase()) || String(c.reserva_id).includes(filtro);
    });

    const mutation = useCalificacionMutation(
        {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['calificaciones_admin'] });
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

    const columnas = [
        {
            name: 'Usuario',
            cell: (row: Calificacion) => (
                <div className="flex flex-col py-2">
                    <span className="font-semibold">
                        {row.usuario.nombre} {row.usuario.apellido_p}
                    </span>
                </div>
            ),
            grow: 1,
        },
        {
            name: 'Reserva',
            selector: (row: Calificacion) => `#${row.reserva_id}`,
            sortable: true,
            width: '110px',
            center: true,
        },
        {
            name: 'Puntuación',
            cell: (row: Calificacion) => <Estrellas puntuacion={row.puntuacion} size={14} />,
            sortable: true,
            width: '150px',
            center: true,
        },
        {
            name: 'Comentario',
            cell: (row: Calificacion) => (
                <p
                    className="text-sm text-text-primary max-w-[300px] truncate py-2"
                    title={row.comentario}
                >
                    {row.comentario}
                </p>
            ),
            grow: 2,
        },
        {
            name: 'Fecha',
            selector: (row: Calificacion) =>
                new Date(row.created_at).toLocaleDateString('es-MX'),
            sortable: true,
            width: '140px',
            center: true,
        },
        {
            name: 'Acciones',
            cell: (row: Calificacion) => (
                <CustomButton
                    size="small"
                    variant="tertiary"
                    onClick={() => setIdEliminar(row.calificacion_id)}
                >
                    Eliminar
                </CustomButton>
            ),
            ignoreRowClick: true,
            width: '120px',
            center: true,
        },
    ];

    return (
        <div className="content">
            <Breadcrumb items={links} />

            <h5 className="mt-4">
                {calificaciones.data
                    ? `${datos.length} reseña${datos.length !== 1 ? 's' : ''}`
                    : 'Gestión de reseñas'}
            </h5>

            {calificaciones.isError ? (
                <ErrorViewComponent
                    error={calificaciones.error}
                    retryFunction={() => calificaciones.refetch()}
                />
            ) : (
                <DataTable
                    columns={columnas}
                    data={datos}
                    pagination
                    paginationPerPage={10}
                    highlightOnHover
                    responsive
                    customStyles={tableStyles}
                    subHeader
                    subHeaderComponent={
                        <div className="flex items-center gap-1 w-full max-w-sm">
                            <MediumInput
                                placeholder="Buscar por usuario o reserva..."
                                value={filtro}
                                icon="search"
                                onChange={(e) => setFiltro(e.target.value)}
                                isWaiting={calificaciones.isLoading}
                            />
                            {filtro && (
                                <CustomButton
                                    type="button"
                                    variant="tertiary"
                                    onClick={() => setFiltro('')}
                                >
                                    <X size={18} />
                                </CustomButton>
                            )}
                        </div>
                    }
                    subHeaderAlign="left"
                    noDataComponent={
                        <EmptyListComponent
                            titulo="Sin reseñas"
                            mensaje="No hay reseñas que coincidan con la búsqueda"
                        />
                    }
                    progressPending={calificaciones.isLoading}
                    progressComponent={<CustomLoader />}
                    paginationRowsPerPageOptions={[10, 20, 50]}
                    compact
                />
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
                        Confirmar
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
