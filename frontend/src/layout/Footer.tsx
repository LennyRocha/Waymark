import CustomLink from '../components/CustomLink';

export default function Footer() {
    return (
        <footer className="bg-border w-full text-white py-8">
            <div className="container mx-auto px-2">
                <div className="-mx-4 flex flex-wrap justify-between">
                    <div className="text-text-secondary px-4 w-full text-center sm:w-auto sm:text-left">
                        Copyright © 2026-
                        {new Date().getFullYear() + ' '}
                        Synverge Inc. Todos los derechos reservados.
                    </div>
                    <div className="text-text-secondary px-4 w-full text-center sm:w-auto sm:text-left">
                        Powered by <CustomLink to="www.utez.edu.mx">UTEZ</CustomLink>
                    </div>
                </div>
            </div>
        </footer>
    );
}
