import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import FirebaseFactory from './firebaseFactory';

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firebaseFirestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export const firebaseProvider = new GoogleAuthProvider();

export const firebaseCollections = {
	users: `${process.env.NODE_ENV}_users`,
	messages: `${process.env.NODE_ENV}_messages`,
};

export const users = new FirebaseFactory(firebaseFirestore, firebaseCollections.users);
export const messages = new FirebaseFactory(firebaseFirestore, firebaseCollections.messages);
