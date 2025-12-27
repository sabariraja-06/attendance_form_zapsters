const { db } = require('../config/firebase');

// SESSION MANAGEMENT
exports.createSession = async (req, res) => {
    try {
        const { domainId, batchId, date, time, durationMinutes, meetLink } = req.body;

        // Hierarchy Validation
        // This ensures data integrity as requested
        const batchDoc = await db.collection('batches').doc(batchId).get();
        if (!batchDoc.exists || batchDoc.data().domainId !== domainId) {
            return res.status(400).json({ error: "Invalid Domain/Batch hierarchy" });
        }

        // Generate Unique Time-Bound Code
        // Simple 6-digit code
        const attendanceCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryTime = new Date(new Date().getTime() + (durationMinutes || 5) * 60000); // Default 5 mins valid

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
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
        const userData = userDoc.data();

        if (userData.domainId !== sessionData.domainId || userData.batchId !== sessionData.batchId) {
            return res.status(403).json({ error: "You are not assigned to this session's batch/domain" });
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

        // 1. Get User Info (for Batch ID)
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
        const userData = userDoc.data();
        const { batchId, domainId, name } = userData;

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
            studentName: name,
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
