import { createContext, useState } from "react";

export const AuthContext = createContext();

export default function DataContext({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
}