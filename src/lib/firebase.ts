// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

if (typeof window !== 'undefined') {
  const configStatus = [
    { name: 'API Key', value: firebaseConfig.apiKey },
    { name: 'Auth Domain', value: firebaseConfig.authDomain },
    { name: 'Project ID', value: firebaseConfig.projectId },
  ];
  const isMisconfigured = configStatus.some(item => !item.value);
  if(isMisconfigured){
    console.groupCollapsed('%cFirebase está mal configurado. Clique para ver os detalhes.', 'color: red; font-weight: bold;');
    console.error('ERRO: A conexão com o Firebase falhou. Isso geralmente significa que as variáveis de ambiente não foram carregadas corretamente.');
    configStatus.forEach(item => {
      console.log(`${item.name}: ${item.value ? '✔️ Carregado' : '❌ Ausente'}`);
    });
    console.warn('AÇÃO: 1. Verifique se você criou um arquivo .env na raiz do projeto.');
    console.warn('AÇÃO: 2. Verifique se você copiou e colou TODAS as variáveis NEXT_PUBLIC_... do console do Firebase para o arquivo .env.');
    console.warn('AÇÃO: 3. IMPORTANTE: Reinicie o servidor de desenvolvimento (Ctrl+C, depois `npm run dev`) após salvar o .env.');
    console.groupEnd();
  }
}


// Initialize Firebase
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

// Check if all necessary config values are present
const isConfigComplete = 
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId;

if (getApps().length > 0) {
  app = getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else if (isConfigComplete) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (e) {
    console.error("Falha ao inicializar o Firebase. Verifique sua configuração.", e);
  }
} else {
    // Silencioso no servidor, o console do navegador mostrará o aviso detalhado.
}


export { db, auth, storage };