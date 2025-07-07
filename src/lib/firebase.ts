// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

// IMPORTANT: Add your Firebase project configuration to the .env file.
// These variables are exposed to the browser, so ensure your Firestore security rules are correctly configured.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

if (getApps().length > 0) {
  app = getApp();
  db = getFirestore(app);
} else if (firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error("Falha ao inicializar o Firebase. Verifique sua configuração.", e);
  }
} else {
    console.warn("A configuração do Firebase não foi encontrada ou está incompleta. Adicione as variáveis de ambiente ao seu arquivo .env para conectar ao Firestore.");
}


export { db };
