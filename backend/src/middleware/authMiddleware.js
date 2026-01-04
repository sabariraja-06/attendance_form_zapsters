const { admin, auth } = require('../config/firebase');

/**
 * Authentication Middleware
 * Verifies Firebase ID token from Authorization header
 * Attaches decoded user info to req.user
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Development mode bypass - allow requests without auth in non-production
        if (process.env.NODE_ENV !== 'production') {
            // Check for Authorization header, if not present, use mock admin
            const authHeader = req.headers.authorization;
            const mockEmail = req.headers['x-mock-email'];

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // If specific mock email provided by frontend
                if (mockEmail) {
                    console.log(`[DevAuth] Using mock identity: ${mockEmail}`);
                    req.user = {
                        uid: 'mock-uid-' + mockEmail,
                        email: mockEmail,
                        emailVerified: true,
                        // Role will be fetched by roleMiddleware from DB, 
                        // or we can't determine it here easily without DB lookup.
                        // But roleMiddleware does that lookup!
                        // We just need to ensure roleMiddleware doesn't block us.
                    };
                    return next();
                }

                // Default Mock admin user for development if no email specified
                req.user = {
                    uid: 'dev-admin-001',
                    email: 'admin@zapsters.com',
                    emailVerified: true,
                    role: 'admin'
                };
                return next();
            }
        }

        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authentication token provided'
            });
        }

        const token = authHeader.split('Bearer ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token format'
            });
        }

        // Verify the Firebase ID token
        try {
            const decodedToken = await auth.verifyIdToken(token);

            // Attach user info to request
            req.user = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
            };

            next();
        } catch (verifyError) {
            console.error('Token verification error:', verifyError.message);

            // If we are in dev mode and verification fails (e.g. invalid signature due to missing Service Account),
            // and we really want to allow it?
            // No, that's dangerous. But we can inform the user.

            return res.status(401).json({
                error: 'Unauthorized',
                message: `Token verification failed: ${verifyError.message || 'Invalid token'}`
            });
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication failed'
        });
    }
};

module.exports = authMiddleware;
