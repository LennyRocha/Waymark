import {
  useLayoutEffect,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type DropdownAlign = "left" | "right" | "center";

type DropdownPosition = {
  width?: number;
  left?: number;
  right?: number;
};

type CustomDropdownProps = {
  anchorRef: RefObject<HTMLElement | null>;
  visible: boolean;
  children?: ReactNode;
  align?: DropdownAlign;
  width?: number | string;
  useParentWidth?: boolean;
  layoutId: string;
  layoutTranstionDuration?: number;
};

const CustomDropdown = ({
  anchorRef,
  visible,
  children,
  align = "left",
  width,
  layoutId = "dropdown",
  useParentWidth = false,
  layoutTranstionDuration = 0.35,
}: CustomDropdownProps) => {
  // Debe ponerse dentro de un DropdownParent.
  const [pos, setPos] = useState<DropdownPosition>({});

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!anchorRef.current || !visible) return;

      const rect =
        anchorRef.current.getBoundingClientRect();

      const parentRect =
        anchorRef.current.offsetParent?.getBoundingClientRect() ?? {
          left: 0,
          right: 0,
          width: 0,
        };

      if (align === "left") {
        setPos({
          width: rect.width,
          left: rect.left - parentRect.left,
        });
      }

      if (align === "right") {
        setPos({
          width: rect.width,
          right: parentRect.right - rect.right,
        });
      }

      if (align === "center") {
        const anchorCenter =
          rect.left - parentRect.left + rect.width / 2;

        const dropWidth =
          typeof width === "number" ? width : rect.width;

        setPos({
          width: rect.width,
          left: anchorCenter - dropWidth / 2,
        });
      }
    };

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [visible, anchorRef, align, width]);
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          layout="position"
          layoutId={layoutId}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{
            duration: 0.18,
            ease: "easeOut",
            layout: {
              duration: layoutTranstionDuration,
              ease: "easeInOut",
            },
          }}
          style={{
            position: "absolute",
            top: "calc(85% + 12px)",
            ...pos,
            width: useParentWidth
              ? pos.width
              : (width ?? "auto"),
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
