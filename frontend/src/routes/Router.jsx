import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Landing from '../modules/propiedades/Landing'
import Ejemplo from '../modules/propiedades/Ejemplo'
import RutaRandom from '../modules/propiedades/RutaRandom'
import Page404 from '../modules/paginas_error/404'
import PropiedadPage from '../modules/propiedades/PropiedadPage'
import FiltrosPage from '../modules/propiedades/FiltrosPage'
import GuestHeader from '../layout/GuestHeader'
import HostHeader from '../layout/HostHeader'
import AdminHeader from '../layout/AdminHeader'

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='rooms/:idSlug' element={<PropiedadPage />} />
                <Route path='s/:ciudad_pais/homes' element={<FiltrosPage />} />
                <Route path='ruta' element={<Ejemplo />} >
                    <Route path='subruta' element={<RutaRandom />} />
                </Route>
                <Route path='guest' element={<GuestHeader />} >
                    <Route index element={<Navigate to={"explore"} />} />
                    <Route path='explore' element={<h1 >Vista principal</h1>} />
                    <Route path='favorites' index element={<h1 >Vista de favoritos</h1>} />
                    <Route path='my-trips' index element={<h1 >Vista de mis reservaciones</h1>} />
                    <Route path='profile' index element={<h1 >Vista de mi perfil</h1>
                    } />
                </Route>
                <Route path='host' element={<HostHeader />} >
                    <Route index element={<Navigate to={"today"} />} />
                    <Route path='today' element={<h1 >Vista principal</h1>} />
                    <Route path='calendar' index element={<h1 >Vista de calendario</h1>} />
                    <Route path='listings' index element={<h1 >Vista de mis propiedades</h1>} />
                    <Route path='profile' index element={<h1 >Vista de mi perfil</h1>
                    } />
                    <Route path='explore' index element={<h1 >Vista de alojamientos</h1>} />
                </Route>
                <Route path='admin' element={<AdminHeader />} >
                    <Route index element={<Navigate to={"dashboard"} />} />
                    <Route path='dashboard' element={<h1>Dashboard todo feo</h1>} />
                    <Route path='users' element={<h1 >Vista de usuarios</h1>} />
                    <Route path='documents' index element={<h1 >Vista de documentos</h1>} />
                    <Route path='currencys' index element={<h1 >Vista de mis divisas</h1>} />
                    <Route path='listings' index element={<h1 >Vista de alojamientos</h1>} />
                    <Route path='calendar' index element={<h1 >Vista de calendario</h1>} />
                    <Route path='profile' index element={<h1 >Vista de mi perfil</h1>
                    } />
                </Route>
                <Route path='*' element={<Page404 />} />
            </Routes>
        </BrowserRouter>
    )
}
