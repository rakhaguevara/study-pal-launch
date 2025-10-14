import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDY8v3SLwPtMQKN4G68vQ_It6BcaihiWew",
  authDomain: "studypal-67e38.firebaseapp.com",
  projectId: "studypal-67e38",
  storageBucket: "studypal-67e38.appspot.com",
  messagingSenderId: "973792751959",
  appId: "1:973792751959:web:b5e9a8d3c1f2a6e7d4b5c3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
