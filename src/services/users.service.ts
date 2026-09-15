import { firebaseCollections, firebaseFirestore } from '../config/firebase.config';
import { FirebaseFactory } from '../config/firebase.factory';

export interface UserData {
	id: string;
	displayName: string;
	email: string;
	photoURL: string;
	createdAt: number;
}

export const dbUsers = new FirebaseFactory<UserData>(firebaseFirestore, firebaseCollections.users);
