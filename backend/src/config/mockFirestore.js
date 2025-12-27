class MockFirestore {
    constructor() {
        this.data = {
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
                'ui-ux': { id: 'ui-ux', name: 'UI/UX Design' },
                'cyber-security': { id: 'cyber-security', name: 'Cybersecurity' },
                'game-dev': { id: 'game-dev', name: 'Game Development' },
                'ai-ml': { id: 'ai-ml', name: 'AI & ML' },
                'power-bi': { id: 'power-bi', name: 'Power BI' }
            },
            sessions: {
                'demo-session-1': {
                    id: 'demo-session-1',
                    domainId: 'web-dev',
                    batchId: 'batch-a',
                    attendanceCode: '123456',
                    codeExpiresAt: new Date(Date.now() + 1000 * 60 * 60), // Expires in 1 hour
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
            attendance: {} // Stores attendance records
        };
        console.log("⚠️ Using In-Memory Mock Firestore");
    }

    collection(name) {
        return new MockCollection(this.data, name);
    }
}

class MockCollection {
    constructor(dbData, name) {
        this.dbData = dbData;
        this.name = name;
        if (!this.dbData[name]) this.dbData[name] = {};
    }

    doc(id) {
        return new MockDoc(this.dbData, this.name, id);
    }

    async add(data) {
        const id = Math.random().toString(36).substr(2, 9);
        this.dbData[this.name][id] = { id, ...data };
        return { id };
    }

    where(field, op, value) {
        return new MockQuery(this.dbData, this.name).where(field, op, value);
    }
}

class MockDoc {
    constructor(dbData, collection, id) {
        this.dataStore = dbData[collection];
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
}

class MockQuery {
    constructor(dbData, collection) {
        this.allDocs = Object.values(dbData[collection] || {});
        this.filteredDocs = this.allDocs;
    }

    where(field, op, value) {
        this.filteredDocs = this.filteredDocs.filter(doc => {
            if (op === '==') return doc[field] === value;
            return true; // Simplified
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
