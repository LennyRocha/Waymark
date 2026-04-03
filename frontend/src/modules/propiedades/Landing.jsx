/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useMemo } from 'react'
import PropiedadCard from './components/PropiedadCard';
import { GalleryHorizontal, Menu } from 'lucide-react';
import { useScroll, useMotionValueEvent, motion } from "framer-motion"
import CustomLink from '../../components/CustomLink';
import Buscador from './components/Buscador';
import CustomDropdown from '../../components/CustomDropdown';
import DropdownParent from '../../components/DropdownParent';
import BuscadorBoton from './components/BuscadorBoton'
import Footer from '../../layout/Footer';
import Skeleton from 'react-loading-skeleton';
import useSetPageTitle from '../../utils/setPageTitle';
import useUbicaciones from './hooks/useUbicaciones';
import usePropiedades from './hooks/usePropiedades';
import { propiedadesMock } from './data/PropiedadesMock';

export default function Landing() {
  const ubicaciones = useUbicaciones();
  const propiedades = usePropiedades();
  const isLoading = ubicaciones.isInitialLoading || ubicaciones.isLoading || propiedades.isInitialLoading || propiedades.isLoading;
  console.log(propiedades.data ?? [])
  useSetPageTitle("Waymark - Encuentra el lugar perfecto para tu próxima aventura");
  return (
    <div className="flex flex-col min-h-screen gap-2">
      <Header isWaiting={isLoading} ubicaciones={ubicaciones.data ?? []} />
      <main className="content">
        <h4 className='w-full text-left mt-[1rem] mb-2'>Alojamientos populares</h4>
        <section className='inline-flex w-full overflow-x-auto overflow-y-hidden overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth scroll-no mb-5'>
          <PropiedadCard propiedad={propiedadesMock[0]} />
          <PropiedadCard propiedad={propiedadesMock[1]} />
          <PropiedadCard propiedad={propiedadesMock[2]} />
          <PropiedadCard propiedad={propiedadesMock[3]} />
          <PropiedadCard propiedad={propiedadesMock[4]} />
          <PropiedadCard propiedad={propiedadesMock[5]} />
          <PropiedadCard propiedad={propiedadesMock[6]} />
          <PropiedadCard propiedad={propiedadesMock[7]} />
          <VerMasCard direccion={"/juan"} />
        </section>
        <h4 className='w-full text-left mt-[1rem] mb-2'>Alojamientos en Emiliano Zapata</h4>
        <section className='inline-flex w-full overflow-x-auto overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth scroll-no mb-5'>
          <PropiedadCard propiedad={propiedadesMock[0]} />
          <PropiedadCard propiedad={propiedadesMock[1]} />
          <PropiedadCard propiedad={propiedadesMock[2]} />
          <PropiedadCard propiedad={propiedadesMock[3]} />
          <PropiedadCard propiedad={propiedadesMock[4]} />
          <PropiedadCard propiedad={propiedadesMock[5]} />
          <PropiedadCard propiedad={propiedadesMock[6]} />
          <PropiedadCard propiedad={propiedadesMock[7]} />
          <VerMasCard direccion={"/marcelo"} />
        </section>
        <h4 className='w-full text-left mt-[1rem] mb-2'>Hospedate en Temixco</h4>
        <section className='inline-flex w-full overflow-x-auto overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth scroll-no mb-5'>
          <PropiedadCard propiedad={propiedadesMock[0]} />
          <PropiedadCard propiedad={propiedadesMock[1]} />
          <PropiedadCard propiedad={propiedadesMock[2]} />
          <PropiedadCard propiedad={propiedadesMock[3]} />
          <PropiedadCard propiedad={propiedadesMock[4]} />
          <PropiedadCard propiedad={propiedadesMock[5]} />
          <PropiedadCard propiedad={propiedadesMock[6]} />
          <PropiedadCard propiedad={propiedadesMock[7]} />
          <VerMasCard direccion={"/beto"} />
        </section>
        <h4 className='w-full text-left mt-[1rem] mb-2'>Descubre alojamientos en Cuernavaca</h4>
        <section className='inline-flex w-full overflow-x-auto overflow-y-hidden gap-[.75rem] md:gap-3 scroll-smooth scroll-no mb-5'>
          <PropiedadCard propiedad={propiedadesMock[0]} />
          <PropiedadCard propiedad={propiedadesMock[1]} />
          <PropiedadCard propiedad={propiedadesMock[2]} />
          <PropiedadCard propiedad={propiedadesMock[3]} />
          <PropiedadCard propiedad={propiedadesMock[4]} />
          <PropiedadCard propiedad={propiedadesMock[5]} />
          <PropiedadCard propiedad={propiedadesMock[6]} />
          <PropiedadCard propiedad={propiedadesMock[7]} />
          <VerMasCard direccion={"/tio_francisco"} />
        </section>
      </main>
      <Footer />
    </div>
  );
}

/**
 * @param {{
 *  direccion: string
 * }} props
 */
const VerMasCard = ({ direccion = "" }) => {
  return (
    <div className='w-[clamp(138px,13.5%,250px)]   shrink-0   relative flex flex-col items-start justify-flex-start' >
      <div className='flex flex-col items-center justify-center shadow-xl rounded-2xl w-full h-50 aspect-ratio: 4/3' >
        <GalleryHorizontal size={48} color='var(--color-secondary-500)' />
        <CustomLink to={direccion}>Mostrar todo</CustomLink>
      </div>
    </div>
  )
}

const Header = ({ isWaiting = false, ubicaciones = [] }) => {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [show, setShow] = useState(false)

  const scrolledRef = useRef(false);
  const manualOverride = useRef(false);
  const buttonRef = useRef(null);

  const [isSmall, setIsSmall] = useState(window.innerWidth <= 745);
  const [showLink, setShowLink] = useState(window.innerWidth >= 1125);
  const [showBrand, setShowBrand] = useState(window.innerWidth >= 950);

  function updateWidth() {
    setIsSmall(window.innerWidth <= 745);
    setShowLink(window.innerWidth >= 1125);
    setShowBrand(window.innerWidth >= 950)
  }

  useEffect(() => {
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [])

  window.addEventListener("resize", () => {
    console.log(window.innerWidth >= 745)
  });

  function setScrolledSync(val) {
    scrolledRef.current = val;
    setScrolled(val);

    if (!val) {
      manualOverride.current = true;
      setTimeout(() => { manualOverride.current = false; }, 500);
    }
  }

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (manualOverride.current) return;  // ← ignorar mientras se expande

    if (!scrolledRef.current && latest > 80) {
      scrolledRef.current = true;
      setScrolled(true);
    }
    if (scrolledRef.current && latest < 40) {
      scrolledRef.current = false;
      setScrolled(false);
    }
  })
  return <motion.header
    className="sticky top-0 z-10 flex flex-col items-center w-full bg-gradient-to-b from-white via-white to-gray-50 to-80% p-[1.25rem] border-b border-border" >
    {isSmall ? <BuscadorBoton isWaiting={isWaiting} /> : <>
      <nav className="max-w-[1450px] w-full flex flex-col md:flex-row items-center md:justify-between justify-center">
        <div className="flex flex-row gap-2 justify-center items-center">
          <img src={"/logo_white.png"} alt="waymark" className='w-[3.25rem]' />
          {
            showBrand &&
            <h6 className='text-primary-500 m-0 rotulo' >WAYMARK</h6>
          }
        </div>
        <DropdownParent classes=" flex flex-row gap-2 justify-center items-center" hideFunction={setShow}>
          {
            showLink &&
            <h6 className='font-bold' >Conviertete en anfitrión</h6>
          }
          <button ref={buttonRef} onClick={() => setShow(!show)} className=' hover:bg-border text-text-secondary  border border-border p-2 rounded-2xl' >
            <Menu />
          </button>
          <CustomDropdown anchorRef={buttonRef} visible={show} align='right' width={"250px"} >
            <p className="text-xs font-bold text-left px-2 font-[cabin] mb-2">Menú</p>
            <div className="w-full bg-border h-[1px]"></div>
            <ul>
              <li className='py-4 px-2 text-left text-nowrap'><CustomLink to="/">Convierte en anfitrión</CustomLink></li>
              <div className="w-full bg-border h-[1px]"></div>
              <li className='py-4 px-2 text-left text-nowrap'><CustomLink to="/" >Buscar a un anfitrión</CustomLink></li>
              <div className="w-full bg-border h-[1px]"></div>
              <li className='py-4 px-2 text-left text-nowrap'><CustomLink to="/login" >Iniciar sesión</CustomLink></li>
            </ul>
          </CustomDropdown>
        </DropdownParent>
      </nav>
      <Buscador locations={ubicaciones} scrolled={scrolled} setScrolled={setScrolledSync} isWaiting={isWaiting} />
    </>}
  </motion.header >
}