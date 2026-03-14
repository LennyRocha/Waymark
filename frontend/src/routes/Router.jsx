import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from '../modules/propiedades/Landing'
import Ejemplo from '../modules/propiedades/Ejemplo'
import RutaRandom from '../modules/propiedades/RutaRandom'
import Page404 from '../modules/paginas_error/404'
import PropiedadPage from '../modules/propiedades/PropiedadPage'
import FiltrosPage from '../modules/propiedades/FiltrosPage'

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
                <Route path='guest' element={<Ejemplo />} >
                    <Route index element={<RutaRandom />} />
                </Route>
                <Route path='host' element={<Ejemplo />} >
                    <Route index element={<RutaRandom />} />
                </Route>
                <Route path='admin' element={<Ejemplo />} >
                    <Route index element={<RutaRandom />} />
                </Route>
                <Route path='*' element={<Page404 />} />
            </Routes>
        </BrowserRouter>
    )
}
