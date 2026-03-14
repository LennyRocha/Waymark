import React from 'react'
import { useParams } from 'react-router-dom'

export default function PropiedadPage() {
    const { nombre } = useParams();
  return (
    <div>PropiedadPage {nombre}</div>
  )
}
