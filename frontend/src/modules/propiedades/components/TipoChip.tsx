import { DynamicIcon } from 'lucide-react/dynamic';
import { motion } from 'framer-motion';
import TiposIconos from '../data/TiposIconos';

type TipoChipProps = {
    t: {
        id: number;
        tipo: string;
    };
    currId: number;
    onChange: () => void;
};

export default function TipoChip({ t, currId, onChange }: Readonly<TipoChipProps>) {
    const active = currId === t.id;
    const iconName = ((TiposIconos as Record<string, string>)[t.tipo] ?? 'circle') as React.ComponentProps<
        typeof DynamicIcon
    >['name'];

    return (
        <motion.div
            onClick={onChange}
            animate={{ borderColor: active ? 'var(--color-text-primary)' : 'var(--color-border)' }}
            transition={{ type: 'spring', stiffness: 300 }}
            whileHover={{
                backgroundColor: 'var(--color-gray-100)',
            }}
            autoFocus
            className="
                w-full
                min-w-[225px]
                border-2 cursor-pointer rounded
                px-2 py-4
                flex flex-col items-start justify-center
                focus:shadow-inset-sm
            "
        >
            <DynamicIcon name={iconName} size={32} />
            <p className={active ? 'font-bold' : ''}>{t.tipo.charAt(0).toUpperCase() + t.tipo.slice(1)}</p>
        </motion.div>
    );
}
