import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken, setToken, removeToken, type User } from '../lib/api';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
    register: (name: string, email: string, password: string, phone: string, address: string) => Promise<{ success: boolean; error?: string }>;
    setSession: (token: string, user: User) => void;
    logout: () => void;
    updateProfile: (data: Partial<{ name: string; phone: string; address: string }>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Check for existing token on mount
    useEffect(() => {
        const token = getToken();
        if (token) {
            // Validate token by fetching user data
            api.auth.me()
                .then(response => {
                    if (response.success && response.data) {
                        setUser(response.data);
                    } else {
                        removeToken();
                        navigate('/login');
                    }
                })
                .catch(() => {
                    removeToken();
                    navigate('/login');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [navigate]);

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await api.auth.login(email, password);

            if (response.success && response.data) {
                setToken(response.data.token);
                setUser(response.data.user);
                return { success: true, user: response.data.user };
            }

            return { success: false, error: 'Invalid credentials' };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            return { success: false, error: message };
        }
    }, []);

    const register = useCallback(async (name: string, email: string, password: string, phone: string, address: string) => {
        try {
            const response = await api.auth.register({ name, email, password, phone, address });

            // Just return success, don't login yet as we need OTP
            if (response.success) {
                return { success: true };
            }

            return { success: false, error: 'Registration failed' };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            return { success: false, error: message };
        }
    }, []);

    const setSession = useCallback((token: string, userData: User) => {
        setToken(token);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        removeToken();
        setUser(null);
    }, []);

    const updateProfile = useCallback(async (data: Partial<{ name: string; phone: string; address: string }>) => {
        try {
            const response = await api.auth.updateProfile(data);
            if (response.success && response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        register,
        setSession,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export type { User };
export default AuthContext;
