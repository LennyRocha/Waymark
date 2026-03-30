import React from 'react'
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from "react-router-dom";

const MotionHeart = motion.create(Heart);

/** @typedef {import("../types/Propiedad").default} Propiedad */

/** @param {{propiedad: Propiedad}} props */
export default function PropiedadCard({ propiedad }) {
    if (propiedad) console.log(propiedad)
    const [active, setActive] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const goToPropiedad = () => {
        navigate("/rooms/24-tequesquitengo", { state: { from: location.pathname } });
    };
    return (
        <div className=' w-[clamp(138px,13.5%,250px)] shrink-0   relative flex flex-col items-start justify-center gap-2' >
            <div role='button' onClick={() => goToPropiedad()}>
                <img src="https://a0.muscache.com/im/pictures/225729b8-a72d-4048-89a3-92000e80086a.jpg?im_w=960" alt="si" className='rounded-3xl w-full h-auto max-h-[238px] min-h-[138px] aspect-square object-cover object-center'
                    title='Hotel en Tequesquitengo' draggable="false" />
            </div>
            <div className='absolute top-[.75rem] right-[1rem] left-[.75rem]  flex items-center justify-between gap-2'>
                <span className='md:max-w-[75%] h-auto md:text-wrap text-left rounded-xl bg-gray-100/80 px-2 py-1 font-bold w-[7rem] text-[12px] truncate' >Favorito entre huéspedes {" "}
                    <span className='md:hidden'><br />entre...</span></span>
                <button onClick={() => setActive(!active)}>
                    <MotionHeart
                        className="w-6 h-6  lg:w-7 lg:h-7"
                        style={{ color: active ? "var(--primario)" : "#fff" }}
                        fill={active ? "currentColor" : "none"}
                        strokeWidth={active ? 0 : 2}
                        animate={{ scale: active ? 1.2 : 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        whileHover={{ scale: 1.1 }}
                    />
                </button>
            </div>
            <div className='flex flex-col items-start justify-start gap-[2px]'>

                {/* Título */}
                <small className='text-wrap text-text-primary text-[14px] leading-[18px] text-left truncate w-full font-medium font-[cabin]'>
                    Hotel en Tequestitengo
                </small>

                {/* Precio */}
                <small className='text-wrap text-text-secondary text-[14px] leading-[18px] truncate w-full  text-left'>
                    $ 15,000 MXN por noche
                </small>

                {/* Rating */}
                <small className='text-wrap text-text-secondary flex items-center gap-[2px] text-[12px] leading-[16px]'>
                    <Star
                        fill='currentColor'
                        size={12}
                        className='shrink-0'
                    />
                    4.33
                </small>
            </div>
        </div>
    )
}
