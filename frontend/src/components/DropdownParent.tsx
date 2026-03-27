import {
    useEffect,
    useRef,
    type HTMLAttributes,
    type ReactNode,
} from 'react';

type DropdownParentProps = HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode;
    hideFunction?: (visible: boolean) => void;
    classes?: string;
};

export default function DropdownParent({
    children,
    hideFunction = () => {},
    classes,
    ...props
}: DropdownParentProps) {
    const divRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (divRef.current && target && !divRef.current.contains(target)) {
                hideFunction(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [hideFunction]);

    const className = [
        'relative',
        classes,
        props.className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div {...props} className={className} ref={divRef}>
            {children}
        </div>
    );
}
