import { useEffect } from "react";

export default function useSetPageTitle(title){
    useEffect(() => {
        document.title = title;
    })
}