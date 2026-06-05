// Firebase Client SDK - para uso en el navegador
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3mrTd9AGqQO9CwHGHRK7Rp6ehkmBOyNM",
  authDomain: "crm-3640a.firebaseapp.com",
  projectId: "crm-3640a",
  storageBucket: "crm-3640a.firebasestorage.app",
  messagingSenderId: "924697925131",
  appId: "1:924697925131:web:b3cef2e884a103e856590e"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
