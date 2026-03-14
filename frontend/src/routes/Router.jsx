import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from '../modules/propiedades/Landing'
import Ejemplo from '../modules/propiedades/Ejemplo'
import RutaRandom from '../modules/propiedades/RutaRandom'
import Page404 from '../modules/paginas_error/404'
import PropiedadPage from '../modules/propiedades/PropiedadPage'

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Landing />} />
                <Route path='/rooms/:nombre' element={<PropiedadPage />} />
                <Route path='ruta' element={<Ejemplo />} >
                    <Route path='subruta' element={<RutaRandom />} />
                </Route>
                <Route path='*' element={<Page404 />} />
            </Routes>
        </BrowserRouter>
    )
}
