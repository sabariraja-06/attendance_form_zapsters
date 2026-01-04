const { db } = require('../config/firebase');

/**
 * Role-based Authorization Middleware
 * Checks if user has required role to access endpoint
 * Must be used after authMiddleware
 */
const roleMiddleware = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            // Check if user is authenticated (should be set by authMiddleware)
            if (!req.user || !req.user.uid) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            // Development mode bypass - if user already has role set by authMiddleware, use it
            if (process.env.NODE_ENV !== 'production' && req.user.role) {
                if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                    });
                }
                return next();
            }

            // Get user data from Firestore to check role
            const userDoc = await db.collection('users').doc(req.user.uid).get();

            // If user doesn't exist in Firestore, check by email
            if (!userDoc.exists) {
                const usersQuery = await db.collection('users')
                    .where('email', '==', req.user.email)
                    .limit(1)
                    .get();

                if (usersQuery.empty) {
                    // Check if this is a mock request (dev mode)
                    if (process.env.NODE_ENV !== 'production' && req.user.uid.startsWith('mock-uid-')) {
                        console.log(`[DevRole] Mock user ${req.user.email} not found in DB. Assigning temporary role.`);
                        // Auto-assign role based on email or default to student
                        let tempRole = 'student';
                        if (req.user.email.includes('admin')) tempRole = 'admin';
                        else if (req.user.email.includes('tutor')) tempRole = 'tutor';

                        req.user.role = tempRole;
                        req.user.domainId = 'web-dev'; // Default
                        req.user.batchId = 'batch-a'; // Default
                        return next();
                    }

                    // AUTO-CREATE USER IN DB (Sync from Auth)
                    // This fixes the issue where a user logs in via Google (Frontend) but doesn't exist in Backend DB (Mock or Real)
                    console.log(`[RoleMiddleware] User ${req.user.email} not found in DB. Auto-creating...`);

                    const newUser = {
                        uid: req.user.uid,
                        email: req.user.email,
                        name: req.user.name || 'Student', // info might be missing in token, default to Student
                        role: 'student', // Default role
                        domainId: 'web-dev', // Default domain (User checks/assigns later)
                        batchId: 'batch-a', // Default batch
                        createdAt: new Date()
                    };

                    await db.collection('users').doc(req.user.uid).set(newUser);

                    req.user.role = newUser.role;
                    req.user.userId = req.user.uid;
                    req.user.domainId = newUser.domainId;
                    req.user.batchId = newUser.batchId;
                } else {
                    const userData = usersQuery.docs[0].data();
                    req.user.role = userData.role;
                    req.user.userId = usersQuery.docs[0].id;
                    req.user.domainId = userData.domainId;
                    req.user.batchId = userData.batchId;
                }
            } else {
                const userData = userDoc.data();
                req.user.role = userData.role;
                req.user.userId = userDoc.id;
                req.user.domainId = userData.domainId;
                req.user.batchId = userData.batchId;
            }

            // Check if user has required role
            if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
                });
            }

            next();
        } catch (error) {
            console.error('Role middleware error:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authorization check failed'
            });
        }
    };
};

module.exports = roleMiddleware;
