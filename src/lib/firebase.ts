import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBPwGp1eKRg2DxNsexKqwzmq2R-z0x027M",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "image-tester-6842b.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "image-tester-6842b",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "image-tester-6842b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "222476615501",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:222476615501:web:5822a98be30883afdfc104",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-8KK4JE1M48"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Force HTTP Long-Polling to bypass corporate firewalls, adblockers, and WebSocket blockers
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const googleProvider = new GoogleAuthProvider();
