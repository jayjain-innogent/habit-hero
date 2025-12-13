// Decode JWT token and extract userId
export const decodeToken = (token) => {
    try {
        // JWT format: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid token format');
            return null;
        }

        // Decode the payload (second part)
        const payload = JSON.parse(atob(parts[1]));
        console.log('Decoded JWT payload:', payload);
        return payload;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

// Check if token is expired
export const isTokenExpired = (token) => {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) {
        console.warn('No expiration in token');
        return false;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    console.log('Token expiration check - exp:', payload.exp, 'now:', now, 'expired:', isExpired);
    return isExpired;
};

// Extract userId from JWT token
export const getUserIdFromToken = (token) => {
    const payload = decodeToken(token);
    if (payload && payload.sub) {
        console.log('Extracted userId from token:', payload.sub);
        return payload.sub; // 'sub' is the userId (setSubject in backend)
    }
    console.warn('No userId found in token');
    return null;
};
