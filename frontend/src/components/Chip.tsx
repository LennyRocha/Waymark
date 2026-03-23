import {
  DynamicIcon,
  IconName,
} from "lucide-react/dynamic";
import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  onClick: () => void;
  onDelete?: () => void;
  selected: boolean;
  label: string;
  icon: IconName;
};

const MotionIcon = motion.create(DynamicIcon);

//Terminar después
export default function Chip({
  onClick,
  onDelete,
  selected,
  label,
  icon,
}: Props) {
  return (
    <motion.div
      animate={{
        borderWidth: selected ? 2 : 1,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      whileHover={{
        scale: 1.025,
      }}
      className="flex items-center gap-2 p-2 rounded-xl border-1 border-black w-fit cursor-pointer shrink-0"
      onClick={onClick}
    >
      <MotionIcon
        name={icon ? icon : "circle-question-mark"}
        size={32}
        strokeWidth={selected ? 2 : 1}
        color="var(--color-text-primary)"
      />
      <motion.small
        className={
          selected
            ? "font-bold font-[montserrat]"
            : "font-[montserrat]"
        }
      >
        {label}
      </motion.small>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Delete ${label}`}
        >
          <X
            color="var(--color-text-primary)"
            className="hover:bg-gray-200 rounded p-1"
            onClick={onDelete}
            size={20}
          />
        </button>
      )}
    </motion.div>
  );
}
