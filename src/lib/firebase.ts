// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlNwgW6FSm1njQvcXS-PqX5z_lEMVeXC4",
  authDomain: "vit-hackthon.firebaseapp.com",
  projectId: "vit-hackthon",
  storageBucket: "vit-hackthon.firebasestorage.app",
  messagingSenderId: "710832263532",
  appId: "1:710832263532:web:1e5e039b56425d373d2349",
  measurementId: "G-XGM9Z1YTG1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
