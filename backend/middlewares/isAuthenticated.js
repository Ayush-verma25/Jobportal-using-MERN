import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    try {
        // Get the token from cookies
        const token = req.cookies.token;
        
        // Check if token is missing
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated - Missing token",
                success: false,
            });
        }

        // Check if the secret key is set in environment variables
        if (!process.env.SECRET_KEY) {
            return res.status(500).json({
                message: "Server misconfiguration: Missing SECRET_KEY",
                success: false,
            });
        }

        // Verify the token using jwt.verify (sync) instead of using callback
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // Attach user ID to the request object for later use
        req.id = decoded.userId;

        // Continue to the next middleware or route handler
        next();
    } catch (error) {
        // Handle errors based on the type of error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token has expired',
                success: false,
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Invalid token',
                success: false,
            });
        } else {
            // Internal server error for unexpected issues
            console.error(`Authentication error: ${error.message}`);
            return res.status(500).json({
                message: 'Internal server error',
                success: false,
            });
        }
    }
};

export default isAuthenticated;
