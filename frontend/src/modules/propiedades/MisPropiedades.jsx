import React from 'react'
import CustomLink from '../../components/CustomLink'
import useHostPropiedades from './hooks/useHostPropiedades'
import usePropiedades from './hooks/usePropiedades';
import DataTable from 'react-data-table-component'
import CustomLoader from '../../layout/CustomLoader';
import EmptyListComponent from '../../layout/EmptyListComponent';
import { CustomSwitch, MediumInput } from '../../components/CustomInputs';
import CustomButton from '../../components/CustomButton';
import { X, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorViewComponent from '../../layout/ErrorViewComponent';
import { useQueryClient } from '@tanstack/react-query';

export default function MisPropiedades() {
    const propiedades = useHostPropiedades({});
    const listings = usePropiedades();
    const navigate = useNavigate()

    const [filtro, setFiltro] = React.useState("");

    const sortedListings = propiedades.data?.results.filter(
        (listing) => listing.titulo.toLowerCase().includes(filtro.toLowerCase())
    );

    if (listings.data) console.log(listings.data)
    if (propiedades.data) console.log(propiedades.data)

    const queryClient = useQueryClient();
    return (
        <div className='content'>
            <h5 className='text-left'> {
                propiedades.data ?
                    `${propiedades.data?.results.length || 0} propiedades`
                    : "Mis propiedades"
            }</h5>
            {
                propiedades.isError ? (
                    <ErrorViewComponent error={propiedades.error} retryFunction={() => queryClient.invalidateQueries(["propiedades_host"])} />
                ) : (
                    <DataTable
                        columns={columnas}
                        data={sortedListings ?? []}
                        pagination
                        paginationPerPage={5}
                        linkComponent={CustomLink}
                        highlightOnHover
                        responsive
                        customStyles={tableStyles}
                        subHeader
                        subHeaderComponent={<Subheader isError={propiedades.isError} isLoading={propiedades.isInitialLoading || propiedades.isLoading} filtro={filtro} setFiltro={setFiltro} navigate={navigate} />}
                        subHeaderAlign="left"
                        noDataComponent={<EmptyListComponent titulo='¡Ups!' mensaje="No hay propiedades disponibles" />}
                        progressPending={propiedades.isInitialLoading || propiedades.isLoading}
                        progressComponent={<CustomLoader />}
                        compact
                    />
                )
            }
        </div>
    )
}

const columnas = [
    {
        name: "Propiedad",
        cell: (row) =>
            <div className="flex items-center justify-start  gap-2 px-2 w-full">
                <img
                    src={row.imagenes[0]?.url || "https://via.placeholder.com/50"}
                    alt={row.slug}
                    className='aspect-video w-[6rem]'
                    style={{ objectFit: 'cover', borderRadius: '5px' }}
                />
                <div className='flex flex-col items-left justify-center'>
                    <p className='text-left font-bold text-wrap'>{row.titulo}</p>
                    <small className='text-[0.5rem] font-light max-h-[50px] text-left truncate max-w-[250px] text-justify'>{row.descripcion}</small >
                </div>
            </div>
    },
    {
        name: "Estado", cell: (row) =>
            <div className="flex items-center justify-center  gap-2 px-2 w-full">
                <span className={`${row.activa ? 'bg-green-500' : 'bg-red-500'} aspect-square w-2 rounded-full`}></span>
                <p className='text-left text-text-secondary font-bold'>{row.activa ? "Activa" : "Inactiva"}</p>
            </div>,
        sortable: false, width: "125px", center: true
    },
    { name: "Recámaras", selector: (row) => row.habitaciones, sortable: true, width: "120px", center: true },
    { name: "Camas", selector: (row) => row.camas, sortable: true, width: "100px", center: true },
    { name: "Baños", selector: (row) => row.banos, sortable: true, width: "100px", center: true },
    { name: "Ubicación", selector: (row) => `${row.ciudad}, ${row.pais}`, sortable: true, width: "200px", center: true, wrap: true },
    { name: "Modifcado", selector: (row) => new Date(row.updated_at).toLocaleString("es-MX"), sortable: true, width: "200px", center: true },
    {
        name: "Acciones",
        cell: (row) => (
            <div className="flex gap-2 justify-center items-center px-2 w-[fit-content]">
                <CustomLink to={`/host/edit-listing/${row.id}`}>
                    <Pencil size={16} />
                    Editar
                </CustomLink>
                <div><CustomSwitch checked={row.activa} /></div>
            </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
    },
];

const Subheader = ({ isLoading, filtro, setFiltro, navigate, isError }) => {
    return (
        <div className="flex w-full items-center justify-between gap-2 max-md:flex-col">
            <div className='flex items-center gap-1'>
                <MediumInput
                    placeholder="Buscar propiedad..."
                    value={filtro}
                    icon='search'
                    isWaiting={isLoading}
                    onChange={(e) => setFiltro(e.target.value)}
                    disabled={isError}
                />
                {filtro && (
                    <CustomButton
                        type="button"
                        variant='tertiary'
                        onClick={() => setFiltro("")}
                    >
                        <X size={18} />
                    </CustomButton>
                )}
            </div>
            <CustomButton variant='primary' size='small' iconName='plus' onClick={() => navigate("/host/new-listing")} isWaiting={isLoading}>Nueva</CustomButton>
        </div>
    )
}

const tableStyles = {
    rows: {
        style: {
            minWidth: "fit-content",
            padding: "1rem 0.5rem",
            fontFamily: "'Montserrat', serif",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
        },
    },
    headCells: {
        style: {
            fontFamily: "'Cabin', serif",
            fontSize: '0.85rem',
            fontWeight: '700',
        },
    },
}