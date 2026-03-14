import React from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BuscadorBoton() {
    return (
        <motion.button
            layout
            whileHover={{
                boxShadow: "0px 4px 10px rgba(0,0,0, 0.5)",
            }}
            whileTap={{
                scale: .8
            }}
            className='transition delay-150 duration-300 ease-in-out flex flex-row gap-1 rounded-full bg-white shadow-xl  px-4 py-2 items-center justify.center' >
            <lablel className="font-bold">Destino</lablel>
            <span className="text-gray-400">|</span>
            <lablel className="font-bold">Fechas</lablel>
            <span className="text-gray-400">|</span>
            <lablel className="font-bold">¿Cuántos?</lablel>
            <Search className='p-2 bg-primary-500 rounded-full text-white' size={32} />
        </motion.button>
    )
}
