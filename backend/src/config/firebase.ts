import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

export const initializeFirebase = () => {
    try {
        // Initialize Firebase Admin SDK
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });

        db = admin.firestore();
        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        throw error;
    }
};

export const getFirestore = (): admin.firestore.Firestore => {
    if (!db) {
        throw new Error('Firestore not initialized. Call initializeFirebase first.');
    }
    return db;
};

export { admin };
