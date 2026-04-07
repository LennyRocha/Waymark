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
import { Dot, MapPinHouse } from 'lucide-react';
import ReactMarkdown from "react-markdown";
import Calendar from 'react-calendar';
import Map, { Marker } from 'react-map-gl/mapbox';
import "react-calendar/dist/Calendar.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const MAX_LENGTH = 500;

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
  const [expanded, setExpanded] = useState(false);
  if (propiedad.isInitialLoading || propiedad.isLoading) return <main className='w-[100dvw] h-[100dvh] flex items-center justify-center' >
    <CustomLoader />
  </main>
  if (propiedad.isError) return <main className='w-[100dvw] h-[100dvh]'>
    <ErrorViewComponent error={propiedad.error} retryFunction={() => propiedad.refetch()} />
  </main>
  const prop = propiedad.data;
  const testDesc = "DEPARTAMENTO TOTALMENTE REMODELADO A TODO LUJO JUNTO AL MAR, para poder tener el mar a tus pies con toda la comodidad. Y contamos con acceso privado a la playa y a las albercas. El restaurante se encuentra a lado de la alberca por lo que sin salir podrás disfrutar de la magia del puerto,  muy bien ubicado cerca del Baby' O. Se cuenta a una cuadra con un estacionamiento publico, aunque es muy seguro dejar tu coche fuera del condominio. También hay  restaurant. \n La recepción está afectada por otis...";
  console.log(testDesc.length)

  const text = expanded
    ? prop.descripcion
    : prop.descripcion.substring(0, MAX_LENGTH);

  const shouldShowButton =
    prop.descripcion.length > MAX_LENGTH;
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
      <section className='w-full flex max-md:flex-col items-start justify-start gap-8' >
        <article className='flex-1 flex flex-col items-start justify-start gap-2'>
          <h4> {prop?.tipo.tipo.charAt(0).toUpperCase() + prop?.tipo.tipo.slice(1)} en {prop?.ciudad}, {prop?.region}</h4>
          <p className='text-text-secondary flex gap-1 items-center'>{prop.camas} {prop.camas === 1 ? "cama" : "camas"} <Dot size={14} /> {prop.banos} {prop.banos === 1 ? "baño" : "baños"}</p>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className='font-[montserrat] h-[150px] text-[14px]/[20px] text-text-primary text-left tracking-normal truncate w-full overflow-hidden whitespace-pre-line' >
                  {children}
                </p>
              ),
            }}
          >
            {text + (!expanded && shouldShowButton ? "..." : "")}
          </ReactMarkdown>

          {shouldShowButton && (
            <CustomButton
              variant="secondary"
              onClick={() => setShow(!show)}
            >
              {expanded ? "Mostrar menos" : "Mostrar más"}
            </CustomButton>
          )}

          <Divider />

          <Divider />

          <h3>Lo que ofrece este lugar</h3>

          <Divider />

          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>
          <h1>Texto largo</h1>

          {/*Aquí irá el calendario */}
          <Calendar value={new Date()} />

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
      <h4>Dónde vas a estar</h4>
      <p>{prop.ciudad} - {prop.region} - {prop.pais}</p>
      <Map
        longitude={prop.coordenadas.lng}
        latitude={prop.coordenadas.lat}
        zoom={16}
        onMove={() => { }}
        style={{ width: "100%", minHeight: 350, height: "auto", borderRadius: 8, marginRight: "auto", marginLeft: "auto" }}
        mapStyle='mapbox://styles/mapbox/streets-v12'
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={() => { }}
        cursor='crosshairs'
      >
        <Marker
          longitude={prop.coordenadas?.lng ?? 0}
          latitude={prop.coordenadas?.lat ?? 0}
          anchor='bottom'
        >
          <MapPinHouse color='#fff' fill='var(--color-primary-500)' size={64} strokeWidth={1} />
        </Marker>
      </Map>
      <Modal open={show} close={() => setShow(false)} width={"min(768px, 100%)"} >
        <Modal.Body>
          <h3>Acerca del espacio</h3>
          <p className='text-justify mt-4'>{prop.descripcion}</p>
        </Modal.Body>
      </Modal>
    </main >
  )
}

const Divider = () => (
  <div className="h-px w-full bg-gray-200 mt-2" />
);