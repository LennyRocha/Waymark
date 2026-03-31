import { DatabaseZap } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
    titulo?: string;
    mensaje: string;
};

export default function EmptyListComponent({ titulo, mensaje }: Readonly<Props>) {
  return (
    <motion.div
      className="w-full h-full flex items-center justify-center p-4 flex-col gap-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DatabaseZap
        size={48}
        className="text-text-secondary"
      />
      {titulo && (
        <h5 className="text-text-secondary">{titulo}</h5>
      )}
      <h6 className="text-text-secondary">{mensaje}</h6>
    </motion.div>
  );
}
