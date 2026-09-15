import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { create } from 'zustand';
import { firebaseAuth, firebaseProvider } from '../config/firebase.config';
import { dbUsers, type UserData } from '../services/users.service';
import { toast } from '../components/UI/toast';

interface AuthState {
	user: User | null;
	dbUser: UserData | null;
	isInitializing: boolean;
	isLoggingIn: boolean;
	loginWithGoogle: () => Promise<void>;
	logout: () => Promise<void>;
	initializeAuthListener: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	dbUser: null,
	isInitializing: true,
	isLoggingIn: false,

	loginWithGoogle: async () => {
		try {
			set({ isLoggingIn: true });
			await signInWithPopup(firebaseAuth, firebaseProvider);
		} catch (error) {
			const code = (error as { code?: string })?.code;
			if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
				toast.error(`Не вдалося увійти через Google${code ? ` (${code})` : ''}.`);
			}
		} finally {
			set({ isLoggingIn: false });
		}
	},

	logout: async () => {
		try {
			await signOut(firebaseAuth);
			set({ user: null, dbUser: null });
		} catch (error) {
			console.error('Помилка виходу:', error);
		}
	},

	initializeAuthListener: () => {
		const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
			if (!currentUser) {
				set({ user: null, dbUser: null, isInitializing: false });
				return;
			}

			try {
				let dbUser = await dbUsers.getById(currentUser.uid);
				if (!dbUser) {
					dbUser = await dbUsers.set(currentUser.uid, {
						displayName: currentUser.displayName || 'Користувач',
						email: currentUser.email || '',
						photoURL: currentUser.photoURL || '',
						createdAt: Date.now(),
					});
				}
				set({ user: currentUser, dbUser, isInitializing: false });
			} catch (error) {
				console.error('Не вдалося завантажити/створити профіль:', error);
				toast.error('Не вдалося завершити вхід. Спробуйте оновити сторінку.');
				set({ user: currentUser, dbUser: null, isInitializing: false });
			}
		});

		return unsubscribe;
	},
}));
