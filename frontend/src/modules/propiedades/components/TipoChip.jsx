import React, { useState } from 'react'
import TiposIconos from '../data/TiposIconos'
import { DynamicIcon } from 'lucide-react/dynamic'
import { GitMergeConflictIcon } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TipoChip({ t, currId, onChange }) {
    const active = currId === t.id
    return (
        <motion.div
            onClick={() => onChange()}
            animate={{ borderColor: active ? "var(--color-text-primary)" : "var(--color-border)" }}
            transition={{ type: "spring", stiffness: 300 }}
            whileHover={{
                backgroundColor: "var(--color-gray-100)"
            }}
            autoFocus
            className='
                w-full
                min-w-[225px]
                border-2 cursor-pointer rounded 
                px-2 py-4 
                flex flex-col items-start justify-center
                focus:shadow-inset-sm
            '>
            <DynamicIcon name={TiposIconos[t.tipo]} size={32} />
            <p className={active ? 'font-bold' : ''} >{t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}</p>
        </motion.div>
    )
}
