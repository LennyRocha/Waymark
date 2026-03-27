import { Link, type LinkProps } from 'react-router-dom';
import type { ReactNode } from 'react';

type CustomLinkProps = LinkProps & {
    children?: ReactNode;
    classN?: string;
};

export default function CustomLink({ children, classN = '', ...props }: CustomLinkProps) {
    return (
        <Link
            {...props}
            className={`${classN} transition duration-300 ease-in-out text-text-secondary hover:underline hover:text-secondary-500`}
        >
            {children}
        </Link>
    );
}
