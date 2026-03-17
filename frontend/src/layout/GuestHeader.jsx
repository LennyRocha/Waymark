/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react'
import { Link, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion';

export default function GuestHeader() {
    const navigate = useNavigate();
    const location = useLocation();
    const links = [
        { name: "explore", text: "Explorar", to: "/guest/explore" },
        { name: "favorites", text: "Favoritos", to: "/guest/favorites" },
        { name: "my-trips", text: "Mis reservaciones", to: "/guest/my-trips" },
    ];
    const [open, setOpen] = useState(false);
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);
    return (
        <div>
            <header className="bg-white border-border border-1">
                <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 lg:px-8 py-4">
                    <div className="flex lg:flex-1">
                        <Link to="/" className="-m-1.5 p-1.5">
                            <span className="sr-only rotulo">WAYMARK</span>
                            <img src="/logo_white.png" alt="" className="h-12 aspect-square w-auto" />
                        </Link>
                    </div>
                    <div className="flex lg:hidden">
                        <button type="button"
                            /* command="show-modal" commandfor="mobile-menu" */
                            onClick={() => setOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400">
                            <span className="sr-only">Open main menu</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6">
                                <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" stroke-linecap="round" strokeLineJoin="round" />
                            </svg>
                        </button>
                    </div>
                    <div className="hidden lg:flex lg:gap-x-12">
                        <>
                            {links.map((l, index) => (
                                <NavLink
                                    key={index}
                                    to={l.to}
                                    className={({ isActive }) =>
                                        `text-sm/6 font-semibold font-[montserrat] border-b-3 transition duration-200 ease ${isActive
                                            ? "text-secondary-500 border-secondary-500"
                                            : "text-text-primary hover:text-text-secondary border-transparent"
                                        }`
                                    }
                                >
                                    {l.text}
                                </NavLink>
                            ))}
                        </>
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end gap-2">
                        <p className='font-bold' onClick={() => navigate("/")}>Conviertete en anfitrión</p>
                        <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600" onClick={() => navigate("/guest/profile")}>
                            <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                        </button>
                    </div>
                </nav>
                <AnimatePresence mode="wait">
                    {
                        open &&
                        <motion.div
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            id="mobile-menu" className="backdrop:bg-transparent lg:hidden">
                            <div tabindex="0" className="fixed inset-0 focus:outline-none">
                                <div
                                    className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
                                    <div className="flex items-center justify-between">
                                        <Link to="/" className="-m-1.5 p-1.5">
                                            <span className="sr-only rotulo">WAYMARK</span>
                                            <img src="/logo_white.png" alt="" className="h-12 aspect-square w-auto" />
                                        </Link>
                                        <button type="button" /*command="close" commandfor="mobile-menu" */ className="-m-2.5 rounded-md p-2.5 text-gray-400"
                                            onClick={() => setOpen(false)}>
                                            <span className="sr-only">Close menu</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" data-slot="icon" aria-hidden="true" className="size-6">
                                                <path d="M6 18 18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="mt-6 flow-root">
                                        <div className="-my-6 divide-y divide-white/10 flex flex-col items-center justify-center">
                                            <div className="space-y-2 py-6 w-full flex-1">
                                                <>
                                                    {links.map((l, index) => (
                                                        <NavLink
                                                            key={index}
                                                            to={l.to}
                                                            className={({ isActive }) =>
                                                                `-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold transition duration-200 ease hover:bg-black/5 font-[montserrat]  ${isActive
                                                                    ? "text-secondary-500"
                                                                    : "text-text-primary hover:text-text-secondary"
                                                                }`
                                                            }
                                                        >
                                                            {l.text}
                                                        </NavLink>
                                                    ))}
                                                </>
                                                <NavLink
                                                    to={"/host/profile"}
                                                    className={({ isActive }) =>
                                                        `-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold  hover:bg-black/5 font-[montserrat] transition duration-200 ease  ${isActive
                                                            ? "text-secondary-500"
                                                            : "text-text-primary hover:text-text-secondary"
                                                        }`
                                                    }
                                                >
                                                    Mi perfil
                                                </NavLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    }
                </AnimatePresence>
            </header>
            <div className="w-full p-[1rem] h-full">
                <Outlet />
            </div>
        </div>
    )
}