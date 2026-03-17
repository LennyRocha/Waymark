import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Modal from '../../layout/Modal';

export default function PropiedadPage() {
  const { idSlug } = useParams();
  const params = idSlug.split("-");
  const id = params[0];
  const slug = params[1];
  console.log(id, " ", slug);
  const [show, setShow] = useState(false);
  return (
    <div>PropiedadPage {idSlug}
      <br />
      <button onClick={() => setShow(!show)} >Show modal</button>
      <Modal open={show} close={() => setShow(false)} >
        <h3>¿Confirmación?</h3>
        <p>Estas seguro de eliminar esto</p>
        <button onClick={() => setShow(false)} >Cerrar</button>
      </Modal></div>
  )
}