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

exports.getBatches = async (req, res) => {
    try {
        const { domainId } = req.query;
        let query = db.collection('batches');

        if (domainId) {
            query = query.where('domainId', '==', domainId);
        }

        const snapshot = await query.get();
        const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(batches);
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
