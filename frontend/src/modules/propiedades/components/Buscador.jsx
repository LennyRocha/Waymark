/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import CustomDropdown from '../../../components/CustomDropdown';
import DropdownParent from '../../../components/DropdownParent';

const MenuDestino = ({ anchorRef, visible }) => (
    <CustomDropdown anchorRef={anchorRef} visible={visible} useParentWidth>
        <p className="text-xs font-bold text-text-secondary uppercase mb-2">Destino</p>
        <input
            autoFocus
            className="w-full border border-border rounded-xl px-3 py-2 outline-none text-sm"
            placeholder="Ciudad, región, país…"
        />
    </CustomDropdown>
);

const MenuFechas = ({ anchorRef, visible }) => (
    <CustomDropdown anchorRef={anchorRef} visible={visible} useParentWidth>
        <p className="text-xs font-bold text-text-secondary uppercase mb-2">Fechas</p>
        <p className="text-sm text-text-secondary">Aquí va el calendario</p>
    </CustomDropdown>
);

const OPCIONES_HUESPEDES = ["1 huésped", "2 huéspedes", "3 huéspedes", "4 huéspedes", "5+ huéspedes"];

const MenuHuespedes = ({ anchorRef, visible, onSelect }) => (
    <CustomDropdown anchorRef={anchorRef} visible={visible} useParentWidth>
        <p className="text-xs font-bold text-text-secondary uppercase mb-2">Huéspedes</p>
        <ul className="flex flex-col gap-1">
            {OPCIONES_HUESPEDES.map((op) => (
                <li key={op}>
                    <button
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-border text-sm transition"
                        onClick={() => onSelect(op)}
                    >
                        {op}
                    </button>
                </li>
            ))}
        </ul>
    </CustomDropdown>
);

const Buscador = ({ scrolled, setScrolled }) => {
    const [focus, setFocus] = useState(false);
    const [inputIdx, setInputIdx] = useState(0);
    const navigate = useNavigate();
    const [huespedes, setHuespedes] = useState("");

    const input1Ref = useRef(null)
    const input2Ref = useRef(null)
    const input3Ref = useRef(null)

    // wrapper con position:relative — los dropdowns se posicionan respecto a él
    const wrapperRef = useRef(null);

    const open = (idx) => { setInputIdx(idx); setFocus(true); };
    const close = () => { setInputIdx(0); setFocus(false); };

    // 1. useEffect para click externo — agrégalo junto a los otros useEffects
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                close();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (scrolled && focus) close();
    }, [scrolled, focus]);

    return (
        <DropdownParent classes='w-full' onClick={() => scrolled ? setScrolled(false) : null} hideFunction={close} >
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
            >

                <motion.div
                    layout
                    animate={{
                        alignItems: scrolled ? "center" : "start",
                    }}
                    id='destinos_div'
                    ref={input1Ref}
                    onClick={(e) => { e.stopPropagation(); if (!scrolled) open(1); }}
                    className={`w-auto transition delay-150 duration-300 ease ${(!scrolled && inputIdx !== 1) && "hover:bg-border"} 
        ${inputIdx === 1 ? "bg-white" : "bg-transparent"} rounded-full  px-6 py-2  h-full flex flex-col  justify-center flex-1`}>
                    <label className={`font-bold ${!scrolled && "text-xs"} text-left`} htmlFor="destinos">Destino</label>
                    <motion.input
                        animate={{
                            opacity: scrolled ? 0 : 1,
                            width: scrolled ? 0 : "auto",
                            height: scrolled ? 0 : "auto"
                        }}
                        tabIndex={1}
                        transition={{ duration: 0.2 }}
                        id='destinos'
                        className="outline-none"
                        placeholder="Buscar destinos"
                        onFocus={(e) => { e.stopPropagation(); if (!scrolled) open(1); }}
                        onBlur={close}
                        disabled={scrolled}
                    />
                </motion.div>

                <div className="h-6 w-px bg-gray-200" />

                <motion.div
                    layout
                    animate={{
                        alignItems: scrolled ? "center" : "start"
                    }}
                    ref={input2Ref}
                    className={`w-auto transition delay-150 duration-300 ease ${(!scrolled && inputIdx !== 2) && "hover:bg-border"}  
        ${inputIdx === 2 ? "bg-white" : "bg-transparent"} rounded-full  px-6 py-2  h-full flex flex-col  justify-center flex-1`}
                    onClick={(e) => { e.stopPropagation(); if (!scrolled) open(2); }}>
                    <label className={`font-bold ${!scrolled && "text-xs"} text-left`} htmlFor="fechas">Fechas</label>
                    <motion.input
                        animate={{
                            opacity: scrolled ? 0 : 1,
                            width: scrolled ? 0 : "auto",
                            height: scrolled ? 0 : "auto"
                        }}
                        tabIndex={2}
                        transition={{ duration: 0.2 }}
                        id='fechas'
                        className="outline-none"
                        placeholder="Agregar fechas"
                        onFocus={(e) => { e.stopPropagation(); if (!scrolled) open(2); }}
                        onBlur={close}
                        disabled={scrolled}
                    />
                </motion.div>

                <div className="h-6 w-px bg-gray-200" />


                <motion.div
                    layout
                    animate={{
                        flexGrow: scrolled ? 2 : 1,
                    }}
                    ref={input3Ref}
                    id='huespedes_div'
                    className={`w-auto  transition delay-150 duration-300 ease ${(!scrolled && inputIdx !== 3) && "hover:bg-border"}  relative rounded-full px-6 py-2 h-full flex flex-col justify-center items-start ${inputIdx === 3 ? "bg-white" : "bg-transparent"}`}
                    onClick={(e) => { e.stopPropagation(); if (!scrolled) open(3); }}
                >
                    <label className={`font-bold ${!scrolled && "text-xs"} text-left`} htmlFor="huespedes">Huéspedes</label>
                    <motion.input
                        animate={{
                            opacity: scrolled ? 0 : 1,
                            width: scrolled ? 0 : "auto",
                            height: scrolled ? 0 : "auto"
                        }}
                        tabIndex={3}
                        transition={{ duration: 0.2 }}
                        id='huespedes'
                        className="outline-none"
                        placeholder="¿Cuántos?"
                        onFocus={(e) => { e.stopPropagation(); if (!scrolled) open(3); }}
                        onBlur={close}
                        disabled={scrolled}
                    />
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
                        onClick={() =>navigate("/s/guadalajara/homes")}
                    >
                        <Search className="mr-1" />
                        {focus && "Buscar"}
                    </motion.button>
                </motion.div>

            </motion.nav>
            {!scrolled && (
                <>
                    <MenuDestino anchorRef={input1Ref} visible={inputIdx === 1} />
                    <MenuFechas anchorRef={input2Ref} visible={inputIdx === 2} />
                    <MenuHuespedes
                        anchorRef={input3Ref}
                        visible={inputIdx === 3}
                        onSelect={(op) => { setHuespedes(op); close(); }}
                    />
                </>
            )}
        </DropdownParent>
    )
}

export default Buscador;