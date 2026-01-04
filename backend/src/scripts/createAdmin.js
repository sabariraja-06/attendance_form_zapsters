
const { admin, db } = require('../config/firebase');

const createAdmin = async () => {
    const email = 'admin@zapsters.in';
    const password = 'zapstersAdmin123!';

    console.log(`Creating admin user: ${email}...`);

    try {
        // 1. Create in Firebase Authentication
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log('User already exists in Auth. Updating password...');
            await admin.auth().updateUser(userRecord.uid, { password });
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                userRecord = await admin.auth().createUser({
                    email,
                    password,
                    displayName: 'Zapsters Admin',
                    emailVerified: true
                });
                console.log('Successfully created new user in Auth.');
            } else {
                throw e;
            }
        }

        // 2. Create/Update in Firestore with 'admin' role
        console.log('Updating Firestore permissions...');
        await db.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: email,
            name: 'Zapsters Admin',
            role: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        }, { merge: true });

        console.log('✅ Admin Setup Complete!');
        console.log('-----------------------------------');
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
        process.exit(0);

    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
