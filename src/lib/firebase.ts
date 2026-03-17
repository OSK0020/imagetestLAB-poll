import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPwGp1eKRg2DxNsexKqwzmq2R-z0x027M",
  authDomain: "image-tester-6842b.firebaseapp.com",
  projectId: "image-tester-6842b",
  storageBucket: "image-tester-6842b.firebasestorage.app",
  messagingSenderId: "222476615501",
  appId: "1:222476615501:web:5822a98be30883afdfc104",
  measurementId: "G-8KK4JE1M48"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
