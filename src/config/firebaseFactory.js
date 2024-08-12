import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';

class FirebaseFactory {
	constructor(firestore, collection) {
		this.collectionName = collection;
		this.firestore = firestore;
	}

	// async loginWithGoogle() {
	// 	const provider = new GoogleAuthProvider();

	// 	try {
	// 		const user = getAuth().currentUser;
	// 		let result = null;
	// 		if (user) {
	// 			result = user;
	// 		} else {
	// 			result = await signInWithPopup(this.auth, provider);
	// 		}

	// 		const existingUser = user ? await this.getByEmail(result.email) : await this.getByEmail(result.user.email);

	// 		if (existingUser) {
	// 			return existingUser;
	// 		} else {
	// 			const newUser = {
	// 				email: result.user.email,
	// 				displayName: result.user.displayName,
	// 				isAdmin: false,
	// 				tasks: [],
	// 			};

	// 			return this.create(newUser);
	// 		}
	// 	} catch (error) {
	// 		// Handle login error
	// 		console.error('Google login error:', error);
	// 		throw error;
	// 	}
	// }

	// async getByEmail(email) {
	// 	try {
	// 		const ref = collection(this.firestore, this.collection);
	// 		const querySnapshot = await getDocs(query(ref, where('email', '==', email)));

	// 		if (querySnapshot.docs.length > 0) {
	// 			return this.getOneDocWithId(querySnapshot.docs[0]);
	// 		}

	// 		return undefined;
	// 	} catch (error) {
	// 		console.error('Error getting user by email:', error);
	// 		throw error;
	// 	}
	// }

	// async logout() {
	// 	try {
	// 		await signOut(this.auth);
	// 		localStorage.setItem('isAuth', JSON.stringify(false));
	// 	} catch (error) {
	// 		// Handle logout error
	// 		console.error('Logout error:', error);
	// 		throw error;
	// 	}
	// }

	getOneDocWithId(doc) {
		return {
			...doc.data(),
			id: doc.id,
		};
	}

	getDocsWithId(docs) {
		return docs.map((doc) => ({
			...doc.data(),
			id: doc.id,
		}));
	}

	async getAll() {
		const ref = collection(this.firestore, this.collectionName);
		const querySnapshot = await getDocs(ref);
		return this.getDocsWithId(querySnapshot.docs);
	}

	async getById(id) {
		const ref = collection(this.firestore, this.collectionName);
		const docRef = doc(ref, id);
		const docSnapshot = await getDoc(docRef);

		if (docSnapshot.exists()) {
			return this.getOneDocWithId(docSnapshot);
		}

		return undefined;
	}

	async create(data) {
		const ref = collection(this.firestore, this.collectionName);
		const docRef = await addDoc(ref, data);
		const docSnapshot = await getDoc(docRef);
		return this.getOneDocWithId(docSnapshot);
	}

	async createUser(data) {
		const { id, ...rest } = data;
		const ref = collection(this.firestore, this.collectionName);
		const docRef = doc(ref, id);
		return setDoc(docRef, rest, { merge: true });
	}

	async update(data) {
		const { id, ...rest } = data;
		const ref = collection(this.firestore, this.collectionName);
		const docRef = doc(ref, id);
		await setDoc(docRef, rest, { merge: true });
	}

	async delete(id) {
		const ref = collection(this.firestore, this.collectionName);
		const docRef = doc(ref, id);
		await deleteDoc(docRef);
	}

	async deleteAll() {
		const ref = collection(this.firestore, this.collectionName);
		const querySnapshot = await getDocs(ref);
		querySnapshot.forEach((doc) => {
			deleteDoc(doc.ref);
		});
	}

	async query(filter) {
		const col = collection(this.firestore, this.collectionName);
		const q = query(col, ...(filter instanceof Array ? filter : [filter]));
		const docs = await getDocs(q);
		return this.getDocsWithId(docs.docs);
	}
}

export default FirebaseFactory;
