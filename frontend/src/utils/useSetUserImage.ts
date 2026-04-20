import { useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import useGetHost from "../modules/propiedades/hooks/useGetHost";

export default function useSetUserImage(): void {
    const token = localStorage.getItem("access_token");
    const user_id = useMemo(() => {
        if (!token) return null;
        try {
        const decoded: any = jwtDecode(token);
        return decoded.user_id ?? null;
        } catch {
        return null;
        }
    }, [token]);
    const { data: hostData } = useGetHost(user_id);

    useEffect(() => {
        if (hostData?.foto_perfil) {
        localStorage.setItem(
            "user_image",
            hostData.foto_perfil,
        );
        }
    }, [hostData]);
}