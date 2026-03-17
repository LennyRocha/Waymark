/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react'
import PropiedadCard from './components/PropiedadCard';
import { motion } from 'framer-motion';
import { GalleryHorizontal } from 'lucide-react';
import { useScroll, useMotionValueEvent } from "framer-motion"
import { Menu } from 'lucide-react';
import CustomLink from '../../components/CustomLink';
import Buscador from './components/Buscador';
import CustomDropdown from '../../components/CustomDropdown';
import DropdownParent from '../../components/DropdownParent';
import BuscadorBoton from './components/BuscadorBoton'

export default function Landing() {
  let size = 0;

  window.addEventListener("resize", (e) => {
    size = window.innerWidth;
    // console.log(size);
    // console.log("resize ", document.getElementById("root").clientWidth);
  });

  return (
    <div className="flex flex-col min-h-screen gap-2">
      <Header />
      <main className="content">
        <h5 className='w-full text-left mt-[1rem] mb-2'>Encabezado h5</h5>
        <section className='inline-flex w-full overflow-x-auto gap-4 scroll-smooth scroll-no mb-5'>
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <VerMasCard direccion={"/juan"} />
        </section>
        <h5 className='w-full text-left mt-[1rem] mb-2'>Encabezado h5</h5>
        <section className='inline-flex w-full overflow-x-auto gap-4 scroll-smooth scroll-no mb-5'>
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <VerMasCard direccion={"/marcelo"} />
        </section>
        <h5 className='w-full text-left mt-[1rem] mb-2'>Encabezado h5</h5>
        <section className='inline-flex w-full overflow-x-auto gap-4 scroll-smooth scroll-no mb-5'>
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <VerMasCard direccion={"/beto"} />
        </section>
        <h5 className='w-full text-left mt-[1rem] mb-2'>Encabezado h5</h5>
        <section className='inline-flex w-full overflow-x-auto gap-4 scroll-smooth scroll-no mb-5'>
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <PropiedadCard />
          <VerMasCard direccion={"/tio_francisco"} />
        </section>
      </main>
      <footer className='w-full bg-border p-8 text-text-secondary'>2026</footer>
    </div>
  );
}

const VerMasCard = ({ direccion }) => {
  return (
    <div className=' w-[clamp(200px,25%,12rem)]  shrink-0   relative flex flex-col items-start justify-flex-start' >
      <div className='flex flex-col items-center justify-center shadow-xl rounded-2xl w-full h-50 aspect-ratio: 4/3' >
        <GalleryHorizontal size={48} color='var(--color-secondary-500)' />
        <CustomLink to={direccion}>Mostrar todo</CustomLink>
      </div>
    </div>
  )
}

const Header = () => {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [show, setShow] = useState(false)

  const scrolledRef = useRef(false);
  const manualOverride = useRef(false);
  const buttonRef = useRef(null);

  const [isSmall, setIsSmall] = useState(false);

  window.addEventListener("resize", () => {
    setIsSmall(window.innerWidth >= 745);
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
    {!isSmall ? <>
      <nav className="max-w-[1200px] w-full flex flex-col md:flex-row items-center md:justify-between justify-center">
        <div className="flex flex-row gap-2 justify-center items-center">
          <img src={"/logo_white.png"} alt="waymark" className='w-[3.25rem]' />
          <h6 className='text-primary-500 m-0 rotulo' >WAYMARK</h6>
        </div>
        <DropdownParent classes=" flex flex-row gap-2 justify-center items-center" hideFunction={setShow}>
          <h6 className='font-bold' >Conviertete en anfitrión</h6>
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
      <Buscador scrolled={scrolled} setScrolled={setScrolledSync} />
    </> : <BuscadorBoton />}
  </motion.header >
}