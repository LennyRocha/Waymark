import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
    useEffect,
    type CSSProperties,
    type MouseEvent as ReactMouseEvent,
    type ReactElement,
    type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type ModalHeaderProps = {
    children?: ReactNode;
};

function ModalHeader({ children }: Readonly<ModalHeaderProps>) {
    return <div className="w-full flex-shrink-0 pb-4 border-b border-gray-100">{children}</div>;
}

function ModalBody({ children }: Readonly<ModalHeaderProps>) {
    return <div className="modal_body w-full overflow-y-auto flex-1 min-h-0 py-4">{children}</div>;
}

function ModalFooter({ children }: Readonly<ModalHeaderProps>) {
    return (
        <div className="w-full flex-shrink-0 pt-4 border-t border-gray-100 flex justify-end gap-2">
            {children}
        </div>
    );
}

type ModalProps = {
    open: boolean;
    children?: ReactNode;
    close?: () => void;
    closeButton?: boolean;
    closeButtonDirection?: 'left' | 'right';
    width?: CSSProperties['width'];
    height?: CSSProperties['height'];
};

type ModalComponent = ((props: Readonly<ModalProps>) => ReactElement | null) & {
    Header: typeof ModalHeader;
    Body: typeof ModalBody;
    Footer: typeof ModalFooter;
};

const Modal: ModalComponent = ({
    open,
    children,
    close = () => {},
    closeButton = true,
    closeButtonDirection = 'left',
    width,
    height,
}) => {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };

        if (open) globalThis.addEventListener('keydown', handleEsc);

        return () => {
            document.body.style.overflow = '';
            globalThis.removeEventListener('keydown', handleEsc);
        };
    }, [open, close]);

    const modal = (
        <AnimatePresence mode="wait">
            {open && (
                <motion.div
                    layout
                    className="fixed inset-0 p-2 m-0 border-none bg-black/25 flex flex-col justify-center items-center z-[9999] "
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={close}
                >
                    <motion.div
                        layout
                        onClick={(e: ReactMouseEvent<HTMLDivElement>) => e.stopPropagation()}
                        className="flex flex-col p-6 bg-white rounded-4xl text-text-primary overflow-hidden gap-2 xl:max-h-[60vh]"
                        style={{
                            width: width ?? 'fit-content',
                            height: height ?? 'auto',
                            maxWidth: '1000px',
                            maxHeight: 'calc(90vh - 1.2rem)',
                            minWidth: 'min(500px, 90vw)',
                        }}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                        {closeButton && (
                            <div
                                className={`w-full flex mb-2 ${
                                    closeButtonDirection === 'left' ? 'justify-start' : 'justify-end'
                                }`}
                            >
                                <button
                                    onClick={close}
                                    aria-label="Cerrar modal"
                                    title="Cerrar modal"
                                    className="p-1 rounded-full hover:bg-gray-100 transition duration-300 ease-out"
                                >
                                    <X />
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col flex-1 min-h-0">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return createPortal(modal, document.body);
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
