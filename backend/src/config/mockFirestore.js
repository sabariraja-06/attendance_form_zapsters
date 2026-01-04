const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/mockDb.json');

class MockFirestore {
    constructor() {
        this.data = this.loadData();
    }

    loadData() {
        try {
            if (fs.existsSync(DB_PATH)) {
                console.log("📂 Loading Mock DB from file");
                const fileData = fs.readFileSync(DB_PATH, 'utf8');
                const data = JSON.parse(fileData);

                // Rehydrate dates for session expiry logic if needed
                // But JSON.parse returns strings. The controller handles new Date(expirationString)
                return data;
            }
        } catch (error) {
            console.error("Error loading Mock DB:", error);
        }

        console.log("⚠️ Using Default In-Memory Mock Data");
        return {
            users: {
                'test-student-123': {
                    id: 'test-student-123',
                    domainId: 'web-dev',
                    batchId: 'batch-a',
                    name: 'Test Student',
                    email: 'test@zapsters.com',
                    role: 'student'
                }
            },
            domains: {
                'web-dev': { id: 'web-dev', name: 'Web Development' },
                'ui-ux': { id: 'ui-ux', name: 'UI/UX' },
                'cyber-security': { id: 'cyber-security', name: 'Cybersecurity' },
                'game-dev': { id: 'game-dev', name: 'Game Development' },
                'power-bi': { id: 'power-bi', name: 'Power BI' },
                'aiml': { id: 'aiml', name: 'AIML' }
            },
            sessions: {
                'demo-session-1': {
                    id: 'demo-session-1',
                    domainId: 'web-dev',
                    batchId: 'batch-a',
                    attendanceCode: '123456',
                    codeExpiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // Use string for JSON
                    date: '2024-12-27',
                    time: '10:00 AM'
                }
            },
            batches: {
                'batch-a': {
                    id: 'batch-a',
                    domainId: 'web-dev',
                    name: 'Batch A'
                },
                'batch-b': {
                    id: 'batch-b',
                    domainId: 'ui-ux',
                    name: 'Batch B'
                }
            },
            attendance: {}
        };
    }

    saveData() {
        try {
            const dir = path.dirname(DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2));
            // console.log("💾 Mock DB saved");
        } catch (error) {
            console.error("Error saving Mock DB:", error);
        }
    }

    collection(name) {
        return new MockCollection(this, name);
    }
}

class MockCollection {
    constructor(db, name) {
        this.db = db;
        this.dbData = db.data;
        this.name = name;
        if (!this.dbData[name]) this.dbData[name] = {};
    }

    doc(id) {
        return new MockDoc(this.db, this.name, id);
    }

    async add(data) {
        const id = Math.random().toString(36).substr(2, 9);
        this.dbData[this.name][id] = { id, ...data };
        this.db.saveData();
        return {
            id,
            get: async () => ({ id, data: () => this.dbData[this.name][id], exists: true })
        };
    }

    async set(docId, data) {
        this.dbData[this.name][docId] = { id: docId, ...data };
        this.db.saveData();
        return { id: docId };
    }

    async get() {
        const allDocs = Object.values(this.dbData[this.name] || {});
        return {
            empty: allDocs.length === 0,
            size: allDocs.length,
            docs: allDocs.map(d => ({
                id: d.id,
                data: () => d,
                exists: true
            }))
        };
    }

    where(field, op, value) {
        return new MockQuery(this.db, this.name).where(field, op, value);
    }
}

class MockDoc {
    constructor(db, collection, id) {
        this.db = db;
        this.dataStore = db.data[collection];
        this.collection = collection;
        this.id = id;
    }

    async get() {
        const data = this.dataStore[this.id];
        return {
            exists: !!data,
            id: this.id,
            data: () => data
        };
    }

    async set(data, options) {
        // Init collection if missing (edge case)
        if (!this.db.data[this.collection]) this.db.data[this.collection] = {};
        this.dataStore = this.db.data[this.collection];

        if (options && options.merge && this.dataStore[this.id]) {
            this.dataStore[this.id] = { ...this.dataStore[this.id], ...data, id: this.id };
        } else {
            this.dataStore[this.id] = { ...data, id: this.id };
        }
        this.db.saveData();
        return { success: true };
    }

    async update(data) {
        if (!this.dataStore[this.id]) throw new Error("Document not found");
        this.dataStore[this.id] = { ...this.dataStore[this.id], ...data };
        this.db.saveData();
        return { success: true };
    }

    async delete() {
        if (this.dataStore[this.id]) {
            delete this.dataStore[this.id];
            this.db.saveData();
        }
        return { success: true };
    }
}

class MockQuery {
    constructor(db, collection) {
        this.db = db;
        this.allDocs = Object.values(db.data[collection] || {});
        this.filteredDocs = this.allDocs;
    }

    where(field, op, value) {
        this.filteredDocs = this.filteredDocs.filter(doc => {
            if (op === '==') return doc[field] === value;
            return true; // Simplified for string/number equality
        });
        return this;
    }

    limit(n) {
        this.filteredDocs = this.filteredDocs.slice(0, n);
        return this;
    }

    async get() {
        return {
            empty: this.filteredDocs.length === 0,
            docs: this.filteredDocs.map(d => ({
                id: d.id,
                data: () => d
            }))
        };
    }
}

module.exports = new MockFirestore();
