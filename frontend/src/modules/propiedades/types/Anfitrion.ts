export default interface Anfitrion {
        nombre: string;
        apellido_p: string;
        apellido_m?: string;
        telefono: string;
        correo: string;
        foto_perfil: string;
        created_at: string | Date;
}