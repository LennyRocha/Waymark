import { Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion, Variants } from "framer-motion";

import UserLinkProps from "../types/UserLinkProps";
import useScrollDirection from "../hooks/useScrollDirection";

type Props = {
  links: UserLinkProps[];
};

export default function UserTabs({
  links = [],
}: Readonly<Props>) {
  const direction = useScrollDirection();

  const variants: Variants = {
    visible: {
      y: 0,
      transition: {
        duration: 0.25,
        ease: "easeOut",
      },
    },
    hidden: {
      y: "100%",
      transition: {
        duration: 0.25,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      animate={direction === "down" ? "hidden" : "visible"}
      className="fixed bottom-0 left-0 md:hidden
        flex items-center justify-center gap-[.45rem]
        p-2 bg-white w-[100dvw]
        shadow-lg"
    >
      {links.map((link) => {
        return (
          <NavLink
            key={link.label}
            to={link.to}
            className={({ isActive }) =>
              `text-[10px] flex flex-col gap-1 items-center justify-center min-w-[60px]
              ${
                isActive
                  ? "text-primary-500"
                  : "text-text-secondary"
              }`
            }
          >
            {link.icon || (
              <Search size={24} strokeWidth={1.5} />
            )}
            {link.label}
          </NavLink>
        );
      })}
    </motion.div>
  );
}
