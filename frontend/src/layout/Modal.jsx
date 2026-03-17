/* eslint-disable no-unused-vars */
import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useMemo } from "react"
import { createPortal } from "react-dom"

export default function Modal({ open, children, close = () => { }, closeButton = true, closeButtonDirection = "left", width = undefined, height = undefined }) {
    const alignment = useMemo(() => {
        return closeButtonDirection === "left" ? "justify-start" : "justify-end"
    }, [closeButtonDirection])

    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        const handleEsc = (e) => {
            if (e.key === "Escape") close();
        };
        if (open) window.addEventListener("keydown", handleEsc);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleEsc)
        };
    }, [open, close, closeButtonDirection]);
    const modal = (
        <AnimatePresence mode='wait'>
            {open && (
                <motion.div
                    layout
                    className="fixed inset-0 p-2 m-0 border-none bg-black/25 grid place-items-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={close}
                >
                    <motion.div
                        layout
                        onClick={(e) => e.stopPropagation()}
                        className="p-4 bg-white rounded-2xl text-text-primary"
                        style={{
                            width: width ?? "auto",
                            height: height ?? "auto"
                        }}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        {closeButton && (
                            <div
                                className={`w-full flex mb-2 ${closeButtonDirection === "left"
                                    ? "justify-start"
                                    : "justify-end"
                                    }`}
                            >
                                <button
                                    onClick={close}
                                    className="p-1 rounded-full hover:bg-gray-100 transition duration-300 ease-out"
                                >
                                    <X />
                                </button>
                            </div>
                        )}

                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )

    return createPortal(modal, document.body)
}
