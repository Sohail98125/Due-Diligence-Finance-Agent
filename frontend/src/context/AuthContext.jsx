import { useState, useEffect, useContext, createContext } from 'react';
import { currentUser } from '../services/api.js';
import { logOutUser } from '../services/api.js';

// ================= create context ===================
const AuthContext = createContext(null);

// ================= create Provider ===================
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await currentUser();
                setUser(data?.user ?? null);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [])

    const logout = async () => {
        await logOutUser();
        setUser(null);
    }
    return (
        < AuthContext.Provider value={{ user, setUser, loading, logout }}>
            {children}
        </AuthContext.Provider >
    )
}

// ================= custom hook ===================
export const useAuth = () => useContext(AuthContext);