import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Modal from '../../layout/Modal';
import useAmenidades from './hooks/useAmenidades';
import Icono from '../../utils/Icono';

export default function PropiedadPage() {
  const amenidades = useAmenidades();
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
      <Modal open={show} close={() => setShow(false)} width={"min(768px, 100%)"} >
        <Modal.Header>
          <h3>¿Confirmación?</h3>
          <p>Estás seguro de eliminar esto</p>
        </Modal.Header>

        <Modal.Body>
          {amenidades.data?.map((a, index) => {
            return (
              <>
                {index === 0 ?  <p>{a.categoria}</p> : amenidades.data[index].categoria !== amenidades.data[index - 1].categoria &&
                  <p>{a.categoria}</p>
                }
                <div className="flex items-center gap-2" key={a.amenidad_id}>
                  <Icono name={a.icono_nombre} />
                  <p>{a.nombre}</p>
                </div>
              </>
            )
          })}
        </Modal.Body>

        <Modal.Footer>
          <button onClick={() => setShow(false)}>Cancelar</button>
        </Modal.Footer>
      </Modal>
      {
        amenidades.isLoading && <p>Cargando...</p>
      }
    </div>
  )
}