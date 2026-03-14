import React, { useState, useRef, useEffect } from 'react'
import PropiedadCard from './components/PropiedadCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useScroll, useMotionValueEvent } from "framer-motion"
import { useNavigate } from "react-router-dom";
import { Menu } from 'lucide-react';

const Buscador = ({ scrolled, setScrolled }) => {
  const [focus, setFocus] = useState(false);
  const [inputIdx, setInputIdx] = useState(0);
  const navigate = useNavigate();

  const [popover1, setPopover1] = useState(null);
  const [popover2, setPopover2] = useState(null);
  const [popover3, setPopover3] = useState(null);

  useEffect(() => {
    window.onload = () => {
      setPopover1(document.getElementById("pop_destinos"));
      setPopover2(document.getElementById("pop_fechas"));
      setPopover3(document.getElementById("pop_cuantos"));
    }
  }, [])

  useEffect(() => {
    if (popover1) {
      switch (inputIdx) {
        case 1:
          popover1.showPopover();
          popover2.hidePopover();
          popover3.hidePopover();
          break;

        case 2:
          popover2.showPopover();
          popover1.hidePopover();
          popover3.hidePopover();
          break;

        case 3:
          popover3.showPopover();
          popover2.hidePopover();
          popover1.hidePopover();
          break;

        default:
          popover2.hidePopover();
          popover3.hidePopover();
          popover1.hidePopover();
          break;
      }
    } else {
      console.log(popover1, popover2, popover3);
    }
  }, [inputIdx, popover1, popover2, popover3]);

  useEffect(() => {
    if (scrolled && focus) {
      setFocus(false);
    }
  }, [scrolled, focus]);

  return (
    <motion.nav
      layout
      animate={{
        maxWidth: scrolled ? 450 : 800,
        marginTop: scrolled ? -50 : 0,
        paddingTop: scrolled ? 4 : 2,
        paddingBottom: scrolled ? 4 : 2
      }}
      whileHover={{
        boxShadow: scrolled ? "0px 0px 12px rgba(0,0,0, 0.5)" : null,
        transition: "0.25s ease-in"
      }}
      style={{
        cursor: "pointer"
      }}
      className={`w-full max-w-[850px] mx-auto shadow-lg inset-shadow-2xs rounded-full flex items-center  justify-center gap-1 px-[2px] ${inputIdx !== 0 ? "bg-border" : "bg-white"}`}
      onClick={() => scrolled ? setScrolled(!scrolled) : null}>

      <motion.div
        layout
        animate={{
          alignItems: scrolled ? "center" : "start",
        }}
        id='destinos_div'
        className={`w-auto transition delay-150 duration-300 ease ${(!scrolled && inputIdx !== 1) && "hover:bg-border"} 
        ${inputIdx === 1 ? "bg-white" : "bg-transparent"} rounded-full  px-6 py-2  h-full shrink-0 flex flex-col  justify-center flex-1`}>
        <label className={`font-bold ${!scrolled && "text-xs"} text-left`} htmlFor="destinos">Destino</label>
        <motion.input
          animate={{
            opacity: scrolled ? 0 : 1,
            width: scrolled ? 0 : "auto",
            height: scrolled ? 0 : "auto"
          }}
          transition={{ duration: 0.2 }}
          id='destinos'
          className="outline-none"
          placeholder="Buscar destinos"
          onFocus={() => {
            setFocus(true)
            setInputIdx(1)
          }}
          onBlur={() => {
            setFocus(false)
            setInputIdx(0)
          }}
        />
        <div id="pop_destinos" className='bg-green-500 text-primary-500 rounded-xl p-8' popover=''>Popover content</div>
      </motion.div>

      <div className="h-6 w-px bg-gray-200" />

      <motion.div
        layout
        animate={{
          alignItems: scrolled ? "center" : "start"
        }}
        className={`w-auto transition delay-150 duration-300 ease ${(!scrolled && inputIdx !== 2) && "hover:bg-border"}  
        ${inputIdx === 2 ? "bg-white" : "bg-transparent"} rounded-full  px-6 py-2  h-full shrink-0 flex flex-col  justify-center flex-1`}>
        <label className={`font-bold ${!scrolled && "text-xs"} text-left`} htmlFor="fechas">Fechas</label>
        <motion.input
          animate={{
            opacity: scrolled ? 0 : 1,
            width: scrolled ? 0 : "auto",
            height: scrolled ? 0 : "auto"
          }}
          transition={{ duration: 0.2 }}
          id='fechas'
          className="outline-none"
          placeholder="Agregar fechas"
          onFocus={() => {
            setFocus(true)
            setInputIdx(2)
          }}
          onBlur={() => {
            setFocus(false)
            setInputIdx(0)
          }}
        />
        <div id="pop_fechas" className='bg-green-500 text-primary-500 rounded-xl p-8' popover=''>Popover content</div>
      </motion.div>

      <div className="h-6 w-px bg-gray-200" />


      <motion.div
        layout
        animate={{
          flexGrow: scrolled ? 2 : 1,
        }}
        id='huespedes_div'
        className={`w-auto  transition delay-150 duration-300 ease ${(!scrolled && inputIdx !== 3) && "hover:bg-border"}  relative rounded-full px-6 py-2 h-full shrink-0 flex flex-col justify-center items-start ${inputIdx === 3 ? "bg-white" : "bg-transparent"}`}
      >
        <label className={`font-bold ${!scrolled && "text-xs"} text-left`} htmlFor="huespedes">Huéspedes</label>
        <motion.input
          animate={{
            opacity: scrolled ? 0 : 1,
            width: scrolled ? 0 : "auto",
            height: scrolled ? 0 : "auto"
          }}
          transition={{ duration: 0.2 }}
          id='huespedes'
          className="outline-none"
          placeholder="¿Cuántos?"
          onFocus={() => {
            setFocus(true)
            setInputIdx(3)
          }}
          onBlur={() => {
            setFocus(false)
            setInputIdx(0)
          }}
        />
        <div id="pop_cuantos" className='bg-green-500 text-primary-500 rounded-xl p-8' popover=''>Popover content</div>
        <motion.button
          className="absolute right-2 flex items-center justify-center gap-2 text-white rounded-full overflow-hidden outline-none h-auto"
          animate={{
            width: focus ? 120 : 50,
            background: focus
              ? "linear-gradient(to right, var(--color-primary-500), var(--color-secondary-500))"
              : "var(--color-primary-500)",
            padding: scrolled ? "2px" : "12px"
          }}
          disabled={scrolled}
          transition={{ duration: 0.4 }}
        >
          <Search className="mr-1" />
          {focus && "Buscar"}
        </motion.button>
      </motion.div>

    </motion.nav>
  )
}

const Header = () => {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)

  const scrolledRef = useRef(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    console.log(latest)
    if (!scrolledRef.current && latest > 80) {
      scrolledRef.current = true
      setScrolled(true)
    }

    if (scrolledRef.current && latest < 40) {
      scrolledRef.current = false
      setScrolled(false)
    }
  })
  return <motion.header
    className="sticky top-0 z-10 flex flex-col items-center w-full bg-gradient-to-b from-white via-white to-gray-50 to-80% p-[1.25rem] border-b border-border" >
    <nav className="max-w-[1200px] w-full flex flex-col md:flex-row items-center md:justify-between justify-center">
      <div className="flex flex-row gap-2 justify-center items-center">
        <img src={"/logo_white.png"} alt="waymark" className='w-[3.25rem]' />
        <h6 className='text-primary-500 m-0 rotulo' >WAYMARK</h6>
      </div>
      <div className="flex flex-row gap-2 justify-center items-center">
        <h6 className='font-bold' >Conviertete en anfitrión</h6>
        <button className='hover:bg-border text-text-secondary  border border-border p-2 rounded-2xl' >
          <Menu />
        </button>
      </div>
    </nav>
    <Buscador scrolled={scrolled} setScrolled={setScrolled} />
  </motion.header >
}

export default function Landing() {
  let size = 0;

  window.addEventListener("resize", () => {
    size = window.innerWidth;
    console.log(size);
    console.log("resize ", document.getElementById("root").clientWidth);
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
          <div className=' w-[12rem] shrink-0   relative flex flex-col items-start justify-flex-start' >
            <div className='flex flex-col items-center justify-center shadow-xl rounded-2xl w-full h-50 aspect-ratio: 4/3' ><h5>Mostrar todo</h5></div>
          </div>
        </section>
        <button id='pop_test' popoverTarget="mypopover">Toggle the popover</button>
        <div id="mypopover" popover=''>Popover content</div>
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
          <PropiedadCard />
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
          <PropiedadCard />
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
          <PropiedadCard />
        </section>
      </main>
      <footer className='w-full bg-border p-8 text-text-secondary'>2026</footer>
    </div>
  );
}
