import React, { useState, useRef } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import DropdownParent from '../../../components/DropdownParent'
import CustomDropdown from '../../../components/CustomDropdown';

export default function BuscadorBoton() {
    const [vis, setVis] = useState(false);
    const buttonReff = useRef(null)
    return (
        <DropdownParent hideFunction={setVis} classes={"w-full"} >
            <motion.button
                onClick={() => setVis(true)}
                layout
                whileHover={{
                    boxShadow: "0px 4px 10px rgba(0,0,0, 0.5)",
                }}
                ref={buttonReff}
                whileTap={{
                    scale: .8,
                    borderColor: "#222222",
                    borderWidth: 2
                }}
                className='w-full mx-auto transition delay-150 duration-300 ease-in-out flex flex-row gap-1 rounded-full bg-white shadow-xl  p-4 items-center justify-center' >
                <Search className='' size={24} />
                <p className="font-bold">Comienza a explorar</p>
            </motion.button>
            <CustomDropdown visible={vis} anchorRef={buttonReff} useParentWidth  >
                <div className="si">
                    <p>Contenido</p>
                </div>
            </CustomDropdown>
        </DropdownParent>
    )
}
