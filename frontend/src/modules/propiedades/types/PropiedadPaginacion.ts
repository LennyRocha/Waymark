import Card from "./Card";

export default interface PropiedadPaginacion {
    count: number;
    page: number;
    size: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
    results: Card[];
}