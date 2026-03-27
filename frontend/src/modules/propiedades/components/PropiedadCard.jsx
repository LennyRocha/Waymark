import React from 'react'
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from "react-router-dom";

const MotionHeart = motion.create(Heart);

/** @typedef {import("../types/Propiedad").default} Propiedad */

/** @param {{propiedad: Propiedad}} props */
export default function PropiedadCard({ propiedad }) {
    if(propiedad) console.log(propiedad)
    const [active, setActive] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const goToPropiedad = () => {
        navigate("/rooms/24-tequesquitengo", { state: { from: location.pathname } });
    };
    return (
        <div className=' w-[clamp(200px,25%,12rem)] shrink-0   relative flex flex-col items-start justify-center' >
            <img src="https://a0.muscache.com/im/pictures/225729b8-a72d-4048-89a3-92000e80086a.jpg?im_w=960" alt="si" className='rounded-2xl w-full h-50 aspect-ratio: 4/3'
                title='Hotel en Tequesquitengo' onClick={() => goToPropiedad()} draggable="false" />
            <button onClick={() => setActive(!active)} className='absolute top-[1rem] right-[1rem]'>
                <MotionHeart
                    style={{ color: active ? "var(--primario)" : "#fff" }}
                    fill={active ? "currentColor" : "none"}
                    strokeWidth={active ? 0 : 2}
                    size={32}
                    animate={{ scale: active ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    whileHover={{
                        scale: 1.1
                    }}
                />
            </button>
            <span className='absolute top-[1rem] left-[1rem] text-left rounded-xl bg-gray-100/75 px-2 py-1 font-bold w-[7rem] text-[12px]' >Favorito entre
                <br />huéspedes</span>
            <h6 className='' >Hotel en Tequestitengo</h6>
            <p className='text-text-secondary' >16-25 de mar</p>
            <p className='text-text-secondary' >$ 15,000 MXN por noche</p>
            <p className='text-text-secondary  flex items-center gap-1 ' ><Star fill='currentColor' size={12} className='float-left' />4.33</p>
        </div>
    )
}
