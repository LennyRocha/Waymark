import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';

type AdminLink = {
    name: string;
    text: string;
    to: string;
};

const links: AdminLink[] = [
    { name: 'inicio', text: 'Inicio', to: '/admin/dashboard' },
    { name: 'users', text: 'Usuarios', to: '/admin/users' },
    { name: 'documents', text: 'Documentos', to: '/admin/documents' },
    { name: 'currencys', text: 'Divisas', to: '/admin/currencys' },
    { name: 'listings', text: 'Alojamientos', to: '/admin/listings' },
    { name: 'calendar', text: 'Calendario', to: '/admin/calendar' },
];

export default function AdminHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(true);
    const firstRender = useRef(true);

    const updateWidth = () => {
        if (globalThis.innerWidth >= 1024) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (globalThis.innerWidth < 1024) setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        globalThis.addEventListener('resize', updateWidth);
        return () => globalThis.removeEventListener('resize', updateWidth);
    }, []);

    return (
        <div>
            <header className="w-full">
                <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
                    <div className="flex flex-wrap justify-center md:justify-between items-center mx-auto max-w-screen-xl gap-2">
                        <Link to="/" className="flex items-center">
                            <img src="/logo_white.png" className="mr-3 h-6 sm:h-10" alt="WAYMARK" />
                            <span className="self-center text-xl font-semibold whitespace-nowrap rotulo text-primary-500">
                                WAYMARK
                            </span>
                        </Link>
                        <div className="flex items-center lg:order-2">
                            <button
                                type="button"
                                className="hidden md:flex text-sm bg-gray-800 rounded-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                                onClick={() => navigate('/admin/profile')}
                                title="Ir a perfil"
                                aria-label="Ir a perfil"
                            >
                                <img
                                    className="w-8 h-8 rounded-full"
                                    src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                                    alt="Perfil de usuario"
                                />
                            </button>
                            <button
                                onClick={() => setOpen(!open)}
                                type="button"
                                className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                                title="Abrir menú"
                                aria-label="Abrir menú"
                            >
                                <span className="sr-only">Open main menu</span>
                                <Menu className="w-6 h-6" fill="currentColor" />
                            </button>
                        </div>
                        <AnimatePresence>
                            {open && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col w-full lg:flex lg:flex-row lg:w-auto lg:order-1"
                                >
                                    <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                                        {links.map((l) => (
                                            <li key={l.name}>
                                                <NavLink
                                                    to={l.to}
                                                    className={({ isActive }) =>
                                                        `-mx-3 block rounded-lg px-3 py-2 text-base/5 font-semibold transition duration-200 ease hover:bg-black/5 font-[montserrat] ${
                                                            isActive
                                                                ? 'text-secondary-500'
                                                                : 'text-text-primary hover:text-text-secondary'
                                                        }`
                                                    }
                                                >
                                                    {l.text}
                                                </NavLink>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>
            </header>
            <div className="w-full p-[1rem] h-full">
                <Outlet />
            </div>
        </div>
    );
}
