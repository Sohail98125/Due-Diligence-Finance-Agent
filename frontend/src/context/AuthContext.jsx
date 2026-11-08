import { useState, useEffect, useContext, createContext, useRef } from 'react';
import { currentUser } from '../services/api.js';
import { logOutUser } from '../services/api.js';
import posthog, { isPosthogConfigured } from '../posthog.js';

const getDistinctId = (user) => user?.id ?? user?._id;

const identifyUser = (user) => {
    const distinctId = getDistinctId(user);

    if (!isPosthogConfigured || !distinctId) return null;

    const personProperties = {
        ...(user.email ? { email: user.email } : {}),
        ...(user.name ? { name: user.name } : {}),
    };

    try {
        posthog.identify(distinctId, personProperties);
        return distinctId;
    } catch (error) {
        console.warn('PostHog identification failed:', error);
        return null;
    }
};

// ================= create context ===================
const AuthContext = createContext(null);

// ================= create Provider ===================
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const identifiedUserId = useRef(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await currentUser();
                const authenticatedUser = data?.user ?? null;
                const distinctId = getDistinctId(authenticatedUser);

                if (distinctId && distinctId !== identifiedUserId.current) {
                    if (identifiedUserId.current) posthog.reset();
                    identifiedUserId.current = identifyUser(authenticatedUser);
                }

                setUser(authenticatedUser);
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
        if (isPosthogConfigured) posthog.reset();
        identifiedUserId.current = null;
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