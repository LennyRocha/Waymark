import React from 'react'
import CustomLink from '../../components/CustomLink'
import useHostPropiedades from './hooks/useHostPropiedades'
import usePropiedades from './hooks/usePropiedades';

export default function MisPropiedades() {
    const propiedades = useHostPropiedades({});
    const listings = usePropiedades();
    if(listings.data) console.log(listings.data)
    return (
        <div className='content'>
            <h1 >Vista de mis propiedades</h1>
            {
                propiedades.isLoading ? (
                    <p>Cargando...</p>
                ) : propiedades.isError ? (
                    <p>Error al cargar propiedades</p>
                ) : (
                    <ul>
                        {propiedades.data.results.map((propiedad) => (
                            <li key={propiedad.id}>{propiedad.titulo}</li>
                        ))}
                    </ul>
                )
            }
            <CustomLink to={"/host/new-listing"}>Nueva propiedad</CustomLink>
        </div>
    )
}
