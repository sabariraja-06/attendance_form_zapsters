const { db } = require('../config/firebase');

// DOMAIN MANAGEMENT
exports.addDomain = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Domain name required" });

        const newDomain = { name, createdAt: new Date() };
        const docRef = await db.collection('domains').add(newDomain);

        res.status(201).json({ id: docRef.id, ...newDomain });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDomains = async (req, res) => {
    try {
        const snapshot = await db.collection('domains').get();
        const domains = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(domains);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteDomain = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('domains').doc(id).delete();
        res.status(200).json({ message: "Domain deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// BATCH MANAGEMENT
exports.addBatch = async (req, res) => {
    try {
        const { domainId, name, startDate, endDate } = req.body;
        // Strict Hierarchy Check: Domain must exist
        const domainDoc = await db.collection('domains').doc(domainId).get();
        if (!domainDoc.exists) return res.status(404).json({ error: "Domain not found" });

        const newBatch = {
            domainId,
            name,
            startDate,
            endDate,
            createdAt: new Date()
        };
        const docRef = await db.collection('batches').add(newBatch);
        res.status(201).json({ id: docRef.id, ...newBatch });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBatches = async (req, res) => {
    try {
        const { domainId } = req.query;
        let query = db.collection('batches');

        if (domainId) {
            query = query.where('domainId', '==', domainId);
        }

        const snapshot = await query.get();
        let batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Mock Batches for Dev Mode (if DB is empty for this domain)
        if (batches.length === 0 && domainId === 'web-dev') {
            batches = [
                { id: 'batch-a', name: 'Mock Batch A', domainId: 'web-dev', startDate: '2024-01-01', endDate: '2024-12-31' },
                { id: 'batch-b', name: 'Mock Batch B', domainId: 'web-dev', startDate: '2024-01-01', endDate: '2024-12-31' }
            ];
        }

        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('batches').doc(id).delete();
        res.status(200).json({ message: "Batch deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// TUTOR MANAGEMENT
exports.addTutor = async (req, res) => {
    try {
        const { name, email, domainId } = req.body;

        if (!domainId) return res.status(400).json({ error: "Domain ID is required. Please create a domain first." });

        // Domain Validation
        const domainDoc = await db.collection('domains').doc(domainId).get();
        if (!domainDoc.exists) return res.status(404).json({ error: "Domain not found" });

        const newTutor = {
            name,
            email,
            domainId,
            role: 'tutor',
            createdAt: new Date()
        };

        const docRef = await db.collection('users').add(newTutor);
        res.status(201).json({ id: docRef.id, ...newTutor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getTutors = async (req, res) => {
    try {
        const query = db.collection('users').where('role', '==', 'tutor');
        const snapshot = await query.get();
        const tutors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(tutors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteTutor = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('users').doc(id).delete();
        res.status(200).json({ message: "Tutor deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// STUDENT MANAGEMENT
exports.addStudent = async (req, res) => {
    try {
        const { name, email, domainId, batchId } = req.body;

        // Validate Hierarchy
        const batchDoc = await db.collection('batches').doc(batchId).get();
        if (!batchDoc.exists) return res.status(404).json({ error: "Batch not found" });
        if (batchDoc.data().domainId !== domainId) return res.status(400).json({ error: "Batch does not belong to this Domain" });

        // Create User in Firebase Auth (Optional: usually client side or admin sdk)
        // const userRecord = await admin.auth().createUser({ email, displayName: name });

        // Add to Firestore
        const newStudent = {
            name,
            email,
            domainId,
            batchId,
            role: 'student',
            createdAt: new Date()
        };

        const docRef = await db.collection('users').add(newStudent);
        res.status(201).json({ id: docRef.id, ...newStudent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const { domainId, batchId } = req.query;
        let query = db.collection('users').where('role', '==', 'student');

        if (domainId) {
            query = query.where('domainId', '==', domainId);
        }
        if (batchId) {
            query = query.where('batchId', '==', batchId);
        }

        const snapshot = await query.get();
        const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('users').doc(id).delete();
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        // Fetch all base data in parallel
        const [domainsSnapshot, batchesSnapshot, studentsSnapshot] = await Promise.all([
            db.collection('domains').get(),
            db.collection('batches').get(),
            db.collection('users').where('role', '==', 'student').get()
        ]);

        const totalDomains = domainsSnapshot.size;
        const totalBatches = batchesSnapshot.size;
        const totalStudents = studentsSnapshot.size;

        const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Cache session counts per batch
        const batchIds = [...new Set(students.map(s => s.batchId).filter(Boolean))];
        const batchSessionCounts = {};

        await Promise.all(batchIds.map(async (batchId) => {
            const sessionsSnapshot = await db.collection('sessions').where('batchId', '==', batchId).get();
            batchSessionCounts[batchId] = sessionsSnapshot.size;
        }));

        // Lookups for names
        const domainMap = new Map(domainsSnapshot.docs.map(d => [d.id, d.data().name]));
        const batchMap = new Map(batchesSnapshot.docs.map(b => [b.id, b.data().name]));

        const lowAttendanceStudents = [];
        let totalAttendancePercentage = 0;

        // Process students in parallel
        await Promise.all(students.map(async (student) => {
            const batchId = student.batchId;
            const totalSessions = batchSessionCounts[batchId] || 0;

            // Get attendance count
            const attendanceSnapshot = await db.collection('attendance')
                .where('userId', '==', student.id)
                .get();
            const attendedSessions = attendanceSnapshot.size;

            const percentage = totalSessions === 0 ? 0 : (attendedSessions / totalSessions) * 100;
            totalAttendancePercentage += percentage;

            if (percentage < 75) {
                lowAttendanceStudents.push({
                    id: student.id,
                    name: student.name,
                    email: student.email,
                    domainName: domainMap.get(student.domainId) || 'Unknown',
                    batchName: batchMap.get(student.batchId) || 'Unknown',
                    attendancePercentage: Math.round(percentage)
                });
            }
        }));

        const averageAttendance = totalStudents === 0 ? 0 : Math.round(totalAttendancePercentage / totalStudents);

        res.status(200).json({
            totalDomains,
            totalBatches,
            totalStudents,
            studentsBelow75: lowAttendanceStudents.length,
            averageAttendance,
            lowAttendanceStudents
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({ error: error.message });
    }
};
