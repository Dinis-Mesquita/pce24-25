
import { jwtDecode } from 'jwt-decode';

export function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.id_user;
    } catch (error) {
        console.error("Invalid token");
        return null;
    }
}
