import { Outlet } from "react-router-dom"
import useSetPageTitle from "../../utils/setPageTitle"

export default function Ejemplo() {
    useSetPageTitle("About");
  return (
    <div>
        <h1>Esto es de la ruta de ejemplo</h1>
        <Outlet />
    </div>
  )
}
