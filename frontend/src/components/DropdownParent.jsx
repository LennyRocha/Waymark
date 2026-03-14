import React from 'react'

export default function DropdownParent({ children, hideFunction = () => {}, classes, ...props }) {
    const divRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (divRef.current && !divRef.current.contains(e.target)) {
                hideFunction(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [hideFunction]);
    return (
        <div {...props} className={`relative ${classes}`} ref={divRef} >{children}</div>
    )
}
