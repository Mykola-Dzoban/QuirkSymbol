import {
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	updateProfile,
	type User,
} from 'firebase/auth';
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
	/** Реєстрація поштою/паролем — надсилає лист підтвердження, профіль у Firestore не пишемо, поки не підтверджено. */
	signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
	loginWithEmail: (email: string, password: string) => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
	resendVerificationEmail: () => Promise<void>;
	/** Перечитує стан підтвердження пошти з Firebase (лист відкривають в іншій вкладці/пристрої, тож самі не дізнаємось) — викликає `VerifyEmailNotice`. */
	checkEmailVerified: () => Promise<boolean>;
	logout: () => Promise<void>;
	initializeAuthListener: () => () => void;
}

/** Провайдери email/password в Firebase Auth не перекладають коди помилок — мапимо найчастіші самі. */
function authErrorMessage(code: string | undefined, fallback: string): string {
	switch (code) {
		case 'auth/email-already-in-use':
			return 'Ця пошта вже зареєстрована — спробуйте увійти.';
		case 'auth/invalid-email':
			return 'Некоректна адреса пошти.';
		case 'auth/weak-password':
			return 'Пароль надто простий (мінімум 6 символів).';
		case 'auth/user-not-found':
		case 'auth/wrong-password':
		case 'auth/invalid-credential':
			return 'Неправильна пошта або пароль.';
		case 'auth/too-many-requests':
			return 'Забагато спроб — спробуйте пізніше.';
		case 'auth/popup-closed-by-user':
		case 'auth/cancelled-popup-request':
			return '';
		default:
			return code ? `${fallback} (${code})` : fallback;
	}
}

/** users/{uid} створюється лише коли пошта вже підтверджена — Firestore rules інакше відмовлять (`signedIn()` вимагає `email_verified`). */
async function ensureUserProfile(user: User): Promise<UserData | null> {
	if (!user.emailVerified) return null;
	let dbUser = await dbUsers.getById(user.uid);
	if (!dbUser) {
		dbUser = await dbUsers.set(user.uid, {
			displayName: user.displayName || 'Користувач',
			email: user.email || '',
			photoURL: user.photoURL || '',
			createdAt: Date.now(),
		});
	}
	return dbUser;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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
			const message = authErrorMessage(code, 'Не вдалося увійти через Google.');
			if (message) toast.error(message);
		} finally {
			set({ isLoggingIn: false });
		}
	},

	signUpWithEmail: async (email, password, displayName) => {
		try {
			set({ isLoggingIn: true });
			const cred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
			if (displayName.trim()) await updateProfile(cred.user, { displayName: displayName.trim() });
			await sendEmailVerification(cred.user);
			toast.info(`Надіслали лист на ${email.trim()} — підтвердіть пошту, щоб продовжити.`);
		} catch (error) {
			toast.error(authErrorMessage((error as { code?: string })?.code, 'Не вдалося зареєструватись.'));
		} finally {
			set({ isLoggingIn: false });
		}
	},

	loginWithEmail: async (email, password) => {
		try {
			set({ isLoggingIn: true });
			await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
		} catch (error) {
			toast.error(authErrorMessage((error as { code?: string })?.code, 'Не вдалося увійти.'));
		} finally {
			set({ isLoggingIn: false });
		}
	},

	resetPassword: async (email) => {
		try {
			await sendPasswordResetEmail(firebaseAuth, email.trim());
			toast.success(`Надіслали посилання для відновлення пароля на ${email.trim()}.`);
		} catch (error) {
			toast.error(authErrorMessage((error as { code?: string })?.code, 'Не вдалося надіслати лист.'));
		}
	},

	resendVerificationEmail: async () => {
		const current = firebaseAuth.currentUser;
		if (!current) return;
		try {
			await sendEmailVerification(current);
			toast.success('Лист надіслано ще раз.');
		} catch (error) {
			toast.error(authErrorMessage((error as { code?: string })?.code, 'Не вдалося надіслати лист.'));
		}
	},

	checkEmailVerified: async () => {
		const current = firebaseAuth.currentUser;
		if (!current) return false;
		await current.reload();
		if (!current.emailVerified) return false;
		// Firestore rules перевіряють `email_verified` у ID-токені, а не в живому `User` — токен
		// кешований і не оновлюється сам по собі, поки клейм на бекенді не був `true` при видачі.
		await current.getIdToken(true);
		const dbUser = await ensureUserProfile(current).catch(() => get().dbUser);
		set({ user: current, dbUser });
		return true;
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
				const dbUser = await ensureUserProfile(currentUser);
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
