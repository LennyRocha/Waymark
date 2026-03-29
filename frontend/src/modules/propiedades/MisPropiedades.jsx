import React from 'react'
import CustomLink from '../../components/CustomLink'

export default function MisPropiedades() {
    return (
        <div className='content'>
            <h1 >Vista de mis propiedades</h1>
            <CustomLink to={"/host/new-listing"}>Nueva propiedad</CustomLink>
        </div>
    )
}
