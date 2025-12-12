import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfileApi } from '../api/userApi';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [loading, setLoading] = useState(true); // To handle initial load
    // const navigate = useNavigate(); // Removed useNavigate from here to avoid context error if used outside Router

    useEffect(() => {
        // Check if token exists on mount
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            // Fetch user details
            getMyProfileApi()
                .then(response => {
                    setUser(response.data);
                })
                .catch(err => {
                    console.error("Failed to fetch user profile on load", err);
                    // Optional: logout() if token is invalid? 
                    // handling gracefully for now
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (newToken, userData = null) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setIsAuthenticated(true);
        if (userData) {
            setUser(userData);
        } else {
            // Fetch user if not provided (e.g. after simple token login)
            getMyProfileApi()
                .then(res => setUser(res.data))
                .catch(err => console.error("Login fetch user failed", err));
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
    };

    const value = {
        user,
        token,
        isAuthenticated,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
