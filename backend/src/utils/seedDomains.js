const { db } = require('../config/firebase');

const REQUIRED_DOMAINS = [
    { id: 'web-dev', name: 'Web Development' },
    { id: 'cyber-security', name: 'Cybersecurity' },
    { id: 'power-bi', name: 'Power BI' },
    { id: 'game-dev', name: 'Game Development' },
    { id: 'aiml', name: 'AIML' },
    { id: 'ui-ux', name: 'UI/UX' }
];

const seedDomains = async () => {
    console.log('🌱 Checking Domain Seeding...');
    try {
        const batch = db.batch ? db.batch() : null; // MockFirestore might not support batch, handle individually if so

        for (const domain of REQUIRED_DOMAINS) {
            const docRef = db.collection('domains').doc(domain.id);

            // Check existence first to avoid overwriting if not needed, 
            // but requirement says "consistent", so maybe ensuring correct name is better.
            // set with merge: true protects other fields but enforces name.

            if (batch) {
                batch.set(docRef, {
                    name: domain.name,
                    isActive: true,
                    updatedAt: new Date()
                }, { merge: true });
            } else {
                // Fallback for MockFirestore or if batch not available
                await docRef.set({
                    name: domain.name,
                    isActive: true,
                    updatedAt: new Date()
                }, { merge: true });
            }
        }

        if (batch) await batch.commit();
        console.log('✅ Domains Seeded Successfully');
    } catch (error) {
        console.error('❌ Domain Seeding Failed:', error);
    }
};

module.exports = seedDomains;
