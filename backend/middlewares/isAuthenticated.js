import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        // Validate the secret key is available
        if (!process.env.SECRET_KEY) {
            return res.status(500).json({
                message: "Server misconfiguration: Missing SECRET_KEY",
                success: false,
            });
        }

        // Verifying the token
        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    message: err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token',
                    success: false,
                });
            }

            // Attach user ID to request
            req.id = decoded.userId;
            next();
        });
    } catch (error) {
        console.error(`Authentication error: ${error.message}`);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

export default isAuthenticated;
