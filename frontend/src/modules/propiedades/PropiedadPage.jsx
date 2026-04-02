import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Modal from '../../layout/Modal';
import useAmenidades from './hooks/useAmenidades';
import Icono from '../../utils/Icono';
import usePropiedad from './hooks/useGetPropiedad';
import CustomLoader from '../../layout/CustomLoader';
import ErrorViewComponent from '../../layout/ErrorViewComponent';
import CustomButton from '../../components/CustomButton';
import useSetPageTitle from '../../utils/setPageTitle';

export default function PropiedadPage() {
  const amenidades = useAmenidades();
  const { idSlug } = useParams();
  const params = idSlug.split("-");
  const id = params[0];
  const slug = params[1];
  console.log(id, " ", slug);
  const [show, setShow] = useState(false);
  const propiedad = usePropiedad(id);
  useSetPageTitle(propiedad.data ? `${propiedad.data?.titulo} - Waymark` : "Waymark - Encuentra el lugar perfecto para tu próxima aventura");
  if (propiedad.isInitialLoading || propiedad.isLoading) return <main className='w-[100dvw] h-[100dvh] flex items-center justify-center' >
    <CustomLoader />
  </main>
  if (propiedad.isError) return <main className='w-[100dvw] h-[100dvh]'>
    <ErrorViewComponent error={propiedad.error} retryFunction={() => propiedad.refetch()} />
  </main>
  const prop = propiedad.data;
  return (
    <main className='w-full p-[1rem] mx-auto max-w-[1200px] flex flex-col items-start justify-start gap-4' >
      <h3 className='md:text-left font-[montserrat]'>{prop?.titulo}</h3>
      <div className="grid grid-cols-4 gap-2 md:h-[450px]">
        <div className="overflow-hidden col-span-2 row-span-2 rounded-l-xl hover:brightness-95 cursor-pointer">
          <img className='w-full h-full object-cover' src={prop?.imagenes[0]?.url} alt={`Imagen #${prop?.imagenes[0]?.orden}`} />
        </div>
        <div className=" text-white hover:brightness-95 cursor-pointer overflow-hidden ">
          <img className='w-full h-full object-cover' src={prop?.imagenes[1]?.url} alt={`Imagen #${prop?.imagenes[1]?.orden}`} />
        </div>
        <div className=" text-white hover:brightness-95 cursor-pointer overflow-hidden rounded-tr-xl">
          <img className='w-full h-full object-cover' src={prop?.imagenes[2]?.url} alt={`Imagen #${prop?.imagenes[2]?.orden}`} />
        </div>
        <div className=" hover:brightness-95 cursor-pointer overflow-hidden">
          <img className='w-full h-full object-cover' src={prop?.imagenes[3]?.url} alt={`Imagen #${prop?.imagenes[3]?.orden}`} />
        </div>
        <div className="hover:brightness-95 cursor-pointer overflow-hidden rounded-br-xl relative">
          <img className='w-full h-full object-cover' src={prop?.imagenes[4]?.url} alt={`Imagen #${prop?.imagenes[4]?.orden}`} />
        </div>
      </div>
      <section className='w-full flex max-md:flex-col items-start justify-start gap-2' >
        <article className='flex-1 flex flex-col items-start justify-start gap-2'>
          <h4> {prop?.tipo.tipo.charAt(0).toUpperCase() + prop?.tipo.tipo.slice(1)} en {prop?.ciudad}, {prop?.pais}</h4>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>  <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>

        </article>
        <article className='p-6 top-4 sticky  max-md:hidden  md:w-[275px] lg:w-[400px] shadow-md/30 bg-white rounded-xl gap-4 flex flex-col items-start justify-start' >
          <h4 className='text-left'>${prop?.precio_noche} MXN por noche</h4>
          <div>
            <div></div>
            <div className='relative'>
              <input type="number" />
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <h6>Total por x noches</h6>
            <p>${(Math.round(prop?.precio_noche * 5 * 100) / 100)} MXN</p>
          </div>
          <CustomButton size='large' fullWidth >Reservar</CustomButton>
          <p className='text-text-secondary text-center mx-auto'>El pago se realiza en efectivo</p>
        </article>
      </section>
      PropiedadPage {idSlug}
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
                {index === 0 ? <p>{a.categoria}</p> : amenidades.data[index].categoria !== amenidades.data[index - 1].categoria &&
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
    </main>
  )
}