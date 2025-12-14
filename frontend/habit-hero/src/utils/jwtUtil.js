// Decode JWT token and extract userId
export const decodeToken = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }
        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch (error) {
        return null;
    }
};

// Check if token is expired
export const isTokenExpired = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
        return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
};

// Extract userId from JWT token
export const getUserIdFromToken = (token) => {
    const payload = decodeToken(token);
    if (payload && payload.sub) {
        return payload.sub;
    }
    return null;
};
