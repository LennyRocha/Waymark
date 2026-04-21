import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import Landing from '../modules/propiedades/Landing';
import Page404 from '../modules/paginas_error/404';
import PropiedadPage from '../modules/propiedades/PropiedadPage';
import FiltrosPage from '../modules/propiedades/FiltrosPage';
import AdminHeader from '../layout/AdminHeader';
import AdministrarPropiedad from '../modules/propiedades/AdministrarPropiedad';
import NuevaPropiedad from '../modules/propiedades/NuevaPropiedad';
import MisPropiedades from '../modules/propiedades/MisPropiedades';
import MisFavoritos from '../modules/propiedades/MisFavoritos';
import TabsScreen from '../layout/GuestTabs';
import Login from '../modules/cuentas/Login';
import Registro from '../modules/cuentas/Registro';
import Perfil from '../modules/cuentas/Perfil';
import Page403 from '../modules/paginas_error/403';
import MisViajes from '../modules/reservas/MisViajes';
import Solicitudes from '../modules/reservas/Solicitudes';
import { useAuth } from '../context/AuthContext';
import About from '../modules/paginas_error/About';
import DivisasPage from '../modules/divisas/DivisasPage';

/** Requiere sesión iniciada. Sin rol requerido = cualquier usuario autenticado. */
function PrivateRoute({ children, role }: Readonly<{ children: ReactNode; role?: string | string[] }>) {
    const auth = useAuth();
    if (!auth?.isAuthenticated) return <Navigate to="/login" replace />;
    if (role) {
        const allowed = Array.isArray(role) ? role : [role];
        if (!auth?.userRole || !allowed.includes(auth.userRole)) {
            return <Navigate to="/403" replace />;
        }
    }
    return <>{children}</>;
}

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<TabsScreen />}>
                    <Route index element={<Landing />} />
                    <Route path="login" element={<Login fromModal={false} closeModal={() => {}} />} />
                    {/* Rutas que requieren auth */}
                    <Route path="wishlist" element={<MisFavoritos />} />
                    <Route path="my-trips" element={<PrivateRoute><MisViajes /></PrivateRoute>} />
                    <Route path="profile" element={<PrivateRoute><Perfil /></PrivateRoute>} />
                </Route>
                <Route path="login" element={<Login fromModal={false} closeModal={() => {}} />} />
                <Route path="registro" element={<Registro />} />
                <Route path="about" element={<About />} />
                <Route path="rooms/:idSlug" element={<PropiedadPage />} />
                <Route path="s/:ciudad_pais/homes" element={<FiltrosPage />} />
                <Route path="s/homes" element={<FiltrosPage />} />

                {/* Rutas de anfitrión */}
                <Route path="host" element={<PrivateRoute role={['anfitrion', 'ambos']}><TabsScreen /></PrivateRoute>}>
                    <Route index element={<Navigate to="today" />} />
                    <Route path="today" element={<Solicitudes />} />
                    <Route path="calendar" element={<h1>Vista de calendario</h1>} />
                    <Route path="listings" element={<MisPropiedades />} />
                    <Route path="profile" element={<Perfil />} />
                    <Route path="new-listing" element={<NuevaPropiedad />} />
                    <Route path="manage-listing/:idSlug" element={<AdministrarPropiedad />} />
                </Route>

                {/* Rutas de administrador */}
                <Route path="admin" element={<PrivateRoute role="administrador"><AdminHeader /></PrivateRoute>}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<h1>Dashboard todo feo, vista de usuarios</h1>} />
                    <Route path="currencys" element={<DivisasPage />} />
                    <Route path="calendar" element={<h1>Vista de calendario</h1>} />
                    <Route path="profile" element={<Perfil />} />
                </Route>

                <Route path="404" element={<Page404 />} />
                <Route path="403" element={<Page403 />} />
                <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
        </BrowserRouter>
    );
}