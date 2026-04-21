import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';
import DropdownParent from '../components/DropdownParent';
import useSetUserImage from '../utils/useSetUserImage';

type AdminLink = {
    name: string;
    text: string;
    to: string;
};

const links: AdminLink[] = [
    { name: 'users', text: 'Inicio', to: '/admin/dashboard' },
    { name: 'currencys', text: 'Divisas', to: '/admin/currencys' },
    { name: 'calendar', text: 'Calendario', to: '/admin/calendar' },
];

export default function AdminHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const auth = useAuth();
    const [open, setOpen] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const avatarRef = useRef(null);
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

    useSetUserImage();

    const{userImage } = useAuth() || {};

    return (
        <div>
            <header className="w-full border-border border-1">
                <nav className="bg-white max-w-[1450px] mx-auto border-gray-200 px-4 lg:px-6 py-5">
                    <div className="flex flex-wrap justify-center md:justify-between items-center -xl gap-2">
                        <Link to="/" className="flex items-center">
                            <img src="/logo_white.png" className="mr-3 h-6 sm:h-10" alt="WAYMARK" />
                            <span className="self-center text-xl font-semibold whitespace-nowrap rotulo text-primary-500">
                                WAYMARK
                            </span>
                        </Link>
                        <div className="flex items-center gap-2 lg:order-2">
                            <DropdownParent classes="hidden md:flex items-center" hideFunction={setShowMenu}>
                                <button
                                    ref={avatarRef}
                                    type="button"
                                    className="flex text-sm bg-gray-800 rounded-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                                    onClick={() => setShowMenu((v) => !v)}
                                    title="Opciones de cuenta"
                                    aria-label="Opciones de cuenta"
                                >
                                    <img
                                        className="w-8 h-8 rounded-full"
                                        src={userImage || "https://flowbite.com/docs/images/people/profile-picture-5.jpg"}
                                        alt="Perfil de usuario"
                                    />
                                </button>
                                <CustomDropdown
                                    anchorRef={avatarRef}
                                    visible={showMenu}
                                    align="right"
                                    width="200px"
                                    layoutId="admin_user_menu"
                                >
                                    <p className="text-xs font-bold text-left px-2 font-[cabin] mb-2">Mi cuenta</p>
                                    <div className="w-full bg-border h-[1px]" />
                                    <ul>
                                        <li className="py-3 px-2 text-left">
                                            <button
                                                onClick={() => { setShowMenu(false); navigate('/admin/profile'); }}
                                                className="text-sm font-semibold hover:underline"
                                            >
                                                Mi perfil
                                            </button>
                                        </li>
                                        <li><div className="w-full bg-border h-[1px]" /></li>
                                        <li className="py-3 px-2 text-left">
                                            <button
                                                onClick={() => auth?.handleLogout?.()}
                                                className="text-red-600 font-semibold hover:underline text-sm"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </li>
                                    </ul>
                                </CustomDropdown>
                            </DropdownParent>
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
                        <AnimatePresence mode='wait'>
                            {open && (
                                <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col w-full lg:flex lg:flex-row lg:w-auto lg:order-1"
                                >
                                    <motion.ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                                        {links.map((l) => (
                                            <motion.li key={l.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.2, delay: 0.1 }}
                                            >
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
                                            </motion.li>
                                        ))}
                                        <motion.li
                                            className="lg:hidden"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2, delay: 0.15 }}
                                        >
                                            <button
                                                onClick={() => auth?.handleLogout?.()}
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base/5 font-semibold text-red-600 hover:bg-black/5 font-[montserrat] mx-auto"
                                            >
                                                Cerrar sesión
                                            </button>
                                        </motion.li>
                                    </motion.ul>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </nav>
            </header>
            <main className="w-full h-full">
                <Outlet />
            </main>
        </div>
    );
}
