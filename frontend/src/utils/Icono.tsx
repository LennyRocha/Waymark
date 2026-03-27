import { DynamicIcon } from 'lucide-react/dynamic';

type IconoProps = React.ComponentProps<typeof DynamicIcon>;

export default function Icono(props: Readonly<IconoProps>) {
    return <DynamicIcon {...props} />;
}
