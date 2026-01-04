const { db } = require('../config/firebase');

// SESSION MANAGEMENT
exports.createSession = async (req, res) => {
    try {
        const { domainId, batchId, date, time, durationMinutes, meetLink } = req.body;

        // Hierarchy Validation
        // This ensures data integrity as requested

        // Mock Bypass
        if (batchId === 'batch-a' && domainId === 'web-dev') {
            // Skip DB check for mock data
        } else {
            const batchDoc = await db.collection('batches').doc(batchId).get();
            if (!batchDoc.exists || batchDoc.data().domainId !== domainId) {
                return res.status(400).json({ error: "Invalid Domain/Batch hierarchy" });
            }
        }

        // Generate Unique Time-Bound Code
        // Simple 6-digit code
        const attendanceCode = Math.floor(100000 + Math.random() * 900000).toString();
        const validDuration = 5; // Code valid for 5 minutes
        const expiryTime = new Date(new Date().getTime() + validDuration * 60000);

        const newSession = {
            domainId,
            batchId,
            date,
            time,
            meetLink,
            attendanceCode,
            codeExpiresAt: expiryTime,
            createdAt: new Date()
        };

        const docRef = await db.collection('sessions').add(newSession);
        res.status(201).json({ id: docRef.id, ...newSession });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// MARK ATTENDANCE
exports.markAttendance = async (req, res) => {
    try {
        const { userId, code } = req.body; // User should be authenticated

        // Security check: Ensure user is marking for themselves
        if (req.user.uid !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized: Cannot mark attendance for another user" });
        }

        // 1. Find Session by Code
        // Note: Codes must be unique within valid timeframe. 
        // For specific matches, we might query active sessions only.
        const sessionsQuery = await db.collection('sessions')
            .where('attendanceCode', '==', code)
            .limit(1)
            .get();

        if (sessionsQuery.empty) {
            return res.status(400).json({ error: "Invalid attendance code" });
        }

        const sessionDoc = sessionsQuery.docs[0];
        const sessionData = sessionDoc.data();
        const sessionId = sessionDoc.id;

        // 2. Check Expiry
        const now = new Date();
        // Assuming codeExpiresAt is a Firestore Timestamp or Date object
        const expiresAt = sessionData.codeExpiresAt.toDate ? sessionData.codeExpiresAt.toDate() : new Date(sessionData.codeExpiresAt);

        if (now > expiresAt) {
            return res.status(400).json({ error: "Attendance code expired" });
        }

        // 3. Validate Student Hierarchy (Domain/Batch match)
        let userData;

        // Get User Data
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
        userData = userDoc.data();

        if (userData.domainId !== sessionData.domainId || userData.batchId !== sessionData.batchId) {
            console.warn(`[MarkAttendance] Hierarchy Check Failed: User (${userData.domainId}/${userData.batchId}) vs Session (${sessionData.domainId}/${sessionData.batchId})`);

            // FIXME: In strict production, this should be an error. 
            // For now, if the user has NO batch assigned, or is Admin testing, we might allow it or provide a specific error.

            // STRICT MODE: Uncomment to enforce strict matching
            return res.status(403).json({
                error: `Mismatch: You belong to ${userData.domainId}/${userData.batchId}, but this session is for ${sessionData.domainId}/${sessionData.batchId}`
            });
        }

        // 4. Check Duplicate Attendance
        const existingAttendance = await db.collection('attendance')
            .where('sessionId', '==', sessionId)
            .where('userId', '==', userId)
            .limit(1)
            .get();

        if (!existingAttendance.empty) {
            return res.status(400).json({ error: "Attendance already marked" });
        }

        // 5. Mark Attendance
        const attendanceRecord = {
            userId,
            sessionId,
            batchId: sessionData.batchId,
            domainId: sessionData.domainId,
            status: 'present',
            timestamp: new Date()
        };

        await db.collection('attendance').add(attendanceRecord);

        res.status(200).json({ message: "Attendance marked successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ATTENDANCE STATS
exports.getAttendanceStats = async (req, res) => {
    try {
        const { userId } = req.params;

        // Handle Mock User


        // 1. Get User Info (for Batch ID)
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
        const userData = userDoc.data();
        const { batchId, domainId, name } = userData;

        // Fetch Domain Name
        let domainName = 'Unknown Domain';
        if (domainId) {
            const domainDoc = await db.collection('domains').doc(domainId).get();
            if (domainDoc.exists) domainName = domainDoc.data().name;
        }

        // 2. Get Total Sessions for this Batch
        const sessionsQuery = await db.collection('sessions')
            .where('batchId', '==', batchId)
            .get();

        const totalSessions = sessionsQuery.empty ? 0 : sessionsQuery.docs.length;

        // 3. Get Sessions Attended by User
        const attendanceQuery = await db.collection('attendance')
            .where('userId', '==', userId)
            .get();

        const attendedSessions = attendanceQuery.empty ? 0 : attendanceQuery.docs.length;

        // 4. Calculate Stats
        const percentage = totalSessions === 0 ? 0 : Math.round((attendedSessions / totalSessions) * 100);
        const isEligible = percentage >= 75;

        res.status(200).json({
            studentName: name || 'Student',
            domainName,
            totalSessions,
            attendedSessions,
            percentage,
            isEligible,
            minRequired: 75
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET ALL SESSIONS (Admin)
exports.getSessions = async (req, res) => {
    try {
        const { domainId, batchId } = req.query;
        let query = db.collection('sessions');

        if (domainId) {
            query = query.where('domainId', '==', domainId);
        }
        if (batchId) {
            query = query.where('batchId', '==', batchId);
        }

        const snapshot = await query.get();
        const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET STUDENT SESSIONS (with attendance status)
exports.getStudentSessions = async (req, res) => {
    try {
        const { userId } = req.params;



        // Get user info
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
        const userData = userDoc.data();
        const { batchId } = userData;

        // Get all sessions for student's batch
        const sessionsSnapshot = await db.collection('sessions')
            .where('batchId', '==', batchId)
            .get();

        // Get all attendance records for this student
        const attendanceSnapshot = await db.collection('attendance')
            .where('userId', '==', userId)
            .get();

        // Create a Set of attended session IDs for O(1) lookup
        const attendedSessionIds = new Set();
        attendanceSnapshot.docs.forEach(doc => {
            attendedSessionIds.add(doc.data().sessionId);
        });

        const sessions = sessionsSnapshot.docs.map(doc => {
            const sessionData = doc.data();
            const sessionId = doc.id;

            // Determine status
            const attended = attendedSessionIds.has(sessionId);

            // Format time/date if needed, but backend sends as is
            return {
                id: sessionId,
                ...sessionData,
                attended
            };
        });

        // Sort by date (descending)
        sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

