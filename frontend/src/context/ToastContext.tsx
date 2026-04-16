import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

type ToastPosition =
    | 'top-center'
    | 'top-left'
    | 'top-right'
    | 'bottom-center'
    | 'bottom-left'
    | 'bottom-right';

type ToastContextValue = {
    setReverseOrder: (value: boolean) => void;
    setPosition: (value: ToastPosition) => void;
    positions: ToastPosition[];
};

const TOAST_POSITIONS: ToastPosition[] = [
    'top-center',
    'top-left',
    'top-right',
    'bottom-center',
    'bottom-left',
    'bottom-right',
];

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

type ToastProviderProps = {
    children?: ReactNode;
};

export function ToastProvider({ children }: Readonly<ToastProviderProps>) {
    const [reverseOrder, setReverseOrder] = useState(false);
    const [position, setPosition] = useState<ToastPosition>('top-center');
    const contextValue = useMemo(
        () => ({ setReverseOrder, setPosition, positions: TOAST_POSITIONS }),
        [setReverseOrder, setPosition],
    );

    return (
        <ToastContext.Provider value={contextValue}>
            <Toaster reverseOrder={reverseOrder} position={position} />
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
