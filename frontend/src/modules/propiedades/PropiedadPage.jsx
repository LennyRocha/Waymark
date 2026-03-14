import React from 'react'
import { useParams } from 'react-router-dom'

export default function PropiedadPage() {
  const { idSlug } = useParams();
  const params = idSlug.split("-");
  const id = params[0];
  const slug = params[1];
  console.log(id, " ", slug);
  return (
    <div>PropiedadPage {idSlug}</div>
  )
}