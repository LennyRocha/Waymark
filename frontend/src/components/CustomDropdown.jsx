/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion';

const CustomDropdown = ({ anchorRef, visible, children, align = "left", width, useParentWidth = false }) => {
    //NOTA: Debe ponerse dentro de un DropdownParent
    const [pos, setPos] = useState({});

    useEffect(() => {
        if (anchorRef.current && visible) {
            const rect = anchorRef.current.getBoundingClientRect();
            const parentRect = anchorRef.current.offsetParent?.getBoundingClientRect() ?? { left: 0, right: 0, width: 0, };

            if (align === "left") {
                setPos({ width: rect.width, left: rect.left - parentRect.left });
            } else if (align === "right") {
                setPos({ width: rect.width, right: parentRect.right - rect.right });
            } else if (align === "center") {
                const anchorCenter = rect.left - parentRect.left + rect.width / 2;
                const dropWidth = width ?? rect.width;
                setPos({ width: rect.width, left: anchorCenter - dropWidth / 2 });
            }
        }
    }, [visible, anchorRef, align, width]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        top: "calc(85% + 12px)",
                        ...pos,  // ← left o right según align
                        width: useParentWidth ? pos.width : width ?? "auto",
                        zIndex: 50,
                    }}
                    className="bg-white shadow-2xl rounded-2xl p-4 border border-border"
                    onMouseDown={(e) => e.preventDefault()}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CustomDropdown;