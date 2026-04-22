import Propiedad from "./Propiedad";

export default interface PropiedadPaginacion {
    count: number;
    page: number;
    size: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
    results: Propiedad[];
}