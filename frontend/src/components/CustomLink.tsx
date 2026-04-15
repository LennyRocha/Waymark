import { Link, type LinkProps } from "react-router-dom";
import type { ReactNode } from "react";

type CustomLinkProps = LinkProps & {
  children?: ReactNode;
  classN?: string;
  disabled: boolean;
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
  ) => void;
};

export default function CustomLink({
  children,
  disabled = false,
  classN = "",
  onClick,
  ...props
}: CustomLinkProps) {
  return (
    <Link
      {...props}
      className={`${classN} flex gap-2 transition duration-300 ease-in-out ${disabled ? "text-primary-800 pointer-events-none" : "text-text-secondary"} hover:underline hover:text-secondary-500`}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        }
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
