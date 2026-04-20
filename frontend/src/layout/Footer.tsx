import CustomLink from '../components/CustomLink';

export default function Footer() {
    return (
        <footer className="bg-border w-full text-white py-8 px-[1rem]">
            <div className="max-w-[1375px] mx-auto px-2">
                <div className="-mx-4 flex flex-wrap justify-between">
                    <div className="text-text-secondary w-full text-center sm:w-auto sm:text-left">
                        Copyright © 2026-
                        {new Date().getFullYear() + ' '}
                        Synverge Inc. Todos los derechos reservados.
                    </div>
                    <CustomLink to={"/about"} disabled={false} classN='mx-auto'>
                        Información de la compañia
                    </CustomLink>
                    <div className="text-text-secondary  w-full text-center sm:w-auto sm:text-left flex items-center justify-center gap-1">
                        Powered by <CustomLink disabled={false}  to="https://www.utez.edu.mx">UTEZ</CustomLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}
