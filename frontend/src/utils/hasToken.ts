export default function hasToken() {
    const token = localStorage.getItem("token");
    return !!token;
}
