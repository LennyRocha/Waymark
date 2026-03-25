import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type ItemProps = {
  title: string;
  content: React.ReactElement;
  isOpen: boolean;
  onClick: () => void;
  index: number;
  size: number;
};

interface Item {
  title: string;
  content: React.ReactElement;
}

type Props = {
  items: Item[];
};
const MotionChevron = motion.create(ChevronDown);

export default function Accordion({ items }: Props) {
  const [openIndex, setOpenIndex] = React.useState<
    number | null
  >(null);

  const handleClick = (index: number | null) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-w-[250px] shadow-sm rounded-xl w-full">
      {items.map((item, idx) => (
        <AccoridonItem
          key={idx}
          title={item.title}
          isOpen={openIndex === idx}
          content={item.content}
          onClick={() => handleClick(idx)}
          index={idx}
          size={items.length}
        />
      ))}
    </div>
  );
}

export const AccoridonItem = ({
  title,
  content,
  isOpen,
  onClick,
  index,
  size,
}: ItemProps) => {
  return (
    <motion.div layout className="w-full px-4">
      <button
        className="flex items-center justify-between w-full py-4 font-bold font-[cabin]"
        onClick={onClick}
      >
        {title}
        <MotionChevron
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: {
                height: "auto",
                opacity: 1,
              },
              collapsed: {
                height: 0,
                opacity: 0,
              },
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
            className="overflow-hidden"
          >
            <motion.div
              layout
              className="py-4"
              initial={{ y: 4 }}
              animate={{ y: 0 }}
              exit={{ y: 4 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {index + 1 !== size && (
        <div className="w-full border-b-1 border-border"></div>
      )}
    </motion.div>
  );
};
