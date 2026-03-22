import { createContext, useContext, useState } from "react";
import { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [reverseOrder, setReverseOrder] = useState(false);
    const positions = ["top-center", "top-left", "top-right", "bottom-center", "top-right", "bottom-right"];
    const [position, setPosition] = useState(positions[0]);
    return (
        <ToastContext.Provider value={{ setReverseOrder, setPosition, positions }}>
            <Toaster reverseOrder={reverseOrder} position={position} />
            {children}
        </ToastContext.Provider>
    );

}

export const useToast = () => useContext(ToastContext);